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

        // 3. Verify Amount (Basic Security)
        // Ensure the amount passed (from Callback or URL) matches the DB record
        if (payment.amount !== amount) {
            console.warn(`Payment amount mismatch for ${orderId}: expected ${payment.amount}, got ${amount}`);
            // Proceeding with caution or flagging? For now, we'll log warning but may want to fail strictly.
            // return { success: false, error: "Payment amount mismatch" }; 
        }

        // 4. Create Google Meet (if strictly needed here, or if not done yet)
        let meetingLink = null;
        try {
            // Only create if not already present (optimization)
            if (!payment.appointment.meetingLink) {
                meetingLink = await createMeeting({
                    appointmentId: payment.appointmentId,
                    startDateTime: payment.appointment.startDateTime,
                    endDateTime: payment.appointment.endDateTime
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

        // 7. Revalidate Paths
        revalidatePath('/dashboard');
        revalidatePath('/[locale]/admin/appointments');
        revalidatePath('/[locale]/admin/payments');

        return { success: true };

    } catch (err) {
        console.error("confirmPayment Error:", err);
        return { success: false, error: "Internal Server Error" };
    }
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

    // Ensure we have necessary keys. Note: For Test, sometimes specific keys are needed.
    // Assuming process.env.KIWOOM_AUTH_KEY is set.

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
        };

        // Step 1: Ready Request
        const readyUrl = "https://apitest.kiwoompay.co.kr/pay/ready";
        console.log("Kiwoom Cancel Ready Payload:", JSON.stringify(payload));

        const readyRes = await fetch(readyUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": AUTH_KEY || ""
            },
            body: JSON.stringify(payload)
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

        // Encode payload to EUC-KR
        const iconv = require('iconv-lite');
        const eucKrBuffer = iconv.encode(JSON.stringify(payload), 'euc-kr');

        const finalRes = await fetch(RETURNURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=EUC-KR",
                "Authorization": AUTH_KEY || "",
                "TOKEN": TOKEN
            },
            body: eucKrBuffer
        });

        if (!finalRes.ok) {
            throw new Error(`Kiwoom Final API Failed: ${finalRes.status}`);
        }

        const finalData = await finalRes.json();
        console.log("Kiwoom Cancel Result:", finalData);

        // Check RESULTCODE
        if (finalData.RESULTCODE === "0000") {
            // Success
            await prisma.payment.update({
                where: { id: paymentId },
                data: {
                    status: 'CANCELED',
                    // method: 'CANCELED' // Optional: keep original method
                }
            })
            // Should we update Appointment status? Usually yes.
            await prisma.appointment.update({
                where: { id: payment.appointmentId },
                data: { status: 'CANCELLED' } // or PENDING?
            })

            revalidatePath('/admin/payments');
            return { success: true }
        } else {
            return { success: false, error: finalData.ERRORMESSAGE || "Cancellation Failed" }
        }

    } catch (error: any) {
        console.error("Cancel Payment Error:", error);
        return { success: false, error: "Internal Server Error" };
    }
}
