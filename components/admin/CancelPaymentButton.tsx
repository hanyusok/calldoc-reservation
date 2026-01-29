'use client';

import { useState } from "react";
import { cancelPayment } from "@/app/actions/payment";
import { useRouter } from "next/navigation";

export default function CancelPaymentButton({
    paymentId,
    amount,
    label,
    confirmMsg
}: {
    paymentId: string,
    amount: number,
    label: string,
    confirmMsg: string
}) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCancel = async () => {
        if (!confirm(confirmMsg || "Are you sure you want to cancel this payment?")) return;

        setLoading(true);
        try {
            const result = await cancelPayment(paymentId, "Admin Manual Cancel");
            if (result.success) {
                alert("Payment status updated to CANCELED. (Refund requires manual processing in Kiwoom Admin)");
                router.refresh();
            } else {
                alert("Failed to cancel: " + result.error);
            }
        } catch (e) {
            console.error(e);
            alert("Error cancelling payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleCancel}
            disabled={loading}
            className="text-red-600 hover:text-red-900 disabled:opacity-50 text-xs border border-red-200 px-2 py-1 rounded bg-red-50 hover:bg-red-100"
        >
            {loading ? "..." : label}
        </button>
    );
}
