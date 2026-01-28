'use server';

import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

export async function createMeeting({
    appointmentId,
    startDateTime,
    endDateTime,
    summary
}: {
    appointmentId: string;
    startDateTime: Date;
    endDateTime: Date;
    summary?: string;
}) {
    // 1. Check for Credentials
    const keyData = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!keyData || !calendarId) {
        console.warn("Missing Google Calendar credentials. Using mock meeting link.");
        // Return a mock link for development/testing
        return "https://meet.google.com/test-link-mock";
    }

    try {
        // 2. Auth
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(keyData),
            scopes: SCOPES,
        });

        const calendar = google.calendar({ version: 'v3', auth });

        // 3. Create Event with Conference Data
        const event = {
            summary: summary || `Consultation: Appointment ${appointmentId.slice(-6)}`,
            description: `Automatic video consultation for Appointment ${appointmentId}.`,
            start: { dateTime: startDateTime.toISOString() },
            end: { dateTime: endDateTime.toISOString() },
            conferenceData: {
                createRequest: {
                    requestId: `${appointmentId}-${Date.now()}`,
                    // conferenceSolutionKey: { type: 'hangoutsMeet' }, // Removed to prevent error on non-compliant accounts
                },
            },
        };

        const response = await calendar.events.insert({
            calendarId: calendarId,
            requestBody: event,
            conferenceDataVersion: 1, // Critical for generating the link
        });

        return response.data.hangoutLink;

    } catch (error) {
        console.error("Failed to create Google Meet:", error);
        return null; // Fail gracefully so payment isn't affected
    }
}
