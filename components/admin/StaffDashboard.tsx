import Link from "next/link";
import { Users, Calendar } from "lucide-react";
import { useTranslations } from "next-intl";

export default function StaffDashboard() {
    const t = useTranslations('StaffDashboard');

    const cards = [
        {
            label: t('patientscard.title'),
            description: t('patientscard.description'),
            href: "/admin/patients",
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-100",
            hover: "hover:bg-blue-50 border-blue-200"
        },
        {
            label: t('appointmentscard.title'),
            description: t('appointmentscard.description'),
            href: "/admin/appointments",
            icon: Calendar,
            color: "text-purple-600",
            bg: "bg-purple-100",
            hover: "hover:bg-purple-50 border-purple-200"
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('title')}</h1>
                <p className="text-gray-600 dark:text-gray-400">{t('welcome')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cards.map((card, index) => (
                    <Link
                        key={index}
                        href={card.href}
                        className={`block p-6 rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md ${card.hover} bg-white dark:bg-gray-800 dark:border-gray-700`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-3">
                                <div className={`p-3 rounded-lg inline-flex ${card.bg}`}>
                                    <card.icon className={`w-6 h-6 ${card.color}`} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{card.label}</h3>
                                    <p className="mt-1 text-gray-500 dark:text-gray-400">{card.description}</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="bg-blue-50 dark:bg-gray-800 p-6 rounded-xl border border-blue-100 dark:border-gray-700">
                <p className="text-blue-800 dark:text-blue-200 font-medium">{t('instruction')}</p>
            </div>
        </div>
    );
}
