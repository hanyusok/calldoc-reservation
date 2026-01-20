
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({
        include: {
            accounts: true, // See linked accounts (Google/Kakao)
        }
    })

    console.log('### User List ###')
    if (users.length === 0) {
        console.log('No users found.')
    } else {
        users.forEach(user => {
            console.log(`ID: ${user.id}`)
            console.log(`Name: ${user.name}`)
            console.log(`Email: ${user.email}`)
            console.log(`Role: ${user.role}`)
            console.log(`Provider: ${user.accounts.map(a => a.provider).join(', ') || 'None'}`)
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
