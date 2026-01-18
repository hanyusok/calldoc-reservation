import { getAdminStats } from "@/app/actions/admin";
import { Users, Calendar, Clock, DollarSign } from "lucide-react";

export default async function AdminDashboardPage() {
    const stats = await getAdminStats();

    // Helper for formatting currency (KRW)
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
    };

    const statCards = [
        { label: "Total Patients", value: stats.totalPatients, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
        { label: "Total Appointments", value: stats.totalAppointments, icon: Calendar, color: "text-purple-600", bg: "bg-purple-100" },
        { label: "Pending Appointments", value: stats.pendingAppointments, icon: Clock, color: "text-orange-600", bg: "bg-orange-100" },
        { label: "Revenue", value: formatCurrency(stats.revenue), icon: DollarSign, color: "text-green-600", bg: "bg-green-100" },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
                        <div className={`p-4 rounded-full flex-shrink-0 ${stat.bg}`}>
                            <stat.icon className={`w-8 h-8 ${stat.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium truncate">{stat.label}</p>
                            <p className="text-xl md:text-2xl font-bold truncate" title={String(stat.value)}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Todo: Recent Activity Table or Charts could go here */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4">Welcome, Admin</h2>
                <p className="text-gray-600 dark:text-gray-300">
                    Select a category from the sidebar to manage the application.
                </p>
            </div>
        </div>
    );
}
