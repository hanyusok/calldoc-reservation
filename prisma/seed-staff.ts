
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const staffUsers = [
        { email: 'staff1@calldoc.co.kr', password: 'han@6578279', name: '접수1' },
        { email: 'staff2@calldoc.co.kr', password: 'han@6578279', name: '접수2' },
    ]

    for (const user of staffUsers) {
        const hashedPassword = await bcrypt.hash(user.password, 10)

        const upsertedUser = await prisma.user.upsert({
            where: { email: user.email },
            update: {
                password: hashedPassword,
                role: Role.STAFF, // Ensure role is STAFF
            },
            create: {
                email: user.email,
                name: user.name,
                password: hashedPassword,
                role: Role.STAFF,
            },
        })

        console.log(`Upserted user: ${upsertedUser.email} with role ${upsertedUser.role}`)
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
