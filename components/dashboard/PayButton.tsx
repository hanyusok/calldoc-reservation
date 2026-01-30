'use client';

import { useState, useRef } from "react";
import { CreditCard } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { getKiwoomHash } from "@/app/actions/kiwoom";

declare global {
    interface Window {
        KiwoomPaySDK: any;
    }
}

export default function PayButton({ appointmentId, paymentId, amount, customerName }: { appointmentId: string, paymentId: string, amount: number, customerName: string }) {
    const [loading, setLoading] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const t = useTranslations('Dashboard.appointments.payment');
    const locale = useLocale();
    // Using env variable or fallback to test store
    const mid = process.env.NEXT_PUBLIC_KIWOOM_MID || "CTS11027";

    const handlePayClick = async () => {
        setLoading(true);
        try {
            // 0. Detect Mobile
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const payType = isMobile ? "M" : "P"; // M: Mobile (Self), P: Popup

            // 1. Get Hash from Server
            const hashParams = {
                CPID: mid,
                PAYMETHOD: "CARD",
                ORDERNO: paymentId,
                TYPE: payType,
                AMOUNT: amount.toString()
            };

            const hashResult = await getKiwoomHash(hashParams);

            if (!hashResult.success || !hashResult.KIWOOM_ENC) {
                throw new Error(hashResult.error || "Failed to generate payment hash");
            }

            // 2. Submit Form
            const form = document.createElement("form");
            form.method = "POST";
            form.action = process.env.NEXT_PUBLIC_KIWOOM_PAY_ACTION_URL || "https://apitest.kiwoompay.co.kr/pay/linkEnc";
            form.acceptCharset = "euc-kr";

            if (isMobile) {
                form.target = "_self";
            } else {
                form.target = "KiwoomPayPopup";
                // Open Popup window for desktop
                window.open("", "KiwoomPayPopup", "width=468,height=750");
            }

            const addField = (name: string, value: string) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = name;
                input.value = value;
                form.appendChild(input);
            };

            // Add Hash Params
            addField("CPID", hashParams.CPID);
            addField("PAYMETHOD", hashParams.PAYMETHOD);
            addField("ORDERNO", hashParams.ORDERNO);
            addField("TYPE", hashParams.TYPE);
            addField("AMOUNT", hashParams.AMOUNT);
            addField("KIWOOM_ENC", hashResult.KIWOOM_ENC);

            // Add Other Params required by Error Message
            addField("PRODUCTNAME", "콜닥-마트의원");
            addField("PRODUCTTYPE", "2"); // 1: Real, 2: Digital/Service
            addField("USERID", customerName);

            // Add return URLs for Mobile (important for redirect flow)
            // Even if JSP sample didn't emphasize them, standard mobile flow needs them to return to app
            if (isMobile) {
                const baseUrl = window.location.origin;
                addField("ReturnUrl", `${baseUrl}/${locale}/payment/success`);
                addField("StopUrl", `${baseUrl}/${locale}/payment/fail`);
            }

            document.body.appendChild(form);

            form.submit();

            // Clean up
            document.body.removeChild(form);

        } catch (error: any) {
            console.error("Payment Error:", error);
            alert(`Payment initialization failed: ${error?.message || JSON.stringify(error)}`);
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
            {loading ? t('processing') : t('payButton', { amount: amount.toLocaleString() })}
        </button>
    );
}
