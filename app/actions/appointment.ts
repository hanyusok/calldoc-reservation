'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { addDays, format, isSameDay, parseISO, setHours, setMinutes } from "date-fns"

export async function getDoctorProfile() {
    return await prisma.doctorProfile.findFirst()
}

export async function getAvailableSlots(dateString: string) {
    // Simple slot generation logic (09:00 - 18:00, 30 min intervals)
    // In a real app, checking against existing appointments is needed.

    const date = parseISO(dateString)
    const startHour = 9
    const endHour = 18
    const interval = 30 // minutes

    const slots = []
    let currentTime = setMinutes(setHours(date, startHour), 0)
    const endTime = setMinutes(setHours(date, endHour), 0)

    // Fetch existing appointments for this date
    const doctor = await prisma.doctorProfile.findFirst()
    if (!doctor) return []

    // Get appointments for the selected day
    const nextDay = addDays(date, 1)

    const existingAppointments = await prisma.appointment.findMany({
        where: {
            startDateTime: {
                gte: date,
                lt: nextDay
            },
            status: {
                not: 'CANCELLED' // Ignore cancelled
            }
        }
    })

    while (currentTime < endTime) {
        const timeString = format(currentTime, 'HH:mm')

        // Check if this slot is taken
        const isTaken = existingAppointments.some(appt => {
            const apptStart = appt.startDateTime
            // innovative check: if appointment starts at the same time
            return format(apptStart, 'HH:mm') === timeString
        })

        if (!isTaken) {
            slots.push(timeString)
        }

        currentTime = new Date(currentTime.getTime() + interval * 60000)
    }

    return slots
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
            payment: true
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
}) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return { error: "Unauthorized" }

    const { patientId, dateString, timeString } = data

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
                // paymentStatus removed, using Payment relation
                payment: {
                    create: {
                        amount: 15000, // Example Consultation Fee
                        method: 'BANK_TRANSFER',
                        status: 'PENDING'
                    }
                }
            }
        })

        return { success: true, appointmentId: appointment.id }
    } catch (error) {
        console.error(error)
        return { error: "Failed to create appointment" }
    }
}
