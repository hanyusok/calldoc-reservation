'use client';

import { useState } from "react";
import { payForAppointment } from "@/app/actions/appointment";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";

export default function PayButton({ appointmentId, amount }: { appointmentId: string, amount: number }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handlePay = async () => {
        if (!confirm(`Confirm payment of ${amount.toLocaleString()} KRW?`)) return;
        setLoading(true);

        const result = await payForAppointment(appointmentId);
        if (result.success) {
            router.refresh();
        } else {
            alert(result.error || "Payment failed");
        }
        setLoading(false);
    }

    return (
        <button
            onClick={handlePay}
            disabled={loading}
            className="mt-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
        >
            <CreditCard className="w-4 h-4" />
            {loading ? "Processing..." : `Pay ${amount.toLocaleString()} KRW`}
        </button>
    )
}
