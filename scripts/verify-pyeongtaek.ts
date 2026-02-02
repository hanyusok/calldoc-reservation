
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("Checking for Pyeongtaek pharmacies...")

    const pyeongtaekPharmacies = await prisma.pharmacy.findMany({
        where: {
            address: {
                contains: '평택'
            }
        }
    })

    console.log(`Found ${pyeongtaekPharmacies.length} pharmacies in Pyeongtaek.`)

    if (pyeongtaekPharmacies.length > 0) {
        console.log("Sample List:")
        pyeongtaekPharmacies.slice(0, 10).forEach(p => {
            console.log(`- ${p.name} (${p.address})`)
        })
    } else {
        console.log("No pharmacies found in Pyeongtaek.")
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
