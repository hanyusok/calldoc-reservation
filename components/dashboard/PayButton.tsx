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
    // Using the provided Test MID
    const mid = "CTS11027";

    const handlePayClick = async () => {
        setLoading(true);
        try {
            // 1. Get Hash from Server
            const hashParams = {
                CPID: mid,
                PAYMETHOD: "CARD",
                ORDERNO: paymentId,
                TYPE: "P", // "P" for Popup, usually. Or "CARD" based on JSP sample key usage?
                // JSP uses: jsonObj.put("TYPE", TYPE); where TYPE is from param.
                // HTML sample: var PayType = pf.TYPE.value; <input type="hidden" name="TYPE" value="P"> (in some samples)
                // Let's check the JSP sample logic again. JSP: input `TYPE`, put `TYPE`.
                // HTML sample: `pf.TYPE.value`
                // Error message said "TYPE" was required.
                // Re-reading JSP: `String TYPE = request.getParameter("TYPE");`
                // Let's assume TYPE="P" (Popup) or "W" (Web) based on sample.
                // Wait, previous error said `TYPE, CPID...`.
                // Let's try TYPE="CARD" if the error message implied Payment Type, OR "P" if it implies UI Mode.
                // The HTML Sample usually has <input name="TYPE" value="P"> for Popup.
                // AND <input name="PAYMETHOD" value="CARD">.
                // So I will send TYPE="P" and PAYMETHOD="CARD".
                AMOUNT: amount.toString()
            };

            const hashResult = await getKiwoomHash(hashParams);

            if (!hashResult.success || !hashResult.KIWOOM_ENC) {
                throw new Error(hashResult.error || "Failed to generate payment hash");
            }

            // 2. Submit Form
            const form = document.createElement("form");
            form.method = "POST";
            form.action = "https://apitest.kiwoompay.co.kr/pay/linkEnc"; // Test Environment
            form.target = "KiwoomPayPopup"; // Open in popup

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
            addField("PRODUCTNAME", `Medical Appointment ${appointmentId}`);
            addField("PRODUCTTYPE", "2"); // 1: Real, 2: Digital/Service
            addField("USERID", customerName);

            // Add Return URLs? The JSP/HTML sample implies they might be configured in the hash or separately?
            // HTML Sample didn't show ReturnURL in the ajax data, but it might be in the form submit if the endpoint supports it.
            // The previous SDK attempt used ReturnUrl. Link Integration usually relies on the Notification URL configured in the Merchant Admin,
            // OR checks the result in the popup opener.
            // However, typical Link Integration (like Naver Pay) accepts return urls.
            // Let's verify if I should include them.
            // For now, I'll stick to the required fields from the error + hash fields.

            document.body.appendChild(form);

            // Open Popup window
            window.open("", "KiwoomPayPopup", "width=468,height=750");

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
