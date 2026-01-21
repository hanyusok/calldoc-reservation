import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'tester@calldoc.co.kr'
    const password = 'Test1234!'

    console.log(`Checking user: ${email}`)
    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        console.error('User not found!')
        return
    }

    console.log('User found.')
    console.log(`Stored hash: ${user.password}`)

    if (!user.password) {
        console.error('User has no password set!')
        return
    }

    const isValid = await bcrypt.compare(password, user.password)
    console.log(`Password 'Test1234!' valid: ${isValid}`)
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
