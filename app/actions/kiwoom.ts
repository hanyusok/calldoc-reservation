"use server";

import { PaymentMethod } from "@prisma/client";

export async function getKiwoomHash(params: {
    CPID: string;
    PAYMETHOD: string;
    ORDERNO: string;
    TYPE: string;
    AMOUNT: string;
}) {
    // Replicate logic from getKiwoomENC.jsp
    const url = process.env.KIWOOM_HASH_API_URL || "https://apitest.kiwoompay.co.kr/pay/hash";

    console.log("Requesting Kiwoom Hash for:", params);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            console.error("Kiwoom Hash API Error Status:", response.status);
            return { success: false, error: `API Error: ${response.status}` };
        }

        const data = await response.json();
        console.log("Kiwoom Hash Response:", data);

        if (data.KIWOOM_ENC) {
            return { success: true, KIWOOM_ENC: data.KIWOOM_ENC };
        } else {
            return { success: false, error: "No KIWOOM_ENC in response" };
        }

    } catch (error) {
        console.error("Kiwoom Hash Error:", error);
        return { success: false, error: "Internal Server Error" };
    }
}
