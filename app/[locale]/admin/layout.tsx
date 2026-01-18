import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Calendar, CreditCard, LogOut } from "lucide-react";

export default async function AdminLayout({
    children,
    params: { locale }
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const session = await getServerSession(authOptions);

    // @ts-ignore
    if (!session?.user || session.user.role !== Role.ADMIN) {
        redirect(`/${locale}/auth/login`); // Or a specific 403 page
    }

    const navItems = [
        { href: `/${locale}/admin`, label: "Dashboard", icon: LayoutDashboard },
        { href: `/${locale}/admin/patients`, label: "Patients", icon: Users },
        { href: `/${locale}/admin/appointments`, label: "Appointments", icon: Calendar },
        { href: `/${locale}/admin/prepaid`, label: "Prepaid / Credits", icon: CreditCard },
    ];

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex flex-col">
                <div className="p-6 border-b dark:border-gray-700">
                    <h1 className="text-2xl font-bold text-blue-600">CallDoc Admin</h1>
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
                    <div className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-500">
                        <span>{session.user.email}</span>
                    </div>
                    <Link href={`/api/auth/signout`} className="flex items-center space-x-3 px-4 py-2 mt-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
