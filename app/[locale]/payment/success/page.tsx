import { redirect } from "next/navigation";
import { confirmPayment } from "@/app/actions/payment";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

interface Props {
    searchParams: {
        paymentKey: string;
        orderId: string;
        amount: string;
    };
    params: {
        locale: string;
    };
}

export default async function PaymentSuccessPage({ searchParams, params: { locale } }: Props) {
    const { paymentKey, orderId, amount } = searchParams;

    const result = await confirmPayment(paymentKey, orderId, parseInt(amount));

    if (!result.success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Payment Verification Failed</h1>
                    <p className="text-gray-600 mb-6">{result.error}</p>
                    <a href={`/${locale}/dashboard`} className="text-blue-600 hover:underline">Return to Dashboard</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                <p className="text-gray-600 mb-6">
                    Your payment of {parseInt(amount).toLocaleString()} KRW has been confirmed.
                </p>
                <a
                    href={`/${locale}/dashboard`}
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                    Return to Dashboard
                </a>
            </div>
        </div>
    );
}
