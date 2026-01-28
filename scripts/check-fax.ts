
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkRecentPrescriptions() {
    try {
        const recent = await prisma.prescription.findMany({
            take: 5,
            orderBy: {
                updatedAt: 'desc'
            },
            include: {
                appointment: { include: { patient: true } }
            }
        });

        console.log("--- Recent 5 Prescriptions ---");
        recent.forEach((p) => {
            console.log(`[${p.id}] Status: ${p.status}, FileUrl: ${p.fileUrl}, Updated: ${p.updatedAt}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkRecentPrescriptions();
