const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    const patients = await prisma.patient.findMany({
        include: {
            user: true, // See linked user
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    console.log('--- Patient List ---')
    if (patients.length === 0) {
        console.log('No patients found.')
    } else {
        patients.forEach(patient => {
            console.log(`ID: ${patient.id}`)
            console.log(`Name: ${patient.name}`)
            console.log(`DOB: ${patient.dateOfBirth.toISOString().split('T')[0]}`)
            console.log(`Gender: ${patient.gender}`)
            console.log(`Relationship: ${patient.relationship}`)
            console.log(`Linked User: ${patient.user.name} (${patient.user.email})`)
            console.log('-----------------')
        })
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
