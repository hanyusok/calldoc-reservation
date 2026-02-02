import { getAdminStats, getRecentPrescriptions } from "@/app/actions/admin";
import PrescriptionListCard from "@/components/admin/PrescriptionListCard";
import { Users, Calendar, Clock, DollarSign } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";

import StaffDashboard from "@/components/admin/StaffDashboard";

export default async function AdminDashboardPage() {
    const session = await getServerSession(authOptions);

    // Render STAFF dashboard
    if ((session?.user as any)?.role === Role.STAFF) {
        return <StaffDashboard />;
    }

    const stats = await getAdminStats();
    const recentPrescriptions = await getRecentPrescriptions();
    const t = await getTranslations('Admin.dashboard');

    // Helper for formatting currency (KRW)
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
    };

    const statCards = [
        { label: t('stats.patients'), value: stats.totalPatients, icon: Users },
        { label: t('stats.appointments'), value: stats.totalAppointments, icon: Calendar },
        { label: t('stats.pending'), value: stats.pendingAppointments, icon: Clock, highlight: stats.pendingAppointments > 0 },
        { label: t('stats.revenue'), value: formatCurrency(stats.revenue), icon: DollarSign },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('title')}</h1>
                <p className="text-sm text-gray-500 mt-1">{t('overview')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-black p-6 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</span>
                            <stat.icon className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex items-baseline">
                            <span className={`text-3xl font-bold tracking-tight ${stat.highlight ? 'text-orange-600' : 'text-gray-900 dark:text-white'}`}>
                                {stat.value}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lower Section: Recent Activity & Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Recent Prescriptions (Wider 2/3) */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('recentPrescriptions')}</h2>
                    <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <PrescriptionListCard prescriptions={recentPrescriptions} />
                    </div>
                </div>

                {/* Right: Info/Actions */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('quickActions')}</h2>
                    <div className="bg-white dark:bg-black p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 h-fit">
                        <h2 className="text-sm font-semibold text-gray-900 mb-2">{t('welcome')}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            {t('instruction')}
                        </p>

                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                            <a href="#" className="text-sm font-medium text-black hover:underline">{t('viewDocumentation')} →</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
