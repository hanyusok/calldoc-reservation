
// scripts/verify-db.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking last 5 appointments...");

    const appointments = await prisma.appointment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { payment: true },
    });

    if (appointments.length === 0) {
        console.log("No appointments found.");
        return;
    }

    console.log("Recent Appointments:");
    for (const appt of appointments) {
        console.log(`[${appt.status}] ID: ${appt.id}`);
        console.log(`  - Meeting Link: ${appt.meetingLink || "(Empty)"}`);
        console.log(`  - Payment Status: ${appt.payment?.status}`);
        console.log(`  - Payment Key: ${appt.payment?.paymentKey || "(Empty)"}`);
        console.log("-----------------------------------");
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
