import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2]
    const newPassword = process.argv[3]

    if (!email || !newPassword) {
        console.error('Usage: npx tsx scripts/reset-password.ts <email> <new_password>')
        process.exit(1)
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        })
        console.log(`Password updated for user: ${user.email}`)
    } catch (error) {
        console.error(`Failed to update password for ${email}. User might not exist.`)
        console.error(error)
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
