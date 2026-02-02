
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
    const csvPath = path.join(process.cwd(), 'Doc', '평택약국list.csv')
    const fileContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = fileContent.split('\n').filter(line => line.trim() !== '')

    // Skip header
    const dataLines = lines.slice(1)

    console.log(`Found ${dataLines.length} pharmacies in Pyeongtaek CSV.`)

    for (const line of dataLines) {
        // Regex to split by comma but ignore commas inside quotes
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
        if (!matches) continue;

        // Manual split logic just in case regex is flaky with empty fields
        const columns: string[] = []
        let current = ''
        let inQuotes = false

        for (let i = 0; i < line.length; i++) {
            const char = line[i]
            if (char === '"') {
                inQuotes = !inQuotes
            } else if (char === ',' && !inQuotes) {
                columns.push(current.trim())
                current = ''
            } else {
                current += char
            }
        }
        columns.push(current.trim())

        // Index mapping based on file:
        // NO,병원/약국명,병원/약국구분,전화번호,우편번호,소재지주소,홈페이지
        // 0  1           2           3       4       5          6

        const name = columns[1]?.replace(/^"|"$/g, '') || ''
        const phone = columns[3]?.replace(/^"|"$/g, '') || null
        const address = columns[5]?.replace(/^"|"$/g, '') || null

        if (!name) continue

        // Loose upsert
        const exists = await prisma.pharmacy.findFirst({
            where: {
                name: name,
                address: address ? { contains: address.split(' ')[2] || 'nonexistent' } : undefined
            }
        })

        if (exists) {
            // Update phone if missing or different, or if address was null
            if ((phone && exists.phone !== phone) || (!exists.address && address)) {
                await prisma.pharmacy.update({
                    where: { id: exists.id },
                    data: {
                        phone: phone || exists.phone,
                        address: address || exists.address
                    }
                })
                console.log(`Updated: ${name}`)
            } else {
                console.log(`Skipped (Exists): ${name}`)
            }
        } else {
            // Check if address explicitly contains "평택" or rely on file source
            // The file is explicitly Pyeongtaek list, so we assume valid.
            await prisma.pharmacy.create({
                data: {
                    name,
                    phone: phone || null,
                    address: address || null,
                    fax: null
                }
            })
            console.log(`Created: ${name}`)
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
