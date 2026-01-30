
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Admin User and Data...');

    // Create Admin User
    const adminEmail = 'admin@calldoc.co.kr';
    const password = await bcrypt.hash('han@6578279', 12);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            role: 'ADMIN',
            password: password
        },
        create: {
            email: adminEmail,
            name: '관리자',
            role: 'ADMIN',
            password: password,
            emailVerified: new Date(),
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
        },
    });
    console.log(`Admin user created: ${admin.email}`);

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
