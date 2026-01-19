
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyIntegrity() {
    console.log('Starting Database Integrity Check...');
    console.log('-----------------------------------');

    try {
        // 1. Count Records
        const userCount = await prisma.user.count();
        const patientCount = await prisma.patient.count();
        const appointmentCount = await prisma.appointment.count();

        console.log(`📊 Statistics:`);
        console.log(`   - Users: ${userCount}`);
        console.log(`   - Patients: ${patientCount}`);
        console.log(`   - Appointments: ${appointmentCount}`);

        // 2. Check for Orchestrated Relationships (should be 0 if Cascade works)
        // We use raw SQL to verify that no ID points to a non-existent parent

        console.log('   - Checking orphaned Patients...');
        const orphanedPatients = await prisma.$queryRaw`
            SELECT id FROM "Patient" 
            WHERE "userId" NOT IN (SELECT id FROM "User")
        ` as any[];

        if (orphanedPatients.length > 0) {
            console.error(`❌ FOUND ${orphanedPatients.length} ORPHANED PATIENTS (No User linked)`);
        } else {
            console.log(`✅ No orphaned patients found (FK integrity holds).`);
        }

        // Check Appointments without Patients
        console.log('   - Checking orphaned Appointments...');
        const orphanedAppointments = await prisma.$queryRaw`
            SELECT id FROM "Appointment" 
            WHERE "patientId" NOT IN (SELECT id FROM "Patient")
        ` as any[];

        if (orphanedAppointments.length > 0) {
            console.error(`❌ FOUND ${orphanedAppointments.length} ORPHANED APPOINTMENTS (No Patient linked)`);
        } else {
            console.log(`✅ No orphaned appointments found (FK integrity holds).`);
        }

        // 3. Enum Consistency Check (Sample check)
        // Prisma types protect this, but we can just query distinct values to be sure
        const patients = await prisma.patient.findMany({
            select: { gender: true, relationship: true, id: true }
        });

        let invalidGender = 0;
        let invalidRel = 0;

        for (const p of patients) {
            if (!['MALE', 'FEMALE'].includes(p.gender)) invalidGender++;
            if (!['SELF', 'FAMILY'].includes(p.relationship)) invalidRel++;
        }

        if (invalidGender > 0) console.error(`❌ FOUND ${invalidGender} patients with invalid Gender`);
        else console.log(`✅ All patient genders are valid.`);

        if (invalidRel > 0) console.error(`❌ FOUND ${invalidRel} patients with invalid Relationship`);
        else console.log(`✅ All patient relationships are valid.`);

        console.log('-----------------------------------');
        console.log('Verify Complete.');

    } catch (e) {
        console.error('Check failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

verifyIntegrity();
