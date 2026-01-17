import { getAdminAppointments, updateAppointmentStatus } from "@/app/actions/admin"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { Check, X } from "lucide-react"

import LogoutButton from "@/components/LogoutButton"

export default async function AdminPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/auth/login')

    const appointments = await getAdminAppointments()

    return (
        <div className="min-h-screen bg-gray-100 pb-20">
            <header className="bg-white shadow-sm sticky top-0 z-10 px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <LogoutButton />
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {appointments.map((appt) => (
                            <li key={appt.id} className="p-4 hover:bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                                <div>
                                    <div className="font-bold text-lg text-gray-900">
                                        {format(new Date(appt.startDateTime), 'MMM d, HH:mm')} - {format(new Date(appt.endDateTime), 'HH:mm')}
                                    </div>
                                    <div className="text-gray-700">{appt.patient.name} ({appt.patient.relationship})</div>
                                    <div className="text-sm text-gray-500">
                                        Status: <span className={`font-medium ${appt.status === 'CONFIRMED' ? 'text-green-600' : 'text-yellow-600'}`}>{appt.status}</span>
                                        <span className="mx-2">•</span>
                                        Payment: <span className={`font-medium ${appt.payment?.status === 'COMPLETED' ? 'text-green-600' : 'text-red-600'}`}>{appt.payment?.status ?? 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    {appt.payment?.status === 'PENDING' && (
                                        <form action={async () => {
                                            'use server';
                                            await updateAppointmentStatus(appt.id, 'CONFIRMED', 'COMPLETED');
                                        }}>
                                            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                                                <Check className="h-4 w-4 mr-2" /> Confirm Payment
                                            </button>
                                        </form>
                                    )}
                                    {/* Cancel Button */}
                                    {appt.status !== 'CANCELLED' && (
                                        <form action={async () => {
                                            'use server';
                                            await updateAppointmentStatus(appt.id, 'CANCELLED', 'REFUNDED');
                                        }}>
                                            <button className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium">
                                                <X className="h-4 w-4 mr-2" /> Cancel
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                    {appointments.length === 0 && <div className="p-12 text-center text-gray-500">No appointments found.</div>}
                </div>
            </main>
        </div>
    )
}
