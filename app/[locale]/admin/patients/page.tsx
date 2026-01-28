import { getAdminPatients } from "@/app/actions/admin";
import Link from "next/link";
import { Search } from "lucide-react";
import AddEntityButton from "@/components/admin/AddEntityButton";
import PatientForm from "@/components/admin/PatientForm";
import PatientActions from "@/components/admin/PatientActions";
import { getTranslations } from "next-intl/server";

export default async function AdminPatientsPage({
    searchParams
}: {
    searchParams: { page?: string, search?: string }
}) {
    const page = Number(searchParams.page) || 1;
    const search = searchParams.search || "";
    const t = await getTranslations('Admin');

    const { patients, total, totalPages } = await getAdminPatients(page, 10, search);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{t('patients.title')}</h1>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">Total: {total}</div>
                    <AddEntityButton
                        buttonLabel={t('patients.addPatient')}
                        modalTitle={t('patients.addPatient')}
                        FormComponent={PatientForm}
                    />
                </div>
            </div>

            {/* Search Bar */}
            <form className="flex gap-2 max-w-md">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        name="search"
                        defaultValue={search}
                        placeholder={t('common.searchPlaceholder')}
                        className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:border-gray-700"
                    />
                </div>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    {t('common.search')}
                </button>
            </form>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto border border-gray-200 dark:border-gray-700">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('patients.table.name')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('patients.table.phoneNumber')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('patients.table.residentNumber')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('patients.table.relatedUser')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('patients.table.gender')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('patients.table.dob')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('patients.table.created')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {patients.map((patient) => (
                            <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{patient.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{patient.phoneNumber || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{patient.residentNumber || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span>{patient.user.name || "N/A"}</span>
                                        <span className="text-xs text-gray-500">{patient.user.email}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{t(`genderEnum.${patient.gender}`)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(patient.dateOfBirth).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                                    {new Date(patient.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    {/* @ts-ignore - Date types compatible enough */}
                                    <PatientActions patient={patient} />
                                </td>
                            </tr>
                        ))}
                        {patients.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
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
                    href={`?page=${Math.max(1, page - 1)}&search=${search}`}
                    className={`px-3 py-1 rounded border ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
                >
                    {t('common.previous')}
                </Link>
                <span className="px-3 py-1">{t('common.page', { current: page, total: totalPages || 1 })}</span>
                <Link
                    href={`?page=${Math.min(totalPages, page + 1)}&search=${search}`}
                    className={`px-3 py-1 rounded border ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
                >
                    {t('common.next')}
                </Link>
            </div>
        </div>
    );
}
