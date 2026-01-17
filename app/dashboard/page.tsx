import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Users, Calendar, CreditCard, ChevronRight, Clock } from "lucide-react"
import { getUserAppointments } from "../actions/appointment"
import { format } from "date-fns"

import LogoutButton from "@/components/LogoutButton"

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/auth/login')
    }

    const appointments = await getUserAppointments()

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-500">{session.user?.name}</div>
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
                                    <h3 className="text-lg font-medium text-gray-900">My Family</h3>
                                    <p className="text-sm text-gray-500">Manage profiles</p>
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
                                    <h3 className="text-lg font-medium text-gray-900">Book Appointment</h3>
                                    <p className="text-sm text-gray-500">Schedule a new visit</p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                    </Link>

                </section>

                {/* Upcoming Appointments */}
                <section>
                    <h2 className="text-lg font-medium text-gray-900 mb-3">Your Appointments</h2>

                    {appointments.length > 0 ? (
                        <div className="space-y-4">
                            {appointments.map(appt => (
                                <div key={appt.id} className="bg-white shadow rounded-lg p-5 border-l-4 border-blue-500">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900 flex items-center">
                                                {format(new Date(appt.startDateTime), 'MMMM d, yyyy')}
                                            </h3>
                                            <div className="text-gray-600 flex items-center mt-1">
                                                <Clock className="h-4 w-4 mr-1" />
                                                {format(new Date(appt.startDateTime), 'HH:mm')} - {format(new Date(appt.endDateTime), 'HH:mm')}
                                            </div>
                                            <div className="text-sm text-gray-500 mt-2">
                                                Patient: <strong>{appt.patient.name}</strong>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-sm font-bold px-2 py-1 rounded inline-block ${appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {appt.status}
                                            </div>
                                            <div className={`text-xs mt-1 ${appt.payment?.status === 'COMPLETED' ? 'text-green-600' : 'text-red-500'}`}>
                                                {appt.payment?.status === 'PENDING' ? 'Payment Required' : 'Paid'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
                            <Calendar className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                            <p>No upcoming appointments.</p>
                            <Link href="/book" className="text-teal-600 font-medium text-sm mt-2 inline-block">
                                Book Now &rarr;
                            </Link>
                        </div>
                    )}
                </section>

            </main>
        </div>
    )
}
