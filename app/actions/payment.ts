'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PaymentMethod } from "@prisma/client";

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
    // 1. Get Payment Key
    const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
    });

    if (!payment) {
        return { success: false, error: "Payment not found" };
    }

    try {
        // TODO: Implement Kiwoom Pay Cancel API
        // const response = await fetch('https://api.kiwoompay.co.kr/pay/cancel', ...);

        console.warn("Kiwoom Pay Cancel not yet implemented via API. Manual cancellation required for:", paymentId);

        // Update DB to CANCELED assuming manual process or optimistic update
        await prisma.payment.update({
            where: { id: paymentId },
            data: { status: 'CANCELED' }
        });

        // Also update appointment status if needed
        await prisma.appointment.update({
            where: { id: payment.appointmentId },
            data: { status: 'CANCELLED' }
        });

        revalidatePath('/dashboard');
        return { success: true };

    } catch (error) {
        console.error("Cancel Payment Error:", error);
        return { success: false, error: "Internal Server Error" };
    }
}
