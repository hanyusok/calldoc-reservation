'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role, AppointmentStatus, PrepaidType } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { createNotification } from "@/lib/notifications"


async function checkAdmin() {
    const session = await getServerSession(authOptions)
    // @ts-ignore - Role is added in session callback
    if (!session?.user || (session.user as any).role !== Role.ADMIN) {
        console.error("checkAdmin Failed:", { userId: session?.user?.id, role: (session?.user as any)?.role });
        throw new Error("Unauthorized: Admin access required")
    }
    return session
}

async function checkStaffOrAdmin() {
    const session = await getServerSession(authOptions)
    // @ts-ignore
    const role = session?.user?.role
    if (!session?.user || (role !== Role.ADMIN && role !== Role.STAFF)) {
        console.error("checkStaffOrAdmin Failed:", { userId: session?.user?.id, role });
        throw new Error("Unauthorized: Admin or Staff access required")
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

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculate daily revenue (sum of confirmed payments today)
    const revenueAgg = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
            status: 'COMPLETED',
            updatedAt: {
                gte: startOfToday
            }
        }
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
    await checkStaffOrAdmin()

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
    await checkStaffOrAdmin()

    const skip = (page - 1) * pageSize

    const whereClause = status ? { status } : {}

    const [appointments, total] = await Promise.all([
        prisma.appointment.findMany({
            where: whereClause,
            include: {
                patient: true,
                payment: true,
                prescription: true
            },
            skip,
            take: pageSize,
            orderBy: { startDateTime: 'desc' }
        }),
        prisma.appointment.count({ where: whereClause })
    ])

    return { appointments, total, totalPages: Math.ceil(total / pageSize) }
}

export async function getRecentPrescriptions(limit = 5) {
    await checkAdmin()

    return await prisma.prescription.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
            appointment: {
                include: {
                    patient: true
                }
            }
        }
    })
}

export async function updateAppointmentStatus(appointmentId: string, status: AppointmentStatus) {
    await checkStaffOrAdmin()

    try {
        const updatedAppointment = await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status },
            include: { patient: true }
        })

        // Notify User
        if (updatedAppointment && updatedAppointment.patient) {
            await createNotification({
                userId: updatedAppointment.patient.userId,
                title: "Notifications.statusChangeTitle",
                message: "Notifications.statusChangeMsg",
                type: "INFO",
                link: "/dashboard"
            })
        }

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

export async function getAllUsers(search = "") {
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
    await checkStaffOrAdmin()

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
    await checkStaffOrAdmin()

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
    await checkStaffOrAdmin()

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
    await checkStaffOrAdmin()

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
    await checkStaffOrAdmin()

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
        // Get appointment details for notification
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: { patient: true }
        })

        if (!appointment) return { error: "Appointment not found" }

        await prisma.appointment.delete({ where: { id } })

        // Notify User
        if (appointment.patient) {
            await createNotification({
                userId: appointment.patient.userId,
                title: "Notifications.statusChangeTitle",
                message: "Notifications.statusChangeMsg", // Or specific deletion msg
                type: "INFO",
                link: "/dashboard"
            })
        }

        revalidatePath('/admin/appointments')
        return { success: true }
    } catch (error) {
        console.error("Failed to delete appointment:", error)
        return { error: "Failed to delete appointment" }
    }
}

// Helper to find patients for dropdown
export async function searchPatients(query: string) {
    await checkStaffOrAdmin()
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

export async function setAppointmentPayment(appointmentId: string, amount: number) {
    await checkStaffOrAdmin()
    try {
        await prisma.payment.update({
            where: { appointmentId },
            data: { amount }
        })

        // Notify User about Payment
        const apptForPayment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { patient: true }
        })
        if (apptForPayment && apptForPayment.patient) {
            await createNotification({
                userId: apptForPayment.patient.userId,
                title: "Notifications.paymentTitle",
                message: "Notifications.paymentMsg",
                type: "PAYMENT",
                link: "/dashboard"
            })
        }

        // Could optional verify insurance here update other flags
        revalidatePath('/admin/appointments')
        return { success: true }
    } catch (error) {
        console.error("Failed to set payment:", error)
        return { error: "Failed to set payment" }
    }
}

export async function sendMeetingLink(appointmentId: string, meetingLink: string) {
    await checkStaffOrAdmin()
    try {
        await prisma.appointment.update({
            where: { id: appointmentId },
            data: { meetingLink }
        })

        // Notify User about Meeting Link
        const apptForLink = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { patient: true }
        })

        if (apptForLink && apptForLink.patient) {
            await createNotification({
                userId: apptForLink.patient.userId,
                title: "Notifications.meetingTitle",
                message: "Notifications.meetingMsg",
                type: "BOOKING",
                link: "/dashboard"
            })
        }

        revalidatePath('/admin/appointments')
        return { success: true }
    } catch (error) {
        console.error("Failed to update meeting link:", error)
        return { error: "Failed to set meeting link" }
    }
}

// --- User Management Actions ---

export async function getAdminUsers(page = 1, pageSize = 10, search = "") {
    await checkAdmin()

    const skip = (page - 1) * pageSize

    const whereClause = search ? {
        OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } }
        ]
    } : {}

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where: whereClause,
            include: {
                _count: { select: { patients: true } }
            },
            skip,
            take: pageSize,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where: whereClause })
    ])

    return { users, total, totalPages: Math.ceil(total / pageSize) }
}

export async function createAdminUser(data: {
    name?: string
    email: string
    password?: string // In real app, hash this!
    role?: Role
}) {
    await checkAdmin()

    try {
        // Verify email uniqueness
        const existing = await prisma.user.findUnique({ where: { email: data.email } })
        if (existing) return { error: "Email already exists" }

        await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                role: data.role || 'PATIENT',
                // hashed password handling would go here next-auth usually handles this via adapter
                // For this template, we might rely on Account linking or setup password credential specifically
            }
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        console.error("Failed to create user:", error)
        return { error: "Failed to create user" }
    }
}

export async function updateAdminUser(id: string, data: {
    name?: string
    email?: string
    role?: Role
}) {
    await checkAdmin()

    try {
        await prisma.user.update({
            where: { id },
            data
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        console.error("Failed to update user:", error)
        return { error: "Failed to update user" }
    }
}

export async function deleteAdminUser(id: string) {
    await checkAdmin()

    try {
        await prisma.user.delete({
            where: { id }
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        console.error("Failed to delete user:", error)
        return { error: "Failed to delete user" }
    }
}

// --- Payment Management Actions ---

export async function getAdminPayments(page = 1, pageSize = 10, status?: string) {
    await checkAdmin()

    const skip = (page - 1) * pageSize
    const whereClause: any = {}

    if (status) {
        whereClause.status = status;
    }

    const [payments, total] = await Promise.all([
        prisma.payment.findMany({
            where: whereClause,
            include: {
                appointment: {
                    include: {
                        patient: true
                    }
                }
            },
            skip,
            take: pageSize,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.payment.count({ where: whereClause })
    ])

    return { payments, total, totalPages: Math.ceil(total / pageSize) }
}

export async function getPaymentStats() {
    await checkAdmin()

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(startOfToday.getDate() + 1);

    const revenueAgg = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
            status: 'COMPLETED',
            confirmedAt: {
                gte: startOfToday,
                lt: endOfToday
            }
        }
    })

    return {
        dailyRevenue: revenueAgg._sum.amount || 0
    }
}
