
// scripts/test-google-meet.ts
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

async function main() {
    console.log("Testing Google Meet Generation...");

    // 1. Read Credentials
    const keyData = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!keyData) {
        throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is missing");
    }
    if (!calendarId) {
        throw new Error("GOOGLE_CALENDAR_ID is missing");
    }

    console.log(`Calendar ID: ${calendarId}`);

    // 2. Auth
    const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(keyData),
        scopes: SCOPES,
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // 3. Create Basic Dummy Event (To test permissions)
    const now = new Date();
    const end = new Date(now.getTime() + 30 * 60000);

    const basicEvent = {
        summary: `BASIC TEST (No Link)`,
        description: 'Test event to verify permissions.',
        start: { dateTime: now.toISOString() },
        end: { dateTime: end.toISOString() },
    };

    console.log("Attempting to insert BASIC event (no meet link)...");
    try {
        const basicResponse = await calendar.events.insert({
            calendarId: calendarId,
            requestBody: basicEvent,
        });
        console.log(`BASIC Event created: ${basicResponse.data.htmlLink}`);
    } catch (e) {
        console.error("Failed to create basic event:", e);
        return; // Stop if we can't even do this
    }

    // 4. Create Event with Conference Data (Simplified)
    const event = {
        summary: `TEST EVENT with Meet Link (Simplified)`,
        description: 'Testing default conference generation.',
        start: { dateTime: now.toISOString() },
        end: { dateTime: end.toISOString() },
        conferenceData: {
            createRequest: {
                requestId: `test-${Date.now()}`,
                conferenceSolutionKey: { type: 'eventHangout' },
            },
        },
    };

    console.log("\nAttempting to insert event WITH Meet Link (Simplified)...");
    const response = await calendar.events.insert({
        calendarId: calendarId,
        requestBody: event,
        conferenceDataVersion: 1,
    });

    console.log("Success!");
    console.log(`Event created: ${response.data.htmlLink}`);
    console.log(`Meet Link: ${response.data.hangoutLink}`);

    if (response.data.hangoutLink) {
        console.log("\nVERIFICATION PASSED: Credentials work and Meet link was generated.");
    } else {
        console.error("\nVERIFICATION FAILED: Event created but no meeting link generated.");
    }
}

main().catch(console.error);
