import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Users, Calendar, ChevronRight, Clock } from "lucide-react"
import { getUserAppointments } from "@/app/actions/appointment"
import { startOfToday } from "date-fns"
import { ko, enUS } from 'date-fns/locale'
import { getTranslations } from 'next-intl/server';
import AppointmentCard from "@/components/dashboard/AppointmentCard"
import PastAppointments from "@/components/dashboard/PastAppointments"

import LogoutButton from "@/components/LogoutButton"
import LanguageSwitcher from "@/components/LanguageSwitcher"

export default async function DashboardPage({ params: { locale } }: { params: { locale: string } }) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/auth/login')
    }

    const appointments = await getUserAppointments();

    // Split appointments
    const today = startOfToday();
    const upcoming = appointments.filter(a => new Date(a.startDateTime) >= today);
    const past = appointments.filter(a => new Date(a.startDateTime) < today);

    const t = await getTranslations('Dashboard');

    // Date formatting helper
    const dateLocale = locale === 'ko' ? ko : enUS;
    const dateFormatStr = locale === 'ko' ? 'yyyy년 M월 d일' : 'MMMM d, yyyy';

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <div className="text-sm text-gray-500 hidden sm:block">{session.user?.name}</div>
                        <LanguageSwitcher />
                        <LogoutButton />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">



                {/* Quick Actions / Status Cards */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <Link href="/dashboard/profile" className="block">
                        <div className="bg-white overflow-hidden shadow rounded-lg p-5 flex items-center justify-between active:bg-gray-50 transition">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">{t('quickActions.family.title')}</h3>
                                    <p className="text-sm text-gray-500">{t('quickActions.family.desc')}</p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                    </Link>

                    <Link href="/book" className="block">
                        <div className="bg-white overflow-hidden shadow rounded-lg p-5 flex items-center justify-between active:bg-gray-50 transition border-l-4 border-teal-500">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-teal-100 rounded-md p-3">
                                    <Calendar className="h-6 w-6 text-teal-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">{t('quickActions.book.title')}</h3>
                                    <p className="text-sm text-gray-500">{t('quickActions.book.desc')}</p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                    </Link>

                </section>

                {/* Upcoming Appointments */}
                <section>
                    <h2 className="text-lg font-medium text-gray-900 mb-3">{t('appointments.title')}</h2>

                    {appointments.length > 0 ? (
                        <>
                            <div className="space-y-4">
                                {upcoming.map(appt => (
                                    <AppointmentCard key={appt.id} appointment={appt} />
                                ))}
                            </div>

                            {/* Past Appointments (Collapsible) */}
                            <PastAppointments appointments={past} />
                        </>
                    ) : (
                        <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
                            <Calendar className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                            <p>{t('appointments.empty')}</p>
                            <Link href="/book" className="text-teal-600 font-medium text-sm mt-2 inline-block">
                                {t('appointments.bookNow')} &rarr;
                            </Link>
                        </div>
                    )}
                </section>

            </main>
        </div>
    )
}
