
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const emails = ['patient@test.com', 'admin@calldoc.com'];

    console.log('--- Verifying Users ---');

    for (const email of emails) {
        console.log(`\nChecking: ${email}`);
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                patients: true,
                prepaidTransactions: { take: 1, orderBy: { createdAt: 'desc' } }
            }
        });

        if (!user) {
            console.error(`[FAIL] User not found: ${email}`);
            continue;
        }

        console.log(`[PASS] User ID: ${user.id}`);
        console.log(`[DATA] Name: ${user.name}`);
        console.log(`[DATA] Role: ${user.role} ${user.role === (email.includes('admin') ? 'ADMIN' : 'PATIENT') ? '✅' : '❌'}`);
        console.log(`[DATA] Balance: ${user.prepaidBalance} KRW`);

        if (email.includes('patient')) {
            if (user.patients.length > 0) {
                console.log(`[PASS] Linked Patient Profile: Yes (${user.patients[0].name})`);
            } else {
                console.warn(`[WARN] No linked Patient profile found! This user cannot book appointments.`);
            }
        }
    }
    console.log('\n--- End Verification ---');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
