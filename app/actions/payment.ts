'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { createMeeting } from "./meet";

export async function confirmPayment(paymentKey: string, orderId: string, amount: number) {
    // 1. Verify with Toss API
    const widgetSecretKey = process.env.TOSS_SECRET_KEY;
    const basicAuth = Buffer.from(widgetSecretKey + ":").toString("base64");

    console.log("Verifying payment with Toss:", { orderId, amount });

    try {
        const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
            method: "POST",
            headers: {
                Authorization: `Basic ${basicAuth}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                paymentKey,
                orderId,
                amount,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Toss API Error:", data);
            return { success: false, error: data.message || "Payment verification failed" };
        }

        // 2. Update Database
        // Find payment to get appointmentId
        const payment = await prisma.payment.findUnique({
            where: { id: orderId },
            include: { appointment: true }
        });

        if (!payment) return { success: false, error: "Payment record not found" };

        // 3. (Optional) Create Google Meet
        // We attempt this before DB update. If it fails, we still proceed with payment confirmation
        // but without a link.

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
                    method: 'TOSS',
                    paymentKey: paymentKey
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

        revalidatePath('/dashboard');
        revalidatePath('/[locale]/admin/appointments');
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

    if (!payment || !payment.paymentKey) {
        return { success: false, error: "Payment not found or no payment key" };
    }

    const widgetSecretKey = process.env.TOSS_SECRET_KEY;
    const basicAuth = Buffer.from(widgetSecretKey + ":").toString("base64");

    try {
        const response = await fetch(`https://api.tosspayments.com/v1/payments/${payment.paymentKey}/cancel`, {
            method: "POST",
            headers: {
                Authorization: `Basic ${basicAuth}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                cancelReason: reason
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Toss Cancel Error:", data);
            return { success: false, error: data.message || "Cancellation failed" };
        }

        // Update DB
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
