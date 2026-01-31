import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'test@example.com'
    const password = '1234'
    const user = await prisma.user.findUnique({ where: { email } })
    if (user && await bcrypt.compare(password, user.password!)) {
        console.log('Login verification SUCCESS')
    } else {
        console.log('Login verification FAILED')
    }
}
main()
