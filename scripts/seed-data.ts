
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const TARGET_EMAIL = 'jiwonhan1548@gmail.com';

async function main() {
    console.log(`Seeding data for user: ${TARGET_EMAIL}`);

    const user = await prisma.user.findUnique({
        where: { email: TARGET_EMAIL }
    });

    if (!user) {
        console.error('User not found!');
        return;
    }

    console.log(`Found user ID: ${user.id}`);

    // 1. Create 3 Family Members
    const familyNames = ['한철수', '김영희', '한미나'];
    const patients = [];

    for (const name of familyNames) {
        const patient = await prisma.patient.create({
            data: {
                userId: user.id,
                name: name,
                dateOfBirth: new Date('1980-01-01'), // Random DOB
                gender: Math.random() > 0.5 ? 'MALE' : 'FEMALE',
                relationship: 'FAMILY',
                residentNumber: '800101-1234567'
            }
        });
        patients.push(patient);
        console.log(`Created patient: ${name}`);
    }

    // Include the user's "SELF" patient profile if it exists
    const allPatients = await prisma.patient.findMany({
        where: { userId: user.id }
    });

    console.log(`Total patients managing: ${allPatients.length}`);

    // 2. Create 20 Appointments
    const statuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const;

    for (let i = 0; i < 20; i++) {
        // Pick random patient
        const patient = allPatients[Math.floor(Math.random() * allPatients.length)];

        // Random date (within last 30 days or next 30 days)
        const daysOffset = Math.floor(Math.random() * 60) - 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + daysOffset);
        startDate.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0); // 9 AM - 5 PM

        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + 30); // 30 min duration

        const status = statuses[Math.floor(Math.random() * statuses.length)];

        const appointment = await prisma.appointment.create({
            data: {
                patientId: patient.id,
                startDateTime: startDate,
                endDateTime: endDate,
                status: status,
                meetingLink: status === 'CONFIRMED' || status === 'COMPLETED' ? 'https://meet.google.com/abc-defg-hij' : null,
            }
        });

        // Add Payment if not pending/cancelled (or random)
        if (status !== 'CANCELLED') {
            await prisma.payment.create({
                data: {
                    appointmentId: appointment.id,
                    amount: 30000,
                    status: status === 'COMPLETED' ? 'COMPLETED' : (Math.random() > 0.5 ? 'COMPLETED' : 'PENDING'),
                    senderName: user.name || 'Unknown'
                }
            });
        }

        console.log(`Created appointment ${i + 1}: ${startDate.toISOString().split('T')[0]} - ${status} - ${patient.name}`);
    }

    console.log('Seeding completed.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
