import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.user.id,
                isRead: false,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 20, // Limit to recent 20 unread notifications
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// Optional: POST to mark as read
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { id } = body; // Notification ID to mark as read

        if (id) {
            await prisma.notification.update({
                where: {
                    id: id,
                    userId: session.user.id, // Ensure ownership
                },
                data: {
                    isRead: true,
                },
            });
        } else {
            // Mark all as read
            await prisma.notification.updateMany({
                where: {
                    userId: session.user.id,
                    isRead: false
                },
                data: {
                    isRead: true
                }
            })
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating notification:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
