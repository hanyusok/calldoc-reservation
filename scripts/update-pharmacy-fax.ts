
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const pharmacyFaxes: Record<string, string> = {
    '안성스타약국': '031-8092-1419',
    '수온누리약국': '031-651-7999',
    '제일약국': '070-4409-5349',
    '새안성약국': '031-674-7589',
    '늘푸른약국': '031-672-2730',
    '365세심당약국': '031-672-0369',
    '가까운 정문 약국': '031-674-7780',
    '건강백세 온누리약국': '031-672-8839',
    '건강한약국': '031-671-2629',
    '경희온누리약국': '031-672-1640',
};

async function main() {
    console.log('Start updating pharmacy fax numbers...');

    for (const [name, fax] of Object.entries(pharmacyFaxes)) {
        // Find the pharmacy by name (assuming names are unique enough for this seed data)
        // Note: In a real app, we might use ID or more specific criteria, but for this seed data names are distinct.
        // However, finding by name might find multiple if duplicates exist, so we use findFirst.
        const pharmacy = await prisma.pharmacy.findFirst({
            where: { name: name },
        });

        if (pharmacy) {
            const updated = await prisma.pharmacy.update({
                where: { id: pharmacy.id },
                data: { fax: fax },
            });
            console.log(`Updated ${name}: Fax set to ${updated.fax}`);
        } else {
            console.log(`Pharmacy not found: ${name}`);
        }
    }

    console.log('Update finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
