import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getTranslations } from 'next-intl/server';
import AppointmentCard from "@/components/dashboard/AppointmentCard"
import PharmacyContentCard from "@/components/dashboard/PharmacyContentCard"
import { startOfToday } from "date-fns"

export default async function AppointmentDetailsPage({
    params: { locale, id }
}: {
    params: { locale: string, id: string }
}) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) redirect('/auth/login')

    const t = await getTranslations('Dashboard');

    const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
            patient: true,
            payment: true,
            prescription: true
        }
    })

    if (!appointment) notFound();

    // Verify ownership
    // Retrieve patient to check userId
    const patient = appointment.patient;
    if (patient.userId !== session.user.id) {
        // If strict security is needed, assume only owner can view.
        // Admins have different portal.
        notFound();
    }

    const isPast = new Date(appointment.startDateTime) < startOfToday();

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center">
                    <Link href="/dashboard" className="mr-4 text-gray-500 hover:text-gray-700">
                        &larr; {t('back')}
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">{t('appointments.details')}</h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                <AppointmentCard appointment={appointment} isPast={isPast} />

                {appointment.prescription && (
                    <PharmacyContentCard
                        name={appointment.prescription.pharmacyName}
                        fax={appointment.prescription.pharmacyFax || undefined}
                        phone={appointment.prescription.pharmacyPhone || undefined}
                        address={appointment.prescription.pharmacyAddress || undefined}
                    />
                )}
            </main>
        </div>
    )
}
