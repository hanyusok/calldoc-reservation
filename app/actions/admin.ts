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

import { Gender, Relationship } from "@prisma/client"

export async function createPatient(data: {
    userId: string
    name: string
    dateOfBirth: string
    gender: Gender
    relationship: Relationship
    residentNumber?: string
}) {
    await checkAdmin()

    try {
        await prisma.patient.create({
            data: {
                ...data,
                dateOfBirth: new Date(data.dateOfBirth)
            }
        })
        revalidatePath('/admin/patients')
        return { success: true }
    } catch (error) {
        console.error("Failed to create patient:", error)
        return { error: "Failed to create patient" }
    }
}

export async function updatePatient(id: string, data: {
    name?: string
    gender?: Gender
    relationship?: Relationship
    residentNumber?: string
    dateOfBirth?: string
}) {
    await checkAdmin()

    try {
        const updateData: any = { ...data }
        if (data.dateOfBirth) {
            updateData.dateOfBirth = new Date(data.dateOfBirth)
        }

        await prisma.patient.update({
            where: { id },
            data: updateData
        })
        revalidatePath('/admin/patients')
        return { success: true }
    } catch (error) {
        console.error("Failed to update patient:", error)
        return { error: "Failed to update patient" }
    }
}

export async function deletePatient(id: string) {
    await checkAdmin()

    try {
        await prisma.patient.delete({
            where: { id }
        })
        revalidatePath('/admin/patients')
        return { success: true }
    } catch (error) {
        console.error("Failed to delete patient:", error)
        return { error: "Failed to delete patient" }
    }
}

export async function createAppointmentAdmin(data: {
    patientId: string
    startDateTime: string // ISO
    endDateTime: string // ISO
    status: AppointmentStatus
    amount?: number
}) {
    await checkAdmin()

    try {
        await prisma.appointment.create({
            data: {
                patientId: data.patientId,
                startDateTime: new Date(data.startDateTime),
                endDateTime: new Date(data.endDateTime),
                status: data.status,
                payment: {
                    create: {
                        amount: data.amount || 0,
                        method: 'BANK_TRANSFER', // Default
                        status: 'PENDING'
                    }
                }
            }
        })
        revalidatePath('/admin/appointments')
        return { success: true }
    } catch (error) {
        console.error("Failed to create appointment:", error)
        return { error: "Failed to create appointment" }
    }
}

export async function updateAppointmentAdmin(id: string, data: {
    startDateTime?: string
    endDateTime?: string
    status?: AppointmentStatus
}) {
    await checkAdmin()

    try {
        const updateData: any = { ...data }
        if (data.startDateTime) updateData.startDateTime = new Date(data.startDateTime)
        if (data.endDateTime) updateData.endDateTime = new Date(data.endDateTime)

        await prisma.appointment.update({
            where: { id },
            data: updateData
        })
        revalidatePath('/admin/appointments')
        return { success: true }
    } catch (error) {
        console.error("Failed to update appointment:", error)
        return { error: "Failed to update appointment" }
    }
}

export async function deleteAppointment(id: string) {
    await checkAdmin()
    try {
        await prisma.appointment.delete({ where: { id } })
        revalidatePath('/admin/appointments')
        return { success: true }
    } catch (error) {
        console.error("Failed to delete appointment:", error)
        return { error: "Failed to delete appointment" }
    }
}

// Helper to find patients for dropdown
export async function searchPatients(query: string) {
    await checkAdmin()
    return await prisma.patient.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { user: { email: { contains: query, mode: 'insensitive' } } }
            ]
        },
        take: 10,
        include: { user: { select: { email: true } } }
    })
}
