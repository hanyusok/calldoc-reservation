import { XCircle } from "lucide-react";

interface Props {
    searchParams: {
        code: string;
        message: string;
        orderId: string;
    };
    params: {
        locale: string;
    };
}

export default function PaymentFailPage({ searchParams, params: { locale } }: Props) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
                <p className="text-gray-600 mb-2">{searchParams.message}</p>
                <p className="text-sm text-gray-500 mb-6">Code: {searchParams.code}</p>

                <a
                    href={`/${locale}/dashboard`}
                    className="inline-block bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                    Return to Dashboard
                </a>
            </div>
        </div>
    );
}
