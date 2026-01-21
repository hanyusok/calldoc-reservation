import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Naver Disconnection Callback
// Naver sends a request when a user disconnects from the service.
// Documentation is scarce on potential payload, but typical OAuth callbacks might include user identifier or token.
// IMPORTANT: Naver Disconnection Callback is often just a GET/POST to the URL.
// We will log the request to understand the structure for now, as specific payload documentation requires login to Naver Developers.

export async function POST(req: NextRequest) {
    try {
        // Naver might send form-urlencoded data or JSON.
        const contentType = req.headers.get("content-type");
        let body: any = {};

        if (contentType?.includes("application/json")) {
            body = await req.json();
        } else if (contentType?.includes("application/x-www-form-urlencoded")) {
            const formData = await req.formData();
            const entries = Array.from(formData.entries());
            entries.forEach(([key, value]) => {
                body[key] = value;
            });
        }

        console.log("[Naver Webhook] Received request:", body);

        // Assuming Naver sends 'user_id' or 'id' or 'access_token'.
        // Since we can't be 100% sure of the field name without docs/testing:
        // We will look for a known identifier in the body.

        // Attempt to find identifier
        const possibleId = body.user_id || body.id || body.enc_id;

        if (!possibleId) {
            console.warn("[Naver Webhook] No identifier found in payload.");
            return NextResponse.json({ message: "Received but no identifier found" }, { status: 200 });
        }

        const providerAccountId = String(possibleId);

        const account = await prisma.account.findFirst({
            where: {
                provider: "naver",
                providerAccountId: providerAccountId,
            },
            select: {
                userId: true,
            },
        });

        if (account) {
            await prisma.user.delete({
                where: { id: account.userId },
            });
            console.log(`[Naver Webhook] Deleted user ${account.userId} (Naver ID: ${providerAccountId})`);
        } else {
            console.log(`[Naver Webhook] User not found for Naver ID: ${providerAccountId}`);
        }

        return NextResponse.json({ message: "Success" }, { status: 200 });
    } catch (error) {
        console.error("[Naver Webhook] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    // Naver might call GET for verification or callback
    const { searchParams } = new URL(req.url);
    console.log("[Naver Webhook] GET request params:", Object.fromEntries(searchParams));
    return NextResponse.json({ message: "Naver Webhook Endpoint" });
}
