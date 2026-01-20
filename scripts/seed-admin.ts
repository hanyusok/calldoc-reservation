
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Admin User and Data...');

    // Create Admin User
    const adminEmail = 'admin@calldoc.com';
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: { role: 'ADMIN' },
        create: {
            email: adminEmail,
            name: 'Super Admin',
            role: 'ADMIN',
            emailVerified: new Date(),
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
        },
    });
    console.log(`Admin user created: ${admin.email}`);

    // Create some regular users and patients if they don't exist
    const userEmail = 'patient@test.com';
    const user = await prisma.user.upsert({
        where: { email: userEmail },
        update: {},
        create: {
            email: userEmail,
            name: 'Test Patient',
            role: 'PATIENT',
            emailVerified: new Date(),
            prepaidBalance: 50000
        },
    });

    // Create Patient Profile
    const patient = await prisma.patient.create({
        data: {
            userId: user.id,
            name: 'Grandma Kim',
            dateOfBirth: new Date('1950-01-01'),
            gender: 'FEMALE',
            relationship: 'FAMILY'
        }
    });

    // Create Appointment
    await prisma.appointment.create({
        data: {
            patientId: patient.id,
            startDateTime: new Date(),
            endDateTime: new Date(new Date().getTime() + 30 * 60000),
            status: 'PENDING',
            payment: {
                create: {
                    amount: 15000,
                    method: 'BANK_TRANSFER',
                    status: 'PENDING'
                }
            }
        }
    });

    // Create Prepaid Transaction
    await prisma.prepaidTransaction.create({
        data: {
            userId: user.id,
            amount: 50000,
            type: 'DEPOSIT',
            description: 'Initial Bonus'
        }
    });

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
