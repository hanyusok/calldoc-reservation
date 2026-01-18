
import { getAdminAppointments } from "@/app/actions/admin";
import AppointmentStatusSelect from "@/components/admin/AppointmentStatusSelect";
import { AppointmentStatus } from "@prisma/client";
import Link from "next/link";
import { format } from "date-fns";

export default async function AdminAppointmentsPage({
    searchParams
}: {
    searchParams: { page?: string, status?: string }
}) {
    const page = Number(searchParams.page) || 1;
    const status = searchParams.status as AppointmentStatus | undefined;

    const { appointments, total, totalPages } = await getAdminAppointments(page, 10, status);

    const tabs = [
        { label: "All", value: undefined },
        { label: "Pending", value: "PENDING" },
        { label: "Confirmed", value: "CONFIRMED" },
        { label: "Completed", value: "COMPLETED" },
        { label: "Cancelled", value: "CANCELLED" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Appointments</h1>
                <div className="flex space-x-2">
                    {tabs.map(tab => (
                        <Link
                            key={tab.label}
                            href={`?status=${tab.value || ''}`}
                            className={`px-3 py-1 rounded-full text-sm ${(tab.value === status) || (!tab.value && !status)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                                }`}
                        >
                            {tab.label}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date & Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Patient</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {appointments.map((appt) => (
                            <tr key={appt.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium">{format(appt.startDateTime, 'PPP')}</div>
                                    <div className="text-sm text-gray-500">{format(appt.startDateTime, 'p')} - {format(appt.endDateTime, 'p')}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{appt.patient.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <AppointmentStatusSelect id={appt.id} currentStatus={appt.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {appt.payment ? (
                                        <div className={`flex items-center gap-2 ${appt.payment.status === 'COMPLETED' ? 'text-green-600' : 'text-orange-600'}`}>
                                            <span className="font-semibold">{appt.payment.status}</span>
                                            <span>({appt.payment.amount.toLocaleString()} KRW)</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">No Record</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {/* Action buttons like View Details could go here */}
                                    <button className="text-blue-600 hover:underline">View</button>
                                </td>
                            </tr>
                        ))}
                        {appointments.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No appointments found.
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
                    Previous
                </Link>
                <span className="px-3 py-1">Page {page} of {totalPages || 1}</span>
                <Link
                    href={`?page=${Math.min(totalPages, page + 1)}${status ? `&status=${status}` : ''}`}
                    className={`px-3 py-1 rounded border ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
                >
                    Next
                </Link>
            </div>
        </div>
    );
}
