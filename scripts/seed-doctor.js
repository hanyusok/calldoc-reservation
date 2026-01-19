const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    // Check if doctor profile exists
    const count = await prisma.doctorProfile.count()

    if (count === 0) {
        console.log('Seeding Doctor Profile...')
        await prisma.doctorProfile.create({
            data: {
                name: "Dr. Han",
                bio: "Specialist in Family Medicine. 10+ years of experience.",
                specialty: "Family Medicine",
                bankName: "KB Kookmin Bank",
                bankAccount: "123-456-789012",
                bankHolder: "Dr. Han Clinic",
                workingHours: {
                    start: "09:00",
                    end: "18:00",
                    breakSafe: "12:00-13:00"
                }
            }
        })
        console.log('Doctor Profile seeded.')
    } else {
        console.log('Doctor Profile already exists.')
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
