import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Assuming prisma client is exported from here

// Kakao Unlink Callback Payload
// https://developers.kakao.com/docs/latest/ko/kakaologin/callback#unlink-callback
interface KakaoUnlinkPayload {
    user_id: number; // Kakao User ID (providerAccountId)
    referrer_type: string; // e.g., UNLINK_FROM_APPS
}

// Add validation for your specific authorization method if needed (e.g. Kakao Admin Key in header)
// Kakao sends requests with `Authorization: KakaoAK ${APP_ADMIN_KEY}` header.
// You should verify this to ensure the request is from Kakao.

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");

        // Optional: Validate Admin Key if you want to be strict.
        // const adminKey = process.env.KAKAO_ADMIN_KEY;
        // if (authHeader !== `KakaoAK ${adminKey}`) {
        //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // }

        const body = (await req.json()) as KakaoUnlinkPayload;
        const { user_id, referrer_type } = body;

        console.log(`[Kakao Webhook] Received unlink request for user_id: ${user_id}, referrer_type: ${referrer_type}`);

        if (!user_id) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        // Convert user_id to string as providerAccountId is stored as string
        const providerAccountId = String(user_id);

        // Find the account associated with this Kakao ID
        const account = await prisma.account.findFirst({
            where: {
                provider: "kakao",
                providerAccountId: providerAccountId,
            },
            select: {
                userId: true,
            },
        });

        if (!account) {
            console.log(`[Kakao Webhook] User not found for Kakao ID: ${providerAccountId}`);
            // Return 200 even if user not found, so Kakao doesn't retry
            return NextResponse.json({ message: "User not found or already deleted" }, { status: 200 });
        }

        // Delete the User (Cascades to Account, Session, etc.)
        await prisma.user.delete({
            where: {
                id: account.userId,
            },
        });

        console.log(`[Kakao Webhook] Successfully deleted user ${account.userId} (Kakao ID: ${providerAccountId})`);

        return NextResponse.json({ message: "Success" }, { status: 200 });
    } catch (error) {
        console.error("[Kakao Webhook] Error processing unlink:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
