"use client";

import { Home, Calendar, PlusCircle, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/lib/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function BottomNavbar() {
    const t = useTranslations('Navigation');
    const pathname = usePathname();

    const navItems = [
        {
            label: t('home'),
            icon: Home,
            href: '/',
        },
        {
            label: t('appointments'),
            icon: Calendar,
            href: '/dashboard',
        },
        {
            label: t('book'),
            icon: PlusCircle,
            href: '/book',
            isFab: true,
        },
        {
            label: t('profile'),
            icon: User,
            href: '/dashboard/profile',
        },
    ];

    return (
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-bottom z-50">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    if (item.isFab) {
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="relative -top-5 bg-rose-500 p-3 rounded-full shadow-lg shadow-rose-200 text-white transform transition-transform active:scale-95"
                            >
                                <Icon className="w-7 h-7" />
                                <span className="sr-only">{item.label}</span>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                                isActive ? "text-rose-500" : "text-gray-400"
                            )}
                        >
                            <Icon className={cn("w-6 h-6", isActive ? "stroke-[2.5px]" : "stroke-2")} />
                            <span className="text-[10px] font-bold">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
