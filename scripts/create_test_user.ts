import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'tester@calldoc.co.kr'
    const password = 'Test1234!'
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            name: 'Tester',
            role: 'PATIENT' // Default role
        },
        create: {
            email,
            password: hashedPassword,
            name: 'Tester',
            role: 'PATIENT'
        },
    })

    console.log(`User created/updated: ${user.email}`)
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
