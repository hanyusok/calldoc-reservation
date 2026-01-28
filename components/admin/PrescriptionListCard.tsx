import { useTranslations } from 'next-intl';
import { PillBottle, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';

export default function PrescriptionListCard({ prescriptions }: { prescriptions: any[] }) {
    const t = useTranslations('Admin.dashboard.prescriptions');
    const locale = useLocale();
    const dateLocale = locale === 'ko' ? ko : enUS;

    const tEnum = useTranslations('Admin.prescriptionStatusEnum');

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ISSUED':
                return <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold"><CheckCircle className="w-3 h-3 mr-1" /> {tEnum('ISSUED')}</span>;
            case 'PENDING':
                return <span className="flex items-center text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs font-bold"><Clock className="w-3 h-3 mr-1" /> {status}</span>;
            case 'REQUESTED':
                return <span className="flex items-center text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs font-bold"><AlertCircle className="w-3 h-3 mr-1" /> {tEnum('REQUESTED')}</span>;
            default:
                return <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded text-xs">{status}</span>;
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold flex items-center">
                    <PillBottle className="w-5 h-5 mr-2 text-blue-600" />
                    {t('title')}
                </h2>
                {/* <Link href="/admin/prescriptions" className="text-sm text-blue-600 hover:underline">{t('viewAll')}</Link> */}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-500 border-b">
                            <th className="pb-2 font-medium">{t('date')}</th>
                            <th className="pb-2 font-medium">{t('patient')}</th>
                            <th className="pb-2 font-medium">{t('pharmacy')}</th>
                            <th className="pb-2 font-medium">{t('status')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prescriptions.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-4 text-center text-gray-500">
                                    {t('empty')}
                                </td>
                            </tr>
                        ) : (
                            prescriptions.map((p) => (
                                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="py-3 text-gray-600">
                                        {format(new Date(p.createdAt), 'MM/dd HH:mm', { locale: dateLocale })}
                                    </td>
                                    <td className="py-3 font-medium">
                                        {p.appointment?.patient?.name || '-'}
                                    </td>
                                    <td className="py-3 text-gray-600 truncate max-w-[150px]" title={p.pharmacyName}>
                                        {p.pharmacyName}
                                    </td>
                                    <td className="py-3">
                                        {getStatusBadge(p.status)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
