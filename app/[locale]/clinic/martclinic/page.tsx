import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
    Stethoscope,
    Syringe,
    Baby,
    Activity,
    ThermometerSun,
    Microscope,
    MapPin,
    Clock,
    Phone,
    CalendarCheck,
    Accessibility
} from 'lucide-react';
import Image from 'next/image';

export default function MartClinicPage() {
    const t = useTranslations('MartClinic');

    const services = [
        { icon: Baby, label: t('services.pediatrics'), color: "text-blue-500", bg: "bg-blue-50" },
        { icon: Stethoscope, label: t('services.internal'), color: "text-green-500", bg: "bg-green-50" },
        { icon: ThermometerSun, label: t('services.ent'), color: "text-orange-500", bg: "bg-orange-50" },
        { icon: Activity, label: t('services.dermatology'), color: "text-pink-500", bg: "bg-pink-50" },
        { icon: Accessibility, label: t('services.orthopedics'), color: "text-purple-500", bg: "bg-purple-50" },
        { icon: Activity, label: t('services.obesity'), color: "text-indigo-500", bg: "bg-indigo-50" },
        { icon: Syringe, label: t('services.ivTherapy'), color: "text-teal-500", bg: "bg-teal-50" },
        { icon: Microscope, label: t('services.diagnostics'), color: "text-cyan-500", bg: "bg-cyan-50" },
        { icon: Syringe, label: t('services.vaccinations'), color: "text-rose-500", bg: "bg-rose-50" },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 lg:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 mb-8">
                        <CalendarCheck className="mr-2 h-4 w-4" />
                        {t('hero.badge')}
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
                        {t('hero.title')}
                    </h1>
                    <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                        {t('hero.subtitle')}
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            {t('hero.cta')}
                        </Link>
                    </div>
                </div>

                {/* Decorative background blobs */}
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </section>

            {/* Services Grid */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">{t('services.title')}</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            {t('services.subtitle')}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
                        {services.map((service, index) => {
                            const Icon = service.icon;
                            return (
                                <div key={index} className="group relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-100 flex flex-col items-center text-center">
                                    <div className={`p-4 rounded-2xl ${service.bg} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className={`w-8 h-8 ${service.color}`} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">{service.label}</h3>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
                                {t('about.title')}
                            </h2>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                {t('about.description')}
                            </p>
                            <div className="flex items-center text-gray-500 font-medium bg-white px-6 py-4 rounded-xl shadow-sm inline-block">
                                <CalendarCheck className="w-5 h-5 mr-2 text-blue-500" />
                                {t('about.established')}
                            </div>
                        </div>
                        <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500 group">
                            <Image
                                src="/images/mart_clinic_entrance.jpg"
                                alt={t('about.imageAlt')}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            <div className="absolute bottom-6 left-6 text-white">
                                <p className="font-semibold text-lg drop-shadow-md">{t('about.imageAlt')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Info Section (Hours & Location) */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Location Card */}
                        <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl relative overflow-hidden">
                            <div className="relative z-10">
                                <MapPin className="w-10 h-10 text-blue-400 mb-6" />
                                <h3 className="text-2xl font-bold mb-4">{t('info.locationTitle')}</h3>
                                <p className="text-lg text-slate-300 mb-2">{t('info.address')}</p>
                                <div className="mt-8 pt-8 border-t border-slate-700">
                                    <div className="flex items-center text-blue-400 font-semibold text-lg">
                                        <Phone className="w-5 h-5 mr-3" />
                                        031-657-8279
                                    </div>
                                </div>
                            </div>
                            {/* Decorative circle */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-slate-800 rounded-full opacity-50"></div>
                        </div>

                        {/* Hours Card */}
                        <div className="bg-blue-50 p-8 sm:p-12 rounded-3xl text-slate-900 border border-blue-100">
                            <Clock className="w-10 h-10 text-blue-600 mb-6" />
                            <h3 className="text-2xl font-bold mb-6">{t('info.hoursTitle')}</h3>
                            <ul className="space-y-4">
                                <li className="flex justify-between items-center border-b border-blue-200 pb-2">
                                    <span className="font-semibold">{t('info.row1Label')}</span>
                                    <span className="text-slate-600 font-medium">{t('info.row1Time')}</span>
                                </li>
                                <li className="flex justify-between items-center border-b border-blue-200 pb-2">
                                    <span className="font-semibold text-slate-500">{t('info.row2Label')}</span>
                                    <span className="text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md">{t('info.row2Time')}</span>
                                </li>
                                <li className="flex justify-between items-center border-b border-blue-200 pb-2">
                                    <span className="font-semibold">{t('info.row3Label')}</span>
                                    <span className="text-slate-600 font-medium">{t('info.row3Time')}</span>
                                </li>
                            </ul>
                            <div className="mt-6 text-sm text-slate-500 bg-white p-4 rounded-xl inline-block shadow-sm">
                                <span className="font-semibold mr-2">{t('info.lunchLabel')}:</span>
                                {t('info.lunchTime')}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-20 bg-blue-600 text-white text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold mb-8">{t('footer.title')}</h2>
                    <Link
                        href="/dashboard"
                        className="inline-block bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:bg-gray-100 transition-colors"
                    >
                        {t('hero.cta')}
                    </Link>
                </div>
            </section>
        </div>
    );
}
