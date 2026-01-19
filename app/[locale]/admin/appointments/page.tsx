
import { getAdminAppointments } from "@/app/actions/admin";
import AppointmentStatusSelect from "@/components/admin/AppointmentStatusSelect";
import { AppointmentStatus } from "@prisma/client";
import Link from "next/link";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import AddAppointmentButton from "@/components/admin/AddAppointmentButton";
import AppointmentActions from "@/components/admin/AppointmentActions";
import AppointmentFlowManager from "@/components/admin/AppointmentFlowManager";
import { getTranslations } from "next-intl/server";

export default async function AdminAppointmentsPage({
    searchParams,
    params: { locale }
}: {
    searchParams: { page?: string, status?: string };
    params: { locale: string };
}) {
    const page = Number(searchParams.page) || 1;
    const status = searchParams.status as AppointmentStatus | undefined;
    const t = await getTranslations('Admin');

    const { appointments, total, totalPages } = await getAdminAppointments(page, 10, status);
    const dateLocale = locale === 'ko' ? ko : enUS;

    const tabs = [
        { label: t('appointments.tabs.all'), value: undefined },
        { label: t('appointments.tabs.pending'), value: "PENDING" },
        { label: t('appointments.tabs.confirmed'), value: "CONFIRMED" },
        { label: t('appointments.tabs.completed'), value: "COMPLETED" },
        { label: t('appointments.tabs.cancelled'), value: "CANCELLED" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{t('appointments.title')}</h1>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">{t('common.total', { count: total })}</div>
                    <AddAppointmentButton />
                </div>
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-2">
                {tabs.map(tab => (
                    <Link
                        key={tab.label}
                        href={`?status=${tab.value || ''}`}
                        className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${(tab.value === status) || (!tab.value && !status)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                    >
                        {tab.label}
                    </Link>
                ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto border border-gray-200 dark:border-gray-700">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('appointments.table.dateTime')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('appointments.table.patient')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('appointments.table.status')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('appointments.table.payment')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {appointments.map((appt) => (
                            <tr key={appt.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium">{format(appt.startDateTime, 'PPP', { locale: dateLocale })}</div>
                                    <div className="text-sm text-gray-500">{format(appt.startDateTime, 'p', { locale: dateLocale })} - {format(appt.endDateTime, 'p', { locale: dateLocale })}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{appt.patient.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <AppointmentStatusSelect id={appt.id} currentStatus={appt.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {appt.payment ? (
                                        <div className={`flex items-center gap-2 ${appt.payment.status === 'COMPLETED' ? 'text-green-600' : 'text-orange-600'}`}>
                                            <span className="font-semibold">{t(`statusEnum.${appt.payment.status}`)}</span>
                                            <span>({appt.payment.amount.toLocaleString()} KRW)</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">{t('appointments.table.noRecord')}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {/* @ts-ignore */}
                                        <AppointmentFlowManager appointment={appt} />
                                        {/* @ts-ignore */}
                                        <AppointmentActions appointment={appt} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {appointments.length === 0 && (
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
                    href={`?page=${Math.max(1, page - 1)}${status ? `&status=${status}` : ''}`}
                    className={`px-3 py-1 rounded border ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
                >
                    {t('common.previous')}
                </Link>
                <span className="px-3 py-1">{t('common.page', { current: page, total: totalPages || 1 })}</span>
                <Link
                    href={`?page=${Math.min(totalPages, page + 1)}${status ? `&status=${status}` : ''}`}
                    className={`px-3 py-1 rounded border ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
                >
                    {t('common.next')}
                </Link>
            </div>
        </div >
    );
}
