import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";
import { LayoutDashboard, Users, Calendar, LogOut, UserCog, Clock, Building2, Banknote, Video } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function AdminLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const session = await getServerSession(authOptions);
    const t = await getTranslations('Admin.sidebar');

    // Check for admin or staff role
    const userRole = (session?.user as any)?.role;
    if (!session?.user || ![Role.ADMIN, Role.STAFF].includes(userRole)) {
        redirect(`/${locale}/auth/login`);
    }

    const allNavItems = [
        { href: `/${locale}/admin`, label: t('dashboard'), icon: LayoutDashboard, roles: [Role.ADMIN, Role.STAFF] },
        { href: `/${locale}/admin/users`, label: t('users'), icon: UserCog, roles: [Role.ADMIN] },
        { href: `/${locale}/admin/patients`, label: t('patients'), icon: Users, roles: [Role.ADMIN, Role.STAFF] },
        { href: `/${locale}/admin/appointments`, label: t('appointments'), icon: Calendar, roles: [Role.ADMIN, Role.STAFF] },
        { href: `/${locale}/admin/payments`, label: t('payments'), icon: Banknote, roles: [Role.ADMIN] },
        { href: `/${locale}/admin/meet`, label: t('meet'), icon: Video, roles: [Role.ADMIN] },
    ];

    const navItems = allNavItems.filter(item => item.roles.includes(userRole));

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex flex-col">
                <div className="p-6 border-b dark:border-gray-700">
                    <h1 className="text-2xl font-bold text-blue-600">{t('title')}</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t dark:border-gray-700">
                    <Link
                        href={`/${locale}/admin/pharmacies`}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mb-2 text-gray-700"
                    >
                        <Building2 className="w-5 h-5" />
                        <span className="font-medium">{t('pharmacies')}</span>
                    </Link>
                    {userRole === Role.ADMIN && (
                        <Link
                            href={`/${locale}/admin/schedule`}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mb-2 text-gray-700"
                        >
                            <span className="font-medium">{t('schedule')}</span>
                        </Link>
                    )}

                    <div className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-500">
                        <span>{session.user.email}</span>
                    </div>
                    <LogoutButton label={t('logout')} />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
