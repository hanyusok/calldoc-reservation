'use client';

import { useState } from "react";
import { cancelPayment } from "@/app/actions/payment";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

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
    const t = useTranslations('Admin.payments');

    const handleCancel = async () => {
        if (!confirm(confirmMsg || t('actions.cancelConfirm'))) return;

        setLoading(true);
        try {
            const result = await cancelPayment(paymentId, "Admin Manual Cancel");
            if (result.success) {
                alert(t('actions.cancelSuccess'));
                router.refresh();
            } else {
                // Try to translate if it's a known error code
                const isErrorCode = /^[A-Z_]+$/.test(result.error || "");
                const errorMessage = isErrorCode
                    ? t(`errors.${result.error}`)
                    : result.error;

                alert(t('actions.cancelFailed') + errorMessage);
            }
        } catch (e) {
            console.error(e);
            alert(t('actions.error'));
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
