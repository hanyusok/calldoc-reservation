import { prisma } from "@/lib/prisma";

export type NotificationType = "BOOKING" | "PAYMENT" | "SYSTEM" | "INFO";

interface CreateNotificationParams {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
}

export async function createNotification({
    userId,
    title,
    message,
    type,
    link,
}: CreateNotificationParams) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                link,
            },
        });
        return notification;
    } catch (error) {
        console.error("Failed to create notification:", error);
        // Silent fail to not disrupt the main flow
        return null;
    }
}
