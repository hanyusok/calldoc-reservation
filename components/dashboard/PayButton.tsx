'use client';

import { useState } from "react";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import { CreditCard } from "lucide-react";

export default function PayButton({ appointmentId, paymentId, amount, customerName }: { appointmentId: string, paymentId: string, amount: number, customerName: string }) {
    const [loading, setLoading] = useState(false);

    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;

    const handlePayClick = async () => {
        setLoading(true);
        try {
            const tossPayments = await loadTossPayments(clientKey);

            await tossPayments.requestPayment('카드', {
                amount: amount,
                orderId: paymentId,
                orderName: `마트의원_진료비_${amount}_${paymentId}`,
                successUrl: `${window.location.origin}/ko/payment/success`,
                failUrl: `${window.location.origin}/ko/payment/fail`,
                customerName: customerName,
            });
        } catch (error: any) {
            console.error("Payment SDK Error:", error);
            if (error.code === 'USER_CANCEL') {
                // User cancelled, not a system error
            } else {
                alert(`Payment failed: ${error?.message || JSON.stringify(error)}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handlePayClick}
            disabled={loading}
            className="mt-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
        >
            <CreditCard className="w-4 h-4" />
            {loading ? 'Processing...' : `Pay ${amount.toLocaleString()} KRW`}
        </button>
    );
}

// Need to import PaymentWidget at the top. I will use multi_replace to handle imports.

