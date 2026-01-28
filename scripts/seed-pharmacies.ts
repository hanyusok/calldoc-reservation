
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const pharmacies = [
    {
        name: '안성스타약국',
        phone: '031-8092-1415',
        address: '경기도 안성시 공도읍 서동대로 3930-39 스타필드 안성 1층',
    },
    {
        name: '수온누리약국',
        phone: '031-651-7997',
        address: '경기도 안성시 공도읍 진사길 34',
    },
    {
        name: '제일약국',
        phone: '070-4409-5344',
        address: '경기도 안성시 공도읍 서동대로 4478 (롯데마트)',
    },
    {
        name: '새안성약국',
        phone: '031-674-7585',
        address: '경기도 안성시 시장길 58, 희망빌딩 1층 101호',
    },
    {
        name: '늘푸른약국',
        phone: '031-672-2739',
        address: '경기도 안성시 대학로 67',
    },
    {
        name: '365세심당약국',
        phone: '031-672-0365',
        address: '경기도 안성시 인지2길 6, 1층',
    },
    {
        name: '가까운 정문 약국',
        phone: '031-674-7789',
        address: '경기도 안성시 남파로 99, 1층',
    },
    {
        name: '건강백세 온누리약국',
        phone: '031-672-8836',
        address: '경기도 안성시 고삼면 고삼호수로 10',
    },
    {
        name: '건강한약국',
        phone: '031-671-2627',
        address: '경기도 안성시 장기로 9, S TOWER',
    },
    {
        name: '경희온누리약국',
        phone: '031-672-1649',
        address: '경기도 안성시 대덕면 서동대로 4723',
    },
];

async function main() {
    console.log('Start seeding pharmacies...');
    for (const pharmacy of pharmacies) {
        const createdPharmacy = await prisma.pharmacy.create({
            data: pharmacy,
        });
        console.log(`Created pharmacy with id: ${createdPharmacy.id}`);
    }
    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
