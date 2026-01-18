'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role, AppointmentStatus, PrepaidType } from "@prisma/client"
import { revalidatePath } from "next/cache"

async function checkAdmin() {
    const session = await getServerSession(authOptions)
    // @ts-ignore - Role is added in session callback
    if (!session?.user || session.user.role !== Role.ADMIN) {
        throw new Error("Unauthorized: Admin access required")
    }
    return session
}

export async function getAdminStats() {
    await checkAdmin()

    const [totalPatients, totalAppointments, pendingAppointments, totalUsers] = await Promise.all([
        prisma.patient.count(),
        prisma.appointment.count(),
        prisma.appointment.count({ where: { status: 'PENDING' } }),
        prisma.user.count()
    ])

    // Calculate basic revenue (sum of confirmed payments)
    const revenueAgg = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' }
    })

    return {
        totalPatients,
        totalAppointments,
        pendingAppointments,
        totalUsers,
        revenue: revenueAgg._sum.amount || 0
    }
}

export async function getAdminPatients(page = 1, pageSize = 10, search = "") {
    await checkAdmin()

    const skip = (page - 1) * pageSize

    const whereClause = search ? {
        OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { user: { email: { contains: search, mode: 'insensitive' as const } } }
        ]
    } : {}

    const [patients, total] = await Promise.all([
        prisma.patient.findMany({
            where: whereClause,
            include: { user: { select: { email: true, name: true, prepaidBalance: true } } },
            skip,
            take: pageSize,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.patient.count({ where: whereClause })
    ])

    return { patients, total, totalPages: Math.ceil(total / pageSize) }
}

export async function getAdminAppointments(page = 1, pageSize = 10, status?: AppointmentStatus) {
    await checkAdmin()

    const skip = (page - 1) * pageSize

    const whereClause = status ? { status } : {}

    const [appointments, total] = await Promise.all([
        prisma.appointment.findMany({
            where: whereClause,
            include: {
                patient: true,
                payment: true
            },
            skip,
            take: pageSize,
            orderBy: { startDateTime: 'desc' }
        }),
        prisma.appointment.count({ where: whereClause })
    ])

    return { appointments, total, totalPages: Math.ceil(total / pageSize) }
}

export async function updateAppointmentStatus(appointmentId: string, status: AppointmentStatus) {
    await checkAdmin()

    try {
        await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status }
        })
        revalidatePath('/admin/appointments')
        return { success: true }
    } catch (error) {
        console.error("Failed to update status:", error)
        return { error: "Failed to update status" }
    }
}

export async function addPrepaidCredit(userId: string, amount: number, description: string = "Admin Adjustment") {
    await checkAdmin()

    try {
        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { prepaidBalance: { increment: amount } }
            }),
            prisma.prepaidTransaction.create({
                data: {
                    userId,
                    amount,
                    type: PrepaidType.DEPOSIT,
                    description
                }
            })
        ])
        revalidatePath('/admin/patients')
        return { success: true }
    } catch (error) {
        console.error("Failed to add credit:", error)
        return { error: "Failed to add credit" }
    }
}

export async function deductPrepaidCredit(userId: string, amount: number, description: string = "Admin Deduction") {
    await checkAdmin()

    try {
        // Check balance first? Or allow negative? Assuming allow negative for now or simple check.
        // Let's implement check.
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { prepaidBalance: true } })
        if (!user || user.prepaidBalance < amount) {
            return { error: "Insufficient balance" }
        }

        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { prepaidBalance: { decrement: amount } }
            }),
            prisma.prepaidTransaction.create({
                data: {
                    userId,
                    amount,
                    type: PrepaidType.DEDUCT,
                    description
                }
            })
        ])
        revalidatePath('/admin/patients')
        return { success: true }
    } catch (error) {
        console.error("Failed to deduct credit:", error)
        return { error: "Failed to deduct credit" }
    }
}

export async function geAllUsers(search = "") {
    await checkAdmin()

    const whereClause = search ? {
        OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } }
        ]
    } : {}

    // Limit to 20 for autocomplete UI
    return await prisma.user.findMany({
        where: whereClause,
        take: 20,
        select: { id: true, name: true, email: true, prepaidBalance: true }
    })
}

export async function getPrepaidTransactions(page = 1, pageSize = 20) {
    await checkAdmin()
    const skip = (page - 1) * pageSize

    const [transactions, total] = await Promise.all([
        prisma.prepaidTransaction.findMany({
            include: { user: { select: { email: true, name: true } } },
            skip,
            take: pageSize,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.prepaidTransaction.count()
    ])

    return { transactions, total, totalPages: Math.ceil(total / pageSize) }
}
