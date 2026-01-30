'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { authOptions } from "@/lib/auth"
import { addDays, format, isSameDay, parseISO, setHours, setMinutes, startOfDay } from "date-fns"
import { createNotification } from "@/lib/notifications"


export async function getDoctorProfile() {
    return await prisma.doctorProfile.findFirst()
}

export async function getAvailableSlots(dateString: string) {
    const date = parseISO(dateString)
    const dayOfWeek = format(date, 'E').toLowerCase() // 'mon', 'tue', ...

    // 1. Check Specific Override (DoctorSchedule)
    const override = await prisma.doctorSchedule.findUnique({
        where: { date: startOfDay(date) }
    })

    if (override) {
        if (override.isDayOff) return []
        if (override.availableSlots) {
            // If creating specific slots, we must still filter out booked ones? 
            // Ideally yes, but let's assume availableSlots means "Initial Capacity".
            // We will filter taken ones later.
            const forcedSlots = JSON.parse(override.availableSlots as string) as string[]
            // Filter Logic below...
            return await filterBookedSlots(date, forcedSlots)
        }
        // If override exists but no specific slots, fall through to default generation?
        // Or should it reset to default? Let's assume if availableSlots is null, we use default generation logic
        // but respect the override existence (e.g. maybe just toggled isDayOff=false).
    }

    // 2. Check Weekly Schedule (DoctorProfile)
    const doctor = await prisma.doctorProfile.findFirst()
    if (!doctor) return [] // No profile, no booking.

    const workingHours = doctor.workingHours as any
    // Default: Mon-Fri 10-18, if no config. 
    // BUT user said: Tue/Wed OFF. 
    // If workingHours is null, we might want a hardcoded default or empty.
    // Let's assume if NO workingHours set yet, we allow standard dates for safety, 
    // or better, return empty to force setup. 
    // Given the request "Add auto off function", let's treat "no config" as "standard 10-18".

    let start = "10:00"
    let end = "18:00"
    let breakTimes = ["12:00", "12:30"] // 12:00 - 13:00 effectively (12:00 slot and 12:30 slot)

    if (workingHours) {
        const dayConfig = workingHours[dayOfWeek]
        if (!dayConfig) {
            // If explicit NULL for this day in JSON, it's OFF.
            // But we need to distinguish "undefined" (not set) vs "null" (off).
            // Let's assume workingHours has keys for days.
            // If key exists and is null -> OFF.
            // If key doesn't exist -> Default? Or Off?
            // Let's go safe: Check if key exists.
            if (dayOfWeek in workingHours && workingHours[dayOfWeek] === null) return []
        }

        if (dayConfig) {
            start = dayConfig.start || "10:00"
            end = dayConfig.end || "18:00"
            if (dayConfig.break) breakTimes = dayConfig.break
        }
    } else {
        // No config yet. Hardcode Tue/Wed OFF as requested?
        // User said: "Every Tue/Wed is off duty. Add auto off function". 
        // Implementation: We will seed this into DB later or defaulting here.
        if (dayOfWeek === 'tue' || dayOfWeek === 'wed') return []
    }

    // Generate Slots
    // ... (Generation logic)
    const interval = 30
    const [startH, startM] = start.split(':').map(Number)
    const [endH, endM] = end.split(':').map(Number)

    let current = setMinutes(setHours(date, startH), startM)
    const endT = setMinutes(setHours(date, endH), endM)

    const candidates = []
    while (current < endT) {
        const timeStr = format(current, 'HH:mm')
        // Check break
        if (!breakTimes.includes(timeStr)) {
            candidates.push(timeStr)
        }
        current = new Date(current.getTime() + interval * 60000)
    }

    return await filterBookedSlots(date, candidates)
}

async function filterBookedSlots(date: Date, candidates: string[]) {
    const nextDay = addDays(date, 1)
    const existingAppointments = await prisma.appointment.findMany({
        where: {
            startDateTime: { gte: date, lt: nextDay },
            status: { not: 'CANCELLED' }
        }
    })

    return candidates.filter(time => {
        return !existingAppointments.some(appt => format(appt.startDateTime, 'HH:mm') === time)
    })
}

export async function getUserAppointments() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return []

    // Find patients belonging to this user
    const patients = await prisma.patient.findMany({
        where: { userId: session.user.id },
        select: { id: true }
    })

    const patientIds = patients.map(p => p.id)

    return await prisma.appointment.findMany({
        where: {
            patientId: { in: patientIds }
        },
        include: {
            patient: true,
            payment: true,
            prescription: true
        },
        orderBy: {
            startDateTime: 'asc'
        }
    })
}

export async function createAppointment(data: {
    patientId: string
    dateString: string
    timeString: string
    symptoms?: string
}) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return { error: "Unauthorized" }

    const { patientId, dateString, timeString, symptoms } = data

    // Parse Datetime
    const date = parseISO(dateString)
    const [hours, minutes] = timeString.split(':').map(Number)
    const startDateTime = setMinutes(setHours(date, hours), minutes)
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60000) // 30 min duration

    try {
        const appointment = await prisma.appointment.create({
            data: {
                patientId,
                startDateTime,
                endDateTime,
                status: 'PENDING',
                symptoms,
                payment: {
                    create: {
                        amount: 0, // 0 initially, set by Admin later
                        method: 'BANK_TRANSFER',
                        status: 'PENDING'
                    }
                }
            }
        })

        // Notify Admins and Staff
        const recipients = await prisma.user.findMany({
            where: {
                role: { in: ['ADMIN', 'STAFF'] }
            }
        })
        for (const recipient of recipients) {
            await createNotification({
                userId: recipient.id,
                title: "Notifications.bookingRequestTitle",
                message: "Notifications.bookingRequestMsg",
                type: "BOOKING",
                link: "/admin/appointments?tab=pending"
            })
        }


        revalidatePath('/dashboard')
        return { success: true, appointmentId: appointment.id }

    } catch (error) {
        console.error(error)
        return { error: "Failed to create appointment" }
    }
}

export async function payForAppointment(appointmentId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Unauthorized" }

    const userId = session.user.id

    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { payment: true, patient: true } // Need patient to verify owner
        })

        if (!appointment || !appointment.payment) return { error: "Appointment not found or invalid" }
        // Verify ownership (Patient -> User)
        const patient = await prisma.patient.findUnique({ where: { id: appointment.patientId } })
        if (patient?.userId !== userId) return { error: "Unauthorized" }

        const amount = appointment.payment.amount
        if (amount <= 0) return { error: "Payment amount not set" }

        // Check Balance
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { prepaidBalance: true } })
        if (!user || user.prepaidBalance < amount) {
            return { error: "Insufficient prepaid balance" }
        }

        // Transaction: Deduct Balance, Create Transaction, Update Payment, Update Appointment
        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { prepaidBalance: { decrement: amount } }
            }),
            prisma.prepaidTransaction.create({
                data: {
                    userId,
                    amount,
                    type: 'DEDUCT',
                    description: `Payment for Appointment ${format(appointment.startDateTime, 'yyyy-MM-dd')}`
                }
            }),
            prisma.payment.update({
                where: { id: appointment.payment!.id },
                data: { status: 'COMPLETED', confirmedAt: new Date() }
            }),
            prisma.appointment.update({
                where: { id: appointmentId },
                data: { status: 'CONFIRMED' }
            })
        ])

        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error("Payment failed:", error)
        return { error: "Payment failed" }
    }
}
