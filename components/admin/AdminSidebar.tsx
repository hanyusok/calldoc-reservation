"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Calendar, UserCog, Clock, Building2, Banknote, Video, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import { Role } from "@prisma/client";

interface AdminSidebarProps {
    userRole: string;
    locale: string;
    email: string;
}

export default function AdminSidebar({ userRole, locale, email }: AdminSidebarProps) {
    const t = useTranslations('Admin.sidebar');
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Persist collapsed state
    useEffect(() => {
        const savedState = localStorage.getItem("adminSidebarCollapsed");
        if (savedState) setIsCollapsed(savedState === "true");
        setMounted(true);
    }, []);

    const toggleSidebar = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem("adminSidebarCollapsed", String(newState));
    };

    const allNavItems = [
        { href: `/${locale}/admin`, label: t('dashboard'), icon: LayoutDashboard, roles: [Role.ADMIN, Role.STAFF] },
        { href: `/${locale}/admin/users`, label: t('users'), icon: UserCog, roles: [Role.ADMIN] },
        { href: `/${locale}/admin/patients`, label: t('patients'), icon: Users, roles: [Role.ADMIN, Role.STAFF] },
        { href: `/${locale}/admin/appointments`, label: t('appointments'), icon: Calendar, roles: [Role.ADMIN, Role.STAFF] },
        { href: `/${locale}/admin/payments`, label: t('payments'), icon: Banknote, roles: [Role.ADMIN] },
        { href: `/${locale}/admin/meet`, label: t('meet'), icon: Video, roles: [Role.ADMIN] },
    ];

    const navItems = allNavItems.filter(item => (item.roles as Role[]).includes(userRole as Role));

    // Prevent hydration mismatch by rendering a consistent state initially (or use mounted check)
    // Using simple conditional class for width

    return (
        <aside
            className={`bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 ease-in-out relative ${isCollapsed ? "w-[70px]" : "w-64"
                }`}
        >
            {/* Header / Brand */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
                {!isCollapsed && (
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2 animate-fadeIn">
                        <div className="w-5 h-5 bg-black dark:bg-white rounded-full"></div>
                        <span>calldoc</span>
                    </h1>
                )}
                {isCollapsed && (
                    <div className="w-full flex justify-center">
                        <div className="w-5 h-5 bg-black dark:bg-white rounded-full"></div>
                    </div>
                )}
            </div>

            {/* Toggle Button - Absolute positioned on border or just integrated */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-20 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-full p-1 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-800 z-10"
                title={isCollapsed ? "Expand" : "Collapse"}
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            <nav className="flex-1 px-3 py-6 space-y-1 overflow-x-hidden">
                {!isCollapsed && <p className="px-2 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 whitespace-nowrap">{t('platform')}</p>}

                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all group whitespace-nowrap ${isActive
                                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                                } ${isCollapsed ? "justify-center" : "space-x-3"}`}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-gray-900 dark:text-white" : "text-gray-500 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-100"}`} />
                            {!isCollapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}

                <div className={`pt-6 border-t border-gray-100 dark:border-gray-800 mt-6 ${isCollapsed ? "border-transparent" : ""}`}>
                    {!isCollapsed && <p className="px-2 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 whitespace-nowrap">{t('management')}</p>}

                    <Link
                        href={`/${locale}/admin/pharmacies`}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all group whitespace-nowrap ${pathname.includes('/pharmacies')
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                            } ${isCollapsed ? "justify-center" : "space-x-3"}`}
                        title={isCollapsed ? t('pharmacies') : undefined}
                    >
                        <Building2 className="w-4 h-4 flex-shrink-0 text-gray-500 group-hover:text-gray-900" />
                        {!isCollapsed && <span>{t('pharmacies')}</span>}
                    </Link>

                    {userRole === Role.ADMIN && (
                        <Link
                            href={`/${locale}/admin/schedule`}
                            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all group whitespace-nowrap ${pathname.includes('/schedule')
                                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                                } ${isCollapsed ? "justify-center" : "space-x-3"}`}
                            title={isCollapsed ? t('schedule') : undefined}
                        >
                            <Clock className="w-4 h-4 flex-shrink-0 text-gray-500 group-hover:text-gray-900" />
                            {!isCollapsed && <span>{t('schedule')}</span>}
                        </Link>
                    )}
                </div>
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className={`flex items-center mb-2 ${isCollapsed ? "justify-center" : "space-x-3 px-2"}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    {!isCollapsed && (
                        <div className="flex items-center min-w-0">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate block max-w-[120px]">
                                {email?.split('@')[0] || 'User'}
                            </span>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => signOut({ callbackUrl: '/auth/login' })}
                    className={`flex items-center text-red-500 hover:bg-red-50 dark:hover:bg-gray-800 rounded-lg transition-colors ${isCollapsed ? "justify-center w-full p-2" : "w-full space-x-3 px-4 py-2"
                        }`}
                    title={isCollapsed ? t('logout') : undefined}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span>{t('logout')}</span>}
                </button>
            </div>
        </aside>
    );
}
