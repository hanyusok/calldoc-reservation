'use server';



import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { createMeeting } from "./meet";
import { createNotification } from "@/lib/notifications";

export async function confirmPayment(paymentKey: string, orderId: string, amount: number) {
    // 1. Verify Payment (Kiwoom Pay)
    // Server-side verification is now handled via callback/hash check
    // For now, we trust the callback/redirect params as we migrate.

    console.log("Processing Kiwoom payment:", { orderId, amount, paymentKey });

    try {
        // 2. Update Database
        // Find payment to get appointmentId
        const payment = await prisma.payment.findUnique({
            where: { id: orderId },
            include: { appointment: true }
        });

        if (!payment) return { success: false, error: "Payment record not found" };

        // 3. (Optional) Create Google Meet
        let meetingLink = null;
        try {
            meetingLink = await createMeeting({
                appointmentId: payment.appointmentId,
                startDateTime: payment.appointment.startDateTime,
                endDateTime: payment.appointment.endDateTime
            });
        } catch (e) {
            console.error("Meet creation failed", e);
        }

        // Update Payment and Appointment
        await prisma.$transaction([
            prisma.payment.update({
                where: { id: orderId },
                data: {
                    status: 'COMPLETED',
                    confirmedAt: new Date(),
                    method: 'KIWOOM' as any, // Cast to avoid TS error until restart 
                    paymentKey: paymentKey // Store Kiwoom's AuthNo or similar here
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

        // 5. Notify Admin
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true }
        });

        const notificationPromises = admins.map(admin => createNotification({
            userId: admin.id,
            title: "Notifications.paymentTitle",
            message: `Kiwoom Payment of ${amount} KRW confirmed for appointment ${orderId}.`,
            type: 'PAYMENT',
            link: '/admin/appointments'
        }));

        await Promise.all(notificationPromises);

        revalidatePath('/dashboard');
        revalidatePath('/[locale]/admin/appointments');
        revalidatePath('/[locale]/admin/payments');
        return { success: true };

    } catch (err) {
        console.error(err);
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
            PAYMETHOD: "CARD", // Defaulting to CARD as PAYMETHOD is required but often generic in cancel
            AMOUNT: payment.amount.toString(),
            CANCELREQ: "Y",
            TRXID: payment.paymentKey, // DAOUTRX
            CANCELREASON: reason,
            TAXFREEAMT: "0"
        };

        // Step 1: Ready Request
        const readyUrl = "https://apitest.kiwoompay.co.kr/pay/ready";
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
        const { TOKEN, RETURNURL } = readyData;

        if (!TOKEN || !RETURNURL) {
            console.error("Kiwoom Cancel Ready Failed", readyData);
            return { success: false, error: "Failed to initialize cancellation" };
        }

        // Step 2: Final Request
        const finalRes = await fetch(RETURNURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=EUC-KR",
                "Authorization": AUTH_KEY || "",
                "TOKEN": TOKEN
            },
            body: JSON.stringify(payload)
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
