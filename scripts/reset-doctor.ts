import { PrismaClient, Prisma } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const doctor = await prisma.doctorProfile.findFirst()
    if (doctor) {
        await prisma.doctorProfile.update({
            where: { id: doctor.id },
            data: { workingHours: Prisma.DbNull } // Reset to null
        })
        console.log('Reset workingHours to null')
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
