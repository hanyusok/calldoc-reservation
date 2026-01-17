'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function addPatient(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return { error: "Unauthorized" }

    const userId = session.user.id

    const name = formData.get("name") as string
    const gender = formData.get("gender") as "MALE" | "FEMALE"
    const relationship = formData.get("relationship") as "SELF" | "FAMILY"
    const dobString = formData.get("dateOfBirth") as string
    const residentNumber = formData.get("residentNumber") as string

    if (!name || !dobString || !residentNumber) {
        return { error: "Missing required fields" }
    }

    try {
        await prisma.patient.create({
            data: {
                userId,
                name,
                gender,
                relationship,
                dateOfBirth: new Date(dobString),
                residentNumber, // In production, encrypt this!
            }
        })

        revalidatePath('/dashboard/profile')
        return { success: true }
    } catch (error) {
        console.error("Failed to add patient", error)
        return { error: "Failed to create patient" }
    }
}

export async function deletePatient(patientId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Unauthorized" }

    try {
        // Ensure the patient belongs to the user
        const patient = await prisma.patient.findUnique({
            where: { id: patientId }
        })

        if (!patient || patient.userId !== session.user.id) {
            return { error: "Unauthorized" }
        }

        await prisma.patient.delete({
            where: { id: patientId }
        })

        revalidatePath('/dashboard/profile')
        return { success: true }
    } catch (error) {
        return { error: "Failed to delete patient" }
    }
}

export async function getPatients() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return []

    const patients = await prisma.patient.findMany({
        where: {
            userId: session.user.id
        },
        orderBy: {
            createdAt: 'asc'
        }
    })
    return patients
}
