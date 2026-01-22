import { getPatients, addPatient, deletePatient, updatePatient } from "@/app/actions/patient"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Plus, Trash2, User as UserIcon, Pencil } from "lucide-react"
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import PatientForm from './PatientForm';

export default async function ProfilePage({
    searchParams
}: {
    searchParams: { edit?: string }
}) {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/auth/login')

    const patients = await getPatients()
    const t = await getTranslations('Profile');

    const editId = searchParams.edit;
    const rawPatient = editId ? patients.find(p => p.id === editId) : null;
    const editingPatient = rawPatient ? {
        ...rawPatient,
        dateOfBirth: rawPatient.dateOfBirth.toISOString(),
        createdAt: rawPatient.createdAt.toISOString(),
        updatedAt: rawPatient.updatedAt.toISOString(),
    } : null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center">
                    <Link href="/dashboard" className="mr-4 text-gray-500 hover:text-gray-700">
                        &larr; {t('back')}
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6 space-y-8">

                {/* Patient List */}
                <section>
                    <h2 className="text-lg font-medium text-gray-900 mb-3">{t('familyMembers')}</h2>
                    <div className="space-y-3">
                        {patients.map((patient) => (
                            <div key={patient.id} className="bg-white shadow rounded-lg p-4 flex justify-between items-center">
                                <div className="flex items-center">
                                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                                        <UserIcon className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{patient.name} {patient.relationship === 'SELF' && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full ml-1">{t('me')}</span>}</div>
                                        <div className="text-sm text-gray-500">{new Date(patient.dateOfBirth).toLocaleDateString()} • {patient.gender === 'MALE' ? t('form.gender.male') : t('form.gender.female')}</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                    {/* Edit Button */}
                                    <Link
                                        href={`/dashboard/profile?edit=${patient.id}`}
                                        className="text-blue-500 hover:text-blue-700 p-2"
                                        aria-label={t('edit')}
                                    >
                                        <Pencil className="h-5 w-5" />
                                    </Link>

                                    {patient.relationship !== 'SELF' && (
                                        <form action={async () => {
                                            'use server';
                                            await deletePatient(patient.id);
                                        }}>
                                            <button type="submit" className="text-red-500 hover:text-red-700 p-2" aria-label={t('delete')}>
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        ))}

                        {patients.length === 0 && (
                            <div className="text-center text-gray-500 py-4">{t('noPatients')}</div>
                        )}
                    </div>
                </section>

                {/* Add/Edit Patient Form */}
                <section className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        {editingPatient ? (
                            <><Pencil className="h-5 w-5 mr-2" /> {t('edit')}</>
                        ) : (
                            <><Plus className="h-5 w-5 mr-2" /> {t('addNew')}</>
                        )}
                    </h2>

                    <PatientForm editingPatient={editingPatient} />
                </section>

            </main>
        </div>
    )
}
