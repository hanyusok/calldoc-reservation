const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    const email = 'hanyusok@gmail.com'

    try {
        const user = await prisma.user.update({
            where: { email: email },
            data: { role: 'ADMIN' }
        })
        console.log(`Success! User ${user.name} (${user.email}) is now an ${user.role}.`)
    } catch (error) {
        if (error.code === 'P2025') {
            console.error(`User with email ${email} not found.`)
        } else {
            console.error('Error updating user:', error)
        }
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
