'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { startOfDay } from "date-fns"

export async function getSchedule(date: Date) {
    // Check specific overrides
    const override = await prisma.doctorSchedule.findUnique({
        where: { date: startOfDay(date) }
    })

    // Get Global Config (DoctorProfile)
    const profile = await prisma.doctorProfile.findFirst()

    return {
        override,
        weekly: profile?.workingHours
    }
}

export async function getGlobalSchedule() {
    const profile = await prisma.doctorProfile.findFirst()
    return profile?.workingHours
}


export async function updateWeeklySchedule(schedule: any) {
    const session = await getServerSession(authOptions)
    // TODO: Add Admin Check

    const profile = await prisma.doctorProfile.findFirst()
    if (profile) {
        await prisma.doctorProfile.update({
            where: { id: profile.id },
            data: { workingHours: schedule }
        })
    } else {
        // Create if not exists (should exist in real app)
        await prisma.doctorProfile.create({
            data: {
                name: 'Doctor',
                workingHours: schedule
            }
        })
    }
    revalidatePath('/admin/schedule')
    return { success: true }
}

export async function setDayOverride(date: Date, isDayOff: boolean, slots?: string[]) {
    const session = await getServerSession(authOptions)
    // TODO: Add Admin Check

    const d = startOfDay(date)

    if (!isDayOff && (!slots || slots.length === 0)) {
        // If turning "On" but no specific slots provided, maybe we just want to remove the "Off" override?
        // Or if we want to reset to default.
        // Let's assume this function handles Explicit Overrides.
    }

    await prisma.doctorSchedule.upsert({
        where: { date: d },
        create: {
            date: d,
            isDayOff,
            availableSlots: slots ? JSON.stringify(slots) : undefined
        },
        update: {
            isDayOff,
            availableSlots: slots ? JSON.stringify(slots) : undefined
        }
    })

    revalidatePath('/admin/schedule')
    revalidatePath('/book')
    return { success: true }
}

export async function clearDayOverride(date: Date) {
    await prisma.doctorSchedule.deleteMany({
        where: { date: startOfDay(date) }
    })
    revalidatePath('/admin/schedule')
    revalidatePath('/book')
    return { success: true }
}
