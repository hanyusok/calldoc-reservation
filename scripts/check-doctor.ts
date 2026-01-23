import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const doctor = await prisma.doctorProfile.findFirst()
    console.log('Doctor:', doctor)
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
