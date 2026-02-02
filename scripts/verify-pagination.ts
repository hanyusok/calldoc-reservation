
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verify() {
    const total = await prisma.pharmacy.count()
    console.log(`Total Pharmacies in DB: ${total}`)

    const sample = await prisma.pharmacy.findMany({ take: 5, orderBy: { createdAt: 'desc' } })
    console.log("Sample 5:")
    sample.forEach(p => console.log(` - ${p.name}`))
}

verify().then(() => prisma.$disconnect())
