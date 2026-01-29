
import { getAdminPayments, getPaymentStats } from "@/app/actions/admin";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { getTranslations } from "next-intl/server";
import Pagination from "@/components/admin/Pagination";
import CancelPaymentButton from "@/components/admin/CancelPaymentButton";

export default async function AdminPaymentsPage({
    searchParams,
    params: { locale }
}: {
    searchParams: { page?: string, status?: string };
    params: { locale: string };
}) {
    const page = Number(searchParams.page) || 1;
    const status = searchParams.status || undefined;
    const t = await getTranslations('Admin');
    const tCommon = await getTranslations('Common');

    const { payments, total, totalPages } = await getAdminPayments(page, 10, status);
    const { dailyRevenue } = await getPaymentStats();

    const dateLocale = locale === 'ko' ? ko : enUS;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{t('payments.title')}</h1>
            </div>

            {/* Stats Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 font-medium">{t('payments.dailyTotal')}</div>
                <div className="text-3xl font-bold text-blue-600 mt-2">
                    {dailyRevenue.toLocaleString()} <span className="text-lg text-gray-500">KRW</span>
                </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto border border-gray-200 dark:border-gray-700">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('payments.table.date')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('payments.table.patient')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('payments.table.amount')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('payments.table.method')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('payments.table.status')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{tCommon('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {payments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    {format(payment.createdAt, 'PPP p', { locale: dateLocale })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    {payment.appointment.patient.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {payment.amount.toLocaleString()} KRW
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {t(`paymentMethodEnum.${payment.method}`)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full 
                                        ${payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                            payment.status === 'CANCELED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {t(`statusEnum.${payment.status}`)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {['COMPLETED', 'PENDING'].includes(payment.status) && (
                                        <CancelPaymentButton
                                            paymentId={payment.id}
                                            amount={payment.amount}
                                            label={t('payments.actions.cancel')}
                                            confirmMsg={t('payments.actions.cancelConfirm')}
                                        />
                                    )}
                                </td>
                            </tr>
                        ))}
                        {payments.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    {tCommon('noRecords')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <Pagination page={page} totalPages={totalPages} />
        </div>
    );
}
