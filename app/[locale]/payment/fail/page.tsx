import { XCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";



export default async function PaymentFailPage({ searchParams, params }: {
    searchParams: Promise<{
        code?: string;
        message?: string;
        orderId?: string;
        res_msg?: string; // Kiwoom might send this
    }>;
    params: Promise<{
        locale: string;
    }>;
}) {
    const { message, res_msg, code } = await searchParams;
    const { locale } = await params;
    const t = await getTranslations('Payment');

    // Determine if it's a cancellation or error
    // Kiwoom often sends "매입취소" or "사용자취소" in res_msg
    const displayMsg = message || res_msg || "";
    const isCancel = displayMsg.includes("취소") || displayMsg.includes("Cancel") || displayMsg === ""; // Empty often means just back button/stop url hit

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center border border-gray-100">
                <XCircle className={`w-16 h-16 mx-auto mb-4 ${isCancel ? 'text-gray-400' : 'text-rose-500'}`} />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {isCancel ? t('canceled.title') : t('fail.title')}
                </h1>
                <p className="text-gray-600 mb-2">
                    {displayMsg || (isCancel ? t('canceled.description') : "")}
                </p>
                {code && <p className="text-sm text-gray-500 mb-6">Code: {code}</p>}

                <Link
                    href={`/${locale}/dashboard`}
                    replace
                    className="inline-block bg-gray-100 text-gray-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition mt-6 active:scale-95 shadow-sm"
                >
                    {isCancel ? t('canceled.returnToDashboard') : t('fail.returnToDashboard')}
                </Link>
            </div>
        </div>
    );
}
