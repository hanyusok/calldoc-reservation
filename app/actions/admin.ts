'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { AppointmentStatus, PaymentStatus } from "@prisma/client"

async function isAdmin() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return false

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    return user?.role === 'ADMIN'
}

export async function getAdminAppointments() {
    return await prisma.appointment.findMany({
        include: {
            patient: true,
            payment: true
        },
        orderBy: {
            startDateTime: 'asc'
        }
    })
}

export async function updateAppointmentStatus(appointmentId: string, status: AppointmentStatus, paymentStatus: PaymentStatus) {

    try {
        await prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                status,
                payment: {
                    update: {
                        status: paymentStatus,
                        confirmedAt: paymentStatus === 'COMPLETED' ? new Date() : null
                    }
                }
            }
        })
        revalidatePath('/admin')
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: "Failed to update" }
    }
}
