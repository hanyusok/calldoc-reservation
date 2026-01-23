import { getAvailableSlots } from '../app/actions/appointment';
import { addDays, format, nextTuesday, nextWednesday } from 'date-fns';

async function main() {
    console.log('--- Verifying Lunch Break (12:00-13:00) Removal ---');
    // Pick a Monday (should have slots)
    // If today is Monday, use next Monday to be safe, or just find next available Monday.

    // Easier: Check tomorrow. If tomorrow is Tue/Wed, slots should be empty.
    const tomorrow = addDays(new Date(), 1);
    const dayName = format(tomorrow, 'E').toLowerCase();

    console.log(`Checking slots for ${format(tomorrow, 'yyyy-MM-dd')} (${dayName})...`);

    let slots = await getAvailableSlots(format(tomorrow, 'yyyy-MM-dd'));

    if (dayName === 'tue' || dayName === 'wed') {
        if (slots.length === 0) {
            console.log('SUCCESS: Tuesday/Wednesday is OFF by default (0 slots).');
        } else {
            console.error(`FAILED: Expected 0 slots for ${dayName}, got ${slots.length}`);
            console.log(slots);
            process.exit(1);
        }
    } else {
        // Expect slots, check lunch
        if (slots.length === 0) {
            console.warn("Warning: No slots found, possibly global off or other issue.");
        } else {
            const hasLunch = slots.includes('12:00') || slots.includes('12:30');
            if (hasLunch) {
                console.error('FAILED: Found 12:00 or 12:30 in slots!');
                process.exit(1);
            } else {
                console.log('SUCCESS: Lunch slots (12:00, 12:30) are correctly removed.');
            }
        }
    }

    console.log('\n--- Verifying Force Off Day (Tuesday) ---');
    const tues = nextTuesday(new Date());
    const tuesSlots = await getAvailableSlots(format(tues, 'yyyy-MM-dd'));
    if (tuesSlots.length === 0) {
        console.log(`SUCCESS: Next Tuesday (${format(tues, 'yyyy-MM-dd')}) has 0 slots.`);
    } else {
        console.error(`FAILED: Tuesday should be off, but has ${tuesSlots.length} slots.`);
        process.exit(1);
    }
}

main();
