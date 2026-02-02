'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const pharmacySchema = z.object({
    name: z.string().min(1, "Name is required"),
    fax: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
})

export async function getPharmacies(page: number = 1, limit: number = 10, query: string = "") {
    const session = await getServerSession(authOptions)
    if (!session) return { pharmacies: [], total: 0, totalPages: 0 }

    const skip = (page - 1) * limit

    const where = query ? {
        OR: [
            { name: { contains: query, mode: 'insensitive' as const } },
            { address: { contains: query, mode: 'insensitive' as const } },
        ]
    } : {}

    const [pharmacies, total] = await Promise.all([
        prisma.pharmacy.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.pharmacy.count({ where })
    ])

    return {
        pharmacies,
        total,
        totalPages: Math.ceil(total / limit)
    }
}

export async function createPharmacy(data: z.infer<typeof pharmacySchema>) {
    const session = await getServerSession(authOptions)
    if (!session) return { error: "Unauthorized" }

    const validated = pharmacySchema.safeParse(data)
    if (!validated.success) return { error: "Invalid data" }

    try {
        await prisma.pharmacy.create({
            data: validated.data
        })
        revalidatePath('/admin/pharmacies')
        return { success: true }
    } catch (error) {
        console.error(error)
        return { error: "Failed to create pharmacy" }
    }
}

export async function updatePharmacy(id: string, data: z.infer<typeof pharmacySchema>) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') return { error: "Unauthorized" }

    const validated = pharmacySchema.safeParse(data)
    if (!validated.success) return { error: "Invalid data" }

    try {
        await prisma.pharmacy.update({
            where: { id },
            data: validated.data
        })
        revalidatePath('/admin/pharmacies')
        return { success: true }
    } catch (error) {
        console.error(error)
        return { error: "Failed to update pharmacy" }
    }
}

export async function deletePharmacy(id: string) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') return { error: "Unauthorized" }

    try {
        await prisma.pharmacy.delete({
            where: { id }
        })
        revalidatePath('/admin/pharmacies')
        return { success: true }
    } catch (error) {
        console.error(error)
        return { error: "Failed to delete pharmacy" }
    }
}
