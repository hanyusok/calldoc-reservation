
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking latest payment...");

    const payment = await prisma.payment.findFirst({
        orderBy: { confirmedAt: 'desc' },
        include: { appointment: true }
    });

    if (!payment) {
        console.log("No completed payments found.");
    } else {
        console.log("Latest Payment:");
        console.log(`- ID: ${payment.id}`);
        console.log(`- Amount: ${payment.amount}`);
        console.log(`- Status: ${payment.status}`);
        console.log(`- Method: ${payment.method}`);
        console.log(`- ConfirmedAt: ${payment.confirmedAt}`);

        if (payment.appointment) {
            console.log("\nAssociated Appointment:");
            console.log(`- ID: ${payment.appointment.id}`);
            console.log(`- Status: ${payment.appointment.status}`);
        }
    }

    console.log("\nChecking recent notifications (last 10 mins)...");
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const notifications = await prisma.notification.findMany({
        where: {
            createdAt: { gte: tenMinutesAgo },
            type: 'PAYMENT'
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    if (notifications.length === 0) {
        console.log("No recent payment notifications found.");
    } else {
        notifications.forEach(n => {
            console.log(`- [${n.createdAt.toISOString()}] ${n.message} (Read: ${n.isRead})`);
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
