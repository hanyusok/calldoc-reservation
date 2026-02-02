import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import localFont from 'next/font/local';
import AdminSidebar from "@/components/admin/AdminSidebar";

const nanum = localFont({
    src: [
        {
            path: '../../fonts/NanumBarunGothicLight.otf',
            weight: '300',
            style: 'normal',
        },
        {
            path: '../../fonts/NanumBarunGothic.otf',
            weight: '400',
            style: 'normal',
        },
        {
            path: '../../fonts/NanumBarunGothicBold.otf',
            weight: '700',
            style: 'normal',
        },
        {
            path: '../../fonts/NanumBarunGothicUltraLight.otf',
            weight: '200',
            style: 'normal',
        },
    ],
    variable: '--font-nanum',
    display: 'swap',
});

export default async function AdminLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const session = await getServerSession(authOptions);

    // Check for admin or staff role
    const userRole = (session?.user as any)?.role;
    if (!session?.user || ![Role.ADMIN, Role.STAFF].includes(userRole)) {
        redirect(`/${locale}/auth/login`);
    }

    return (
        <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${nanum.className}`}>
            <AdminSidebar
                userRole={userRole}
                locale={locale}
                email={session?.user?.email || ''}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-black">
                {/* Header for mobile or breadcrumbs could go here */}
                <div className="max-w-[1600px] mx-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
