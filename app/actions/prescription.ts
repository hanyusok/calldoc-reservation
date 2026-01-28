'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

import { createNotification } from "@/lib/notifications"

// Patient requests a prescription transfer
export async function requestPrescription(
    appointmentId: string,
    pharmacyDetails: {
        name: string;
        fax?: string;
        phone?: string;
        address?: string;
    }
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Unauthorized" }

    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { patient: true }
        })

        if (!appointment) return { error: "Appointment not found" }

        // Ensure user owns the patient or is admin (though admin wouldn't request this usually)
        if (appointment.patient.userId !== session.user.id) {
            return { error: "Unauthorized" }
        }

        // Upsert prescription request
        await prisma.prescription.upsert({
            where: { appointmentId },
            update: {
                pharmacyName: pharmacyDetails.name,
                pharmacyFax: pharmacyDetails.fax,
                pharmacyPhone: pharmacyDetails.phone,
                pharmacyAddress: pharmacyDetails.address,
                status: 'REQUESTED'
            },
            create: {
                appointmentId,
                pharmacyName: pharmacyDetails.name,
                pharmacyFax: pharmacyDetails.fax,
                pharmacyPhone: pharmacyDetails.phone,
                pharmacyAddress: pharmacyDetails.address,
                status: 'REQUESTED'
            }
        })

        // Notify Admins
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } })
        for (const admin of admins) {
            await createNotification({
                userId: admin.id,
                title: "Notifications.pharmacyRequestTitle",
                message: "Notifications.pharmacyRequestMsg",
                type: "INFO",
                link: `/admin/appointments`
            })
        }

        revalidatePath(`/dashboard/appointments/${appointmentId}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to request prescription", error)
        return { error: "Failed to request prescription" }
    }
}

// Admin/Doctor issues the prescription (e.g. by providing a file URL)
export async function issuePrescription(
    prescriptionId: string,
    fileUrl: string
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return { error: "Unauthorized" }

    try {
        const updatedPrescription = await prisma.prescription.update({
            where: { id: prescriptionId },
            data: {
                status: 'ISSUED',
                fileUrl
            },
            include: {
                appointment: {
                    include: { patient: true }
                }
            }
        })

        // Notify Patient (User)
        if (updatedPrescription.appointment && updatedPrescription.appointment.patient) {
            await createNotification({
                userId: updatedPrescription.appointment.patient.userId,
                title: "Notifications.prescriptionIssuedTitle",
                message: "Notifications.prescriptionIssuedMsg",
                type: "INFO",
                link: `/dashboard/appointments/${updatedPrescription.appointmentId}`
            })
        }

        revalidatePath('/admin/appointments')
        return { success: true }
    } catch (error) {
        console.error("Failed to issue prescription", error)
        return { error: "Failed to issue prescription" }
    }
}

export async function getPrescription(appointmentId: string) {
    try {
        const prescription = await prisma.prescription.findUnique({
            where: { appointmentId }
        })
        return prescription
    } catch (error) {
        return null
    }
}
