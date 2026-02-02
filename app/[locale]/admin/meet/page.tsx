import MeetSettingsCard from "@/components/admin/MeetSettingsCard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async function MeetSettingsPage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const session = await getServerSession(authOptions);

    // Only Admin can access settings
    if (!session?.user || (session.user as any).role !== Role.ADMIN) {
        redirect(`/${locale}/admin`);
    }

    const t = await getTranslations('Admin.meetSettings');

    return (
        <div className="space-y-6 max-w-4xl">
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-gray-500">
                {t('defaultLinkHelp')}
            </p>

            <MeetSettingsCard />
        </div>
    );
}
