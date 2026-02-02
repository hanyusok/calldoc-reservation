
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const pharmacyContacts: Record<string, string> = {
    // Anseong
    "안성마트약국": "031-674-5978",
    "365세심당약국": "031-672-0365",
    "가까운정문약국": "031-674-7789",
    "건강백세 온누리약국": "031-672-8836",
    "건강한약국": "031-671-2627",
    "경희온누리약국": "031-672-1649",
    "공도강약국": "031-618-1963",
    "공도바른약국": "031-653-0755",
    "공도약국": "031-657-1880",
    "공도현대약국": "031-654-4613",
    "광동약국": "070-7782-7575",
    "광명약국": "031-675-4460",
    "국민약국": "031-652-3434",
    "내리 중앙메디칼약국": "031-675-0130",
    "온누리우주약국": "031-651-7997",
    // Pyeongtaek
    "장당온누리약국": "031-668-7588",
    "365녹십자약국": "031-652-3307",
    "공단약국": "031-683-3567",
    "마트종로약국": "031-651-9631",
    "메디칼세계로약국": "031-657-8078",
    "송탄온누리약국": "031-662-1102",
    "제세약국": "031-651-7714",
    "송탄종합약국": "031-662-3690"
};

async function main() {
    console.log("Updating pharmacy contact info...");

    for (const [name, phone] of Object.entries(pharmacyContacts)) {
        // Find pharmacy by name (and loosely address if needed, but name should be enough for now)
        const pharmacy = await prisma.pharmacy.findFirst({
            where: { name: name }
        });

        if (pharmacy) {
            await prisma.pharmacy.update({
                where: { id: pharmacy.id },
                data: { phone: phone }
            });
            console.log(`Updated ${name}: ${phone}`);
        } else {
            console.log(`Pharmacy not found: ${name} - Creating new entry...`);
            // Create if it doesn't exist (some from search results might be new)
            await prisma.pharmacy.create({
                data: {
                    name: name,
                    phone: phone,
                    // No address known for these 'new' ones from this specific map, 
                    // but usually we want an address. 
                    // usage: just update existing ones mostly. I'll skip create without address.
                }
            }).catch(() => console.log(`Skipped creation of ${name} due to missing data`));
        }
    }
    console.log("Update finished.");
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
