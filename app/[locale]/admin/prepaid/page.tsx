
import { getPrepaidTransactions } from "@/app/actions/admin";
import PrepaidManager from "@/components/admin/PrepaidManager";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import Link from "next/link";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function AdminPrepaidPage({
    searchParams,
    params: { locale }
}: {
    searchParams: { page?: string };
    params: { locale: string };
}) {
    const page = Number(searchParams.page) || 1;
    const { transactions, total, totalPages } = await getPrepaidTransactions(page, 20);
    const t = await getTranslations('Admin');
    const tPrepaid = await getTranslations('Admin.prepaid');
    const dateLocale = locale === 'ko' ? ko : enUS;

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">{tPrepaid('title')}</h1>

            {/* Management Section */}
            {/* @ts-ignore */}
            <PrepaidManager />

            {/* Transactions List */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">{tPrepaid('recentTransactions')}</h2>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{tPrepaid('table.date')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{tPrepaid('table.user')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{tPrepaid('table.type')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{tPrepaid('table.amount')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{tPrepaid('table.description')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {transactions.map((txn) => (
                                <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {format(txn.createdAt, 'PP p', { locale: dateLocale })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium">{txn.user.name || "Unknown"}</div>
                                        <div className="text-xs text-gray-500">{txn.user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${txn.type === 'DEPOSIT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {txn.type === 'DEPOSIT' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownLeft className="w-3 h-3 mr-1" />}
                                            {tPrepaid(`table.typeEnum.${txn.type}`)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-bold">
                                        {txn.amount.toLocaleString()} KRW
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {txn.description}
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        {t('common.noRecords')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-center gap-2">
                    <Link
                        href={`?page=${Math.max(1, page - 1)}`}
                        className={`px-3 py-1 rounded border ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
                    >
                        {t('common.previous')}
                    </Link>
                    <span className="px-3 py-1">{t('common.page', { current: page, total: totalPages || 1 })}</span>
                    <Link
                        href={`?page=${Math.min(totalPages, page + 1)}`}
                        className={`px-3 py-1 rounded border ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
                    >
                        {t('common.next')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
