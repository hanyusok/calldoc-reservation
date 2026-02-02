'use server';



import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { createMeeting } from "./meet";
import { createNotification } from "@/lib/notifications";
import { getTranslations } from "next-intl/server";

export async function confirmPayment(paymentKey: string, orderId: string, amount: number) {
    console.log("Processing Kiwoom payment:", { orderId, amount, paymentKey });

    try {
        // 1. Fetch Payment and Appointment details
        const payment = await prisma.payment.findUnique({
            where: { id: orderId },
            include: { appointment: { include: { patient: true } } }
        });

        if (!payment) return { success: false, error: "Payment record not found" };

        // 2. Idempotency Check
        if (payment.status === 'COMPLETED') {
            console.log(`Payment ${orderId} already completed.`);
            return { success: true, message: "Already completed" };
        }

        // 3. Verify Amount
        if (payment.amount !== amount) {
            console.warn(`Payment amount mismatch for ${orderId}: expected ${payment.amount}, got ${amount}`);
            // Note: We currently log the warning but proceed. 
        }

        // 4. Create Google Meet (if strictly needed here, or if not done yet)
        let meetingLink = null;
        try {
            // Only create if not already present (optimization)
            if (!payment.appointment.meetingLink) {
                meetingLink = await createMeeting({
                    appointmentId: payment.appointmentId,
                    startDateTime: payment.appointment.startDateTime,
                    endDateTime: payment.appointment.endDateTime,
                    patientName: payment.appointment.patient?.name
                });
            }
        } catch (e) {
            console.error("Meet creation failed", e);
        }

        // 5. Update Database Transaction
        await prisma.$transaction([
            prisma.payment.update({
                where: { id: orderId },
                data: {
                    status: 'COMPLETED',
                    confirmedAt: new Date(),
                    method: 'KIWOOM' as any,
                    paymentKey: paymentKey // Save the Transaction ID (DAOUTRX)
                }
            }),
            prisma.appointment.update({
                where: { id: payment.appointmentId },
                data: {
                    status: 'CONFIRMED',
                    ...(meetingLink ? { meetingLink } : {})
                }
            })
        ]);

        console.log(`Payment ${orderId} successfully confirmed.`);

        // 6. Notify Admins
        const admins = await prisma.user.findMany({
            where: { role: { in: ['ADMIN', 'STAFF'] } },
            select: { id: true }
        });

        const patientName = payment.appointment.patient?.name || "Unknown";
        const t = await getTranslations({ locale: 'ko', namespace: 'Notifications' });
        const notificationPromises = admins.map(admin => createNotification({
            userId: admin.id,
            title: "Notifications.paymentTitle",
            message: t('paymentConfirmed', { amount: amount.toLocaleString(), patientName }),
            type: 'PAYMENT',
            link: '/admin/appointments'
        }));

        await Promise.all(notificationPromises);

        // Notify Patient
        if (payment.appointment.patient?.userId) {
            const tPayment = await getTranslations({ locale: 'ko', namespace: 'Payment' });
            await createNotification({
                userId: payment.appointment.patient.userId,
                title: tPayment('success.title'),
                message: tPayment('success.linkComingSoon'),
                type: 'PAYMENT',
                link: '/dashboard'
            });
        }


        // 7. Revalidate Paths
        revalidatePath('/dashboard');
        revalidatePath('/[locale]/admin/appointments', 'page');
        revalidatePath('/[locale]/admin/payments', 'page');

        return { success: true };

    } catch (err) {
        console.error("confirmPayment Error:", err);
        return { success: false, error: "Internal Server Error" };
    }
}

// Helper for consistent cancellation processing (used by Action and Callback)
export async function processCancellationSuccess(paymentId: string, paymentKey?: string) {
    console.log(`Processing cancellation success for payment ${paymentId}`);

    // Fetch payment to get appointmentId and patient info for notification
    const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
            appointment: {
                include: {
                    patient: true
                }
            }
        }
    });

    if (!payment) {
        throw new Error(`Payment ${paymentId} not found during cancellation processing`);
    }

    await prisma.$transaction([
        prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: 'CANCELED',
                ...(paymentKey ? { paymentKey } : {})
            }
        }),
        prisma.appointment.update({
            where: { id: payment.appointmentId },
            data: { status: 'CANCELLED' }
        })
    ]);

    // Notify the Patient User
    if (payment.appointment.patient && payment.appointment.patient.userId) {
        try {
            const t = await getTranslations({ locale: 'ko', namespace: 'Notifications' });
            await createNotification({
                userId: payment.appointment.patient.userId,
                title: "Notifications.paymentCanceledTitle", // Key for internal use or direct string if prefered logic
                message: t('paymentCanceledMsg'),
                type: 'PAYMENT',
                link: '/dashboard'
            });
            console.log(`Cancellation notification sent to user ${payment.appointment.patient.userId}`);
        } catch (e) {
            console.error("Failed to send cancellation notification:", e);
        }
    }

    revalidatePath('/dashboard');
    revalidatePath('/[locale]/admin/payments', 'page');
    revalidatePath('/[locale]/admin/appointments', 'page');

    return { success: true };
}

export async function cancelPayment(paymentId: string, reason: string) {
    // Verify user is admin
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== Role.ADMIN) {
        return { success: false, error: "Unauthorized" }
    }

    const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
    })

    if (!payment) {
        return { success: false, error: "Payment not found" }
    }

    // Kiwoom Pay Cancellation Logic
    const KIWOOM_MID = process.env.NEXT_PUBLIC_KIWOOM_MID;
    const AUTH_KEY = process.env.KIWOOM_AUTH_KEY; // Secret Key

    if (!payment.paymentKey) {
        return { success: false, error: "No Payment Key (TRXID) available for cancellation" }
    }

    try {
        const payload = {
            CPID: KIWOOM_MID,
            PAYMETHOD: "CARD",
            AMOUNT: payment.amount.toString(),
            CANCELREQ: "Y",
            TRXID: payment.paymentKey,
            CANCELREASON: reason,
            TAXFREEAMT: "0"
        };

        const iconv = require('iconv-lite');
        // Encode payload to EUC-KR for both requests
        const eucKrPayload = iconv.encode(JSON.stringify(payload), 'euc-kr');

        // Step 1: Ready Request
        const readyUrl = "https://apitest.kiwoompay.co.kr/pay/ready";
        console.log("Kiwoom Cancel Ready Payload:", JSON.stringify(payload));

        const readyRes = await fetch(readyUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=EUC-KR",
                "Authorization": AUTH_KEY || ""
            },
            body: eucKrPayload
        });

        if (!readyRes.ok) {
            throw new Error(`Kiwoom Ready API Failed: ${readyRes.status}`);
        }

        const readyData = await readyRes.json();
        console.log("Kiwoom Ready Response:", readyData);
        const { TOKEN, RETURNURL } = readyData;

        if (!TOKEN || !RETURNURL) {
            console.error("Kiwoom Cancel Ready Failed", readyData);
            return { success: false, error: "Failed to initialize cancellation" };
        }

        // Step 2: Final Request
        console.log("Kiwoom Cancel Final Request to:", RETURNURL);

        const finalRes = await fetch(RETURNURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=EUC-KR",
                "Authorization": AUTH_KEY || "",
                "TOKEN": TOKEN
            },
            body: eucKrPayload
        });

        if (!finalRes.ok) {
            throw new Error(`Kiwoom Final API Failed: ${finalRes.status}`);
        }

        const finalData = await finalRes.json();
        console.log("Kiwoom Cancel Result:", finalData);

        // Check RESULTCODE
        if (finalData.RESULTCODE === "0000") {
            // Success - Use shared helper
            await processCancellationSuccess(paymentId);
            return { success: true }
        } else {
            return { success: false, error: finalData.ERRORMESSAGE || "Cancellation Failed" }
        }

    } catch (error: any) {
        console.error("Cancel Payment Error:", error);
        return { success: false, error: "Internal Server Error" };
    }
}
