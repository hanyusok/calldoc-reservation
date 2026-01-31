import { redirect } from "next/navigation";
import { confirmPayment } from "@/app/actions/payment";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";



export default async function PaymentSuccessPage({ searchParams, params }: {
    searchParams: Promise<{
        paymentKey?: string;
        orderId?: string;
        amount?: string;
        AuthNo?: string;
        OrdNo?: string;
        Price?: string;
        [key: string]: string | undefined;
    }>;
    params: Promise<{
        locale: string;
    }>;
}) {
    const { locale } = await params;
    const resolvedSearchParams = await searchParams;
    // Resolve params checking both standard and Kiwoom keys
    // DAOUTRX is the Transaction ID needed for cancellation.
    const paymentKey = resolvedSearchParams.DAOUTRX || resolvedSearchParams.dAouTrx || resolvedSearchParams.paymentKey || resolvedSearchParams.AuthNo || "";
    const orderId = resolvedSearchParams.orderId || resolvedSearchParams.OrdNo || "";
    const amountStr = resolvedSearchParams.amount || resolvedSearchParams.Price || "0";
    const amount = parseInt(amountStr);

    const t = await getTranslations('Payment');

    const result = await confirmPayment(paymentKey, orderId, amount);

    if (!result.success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">{t('fail.title')}</h1>
                    <p className="text-gray-600 mb-6">{result.error}</p>
                    <a href={`/${locale}/dashboard`} className="text-blue-600 hover:underline">{t('fail.returnToDashboard')}</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('success.title')}</h1>
                <p className="text-gray-600 mb-6">
                    {t('success.description', { amount: amount.toLocaleString() })}
                </p>
                <Link
                    href={`/${locale}/dashboard`}
                    replace
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                    {t('success.returnToDashboard')}
                </Link>
            </div>
        </div>
    );
}
