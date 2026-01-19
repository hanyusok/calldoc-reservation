import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const emails = ['patient@test.com', 'admin@calldoc.com'];
    console.log(`Checking for users: ${emails.join(', ')}`);

    const users = await prisma.user.findMany({
        where: {
            email: {
                in: emails,
            },
        },
    });

    console.log('--- Results ---');
    users.forEach(user => {
        console.log(`Found: ${user.email} (Role: ${user.role})`);
    });

    const foundEmails = users.map(u => u.email);
    const missingEmails = emails.filter(e => !foundEmails.includes(e));

    if (missingEmails.length > 0) {
        console.log('--- Missing ---');
        missingEmails.forEach(email => console.log(`Missing: ${email}`));
    } else {
        console.log('--- Success ---');
        console.log('All requested users found.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
