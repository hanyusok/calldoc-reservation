"use client";

import { useTranslations } from 'next-intl';
import { MapPin, Phone, Printer, Building2 } from 'lucide-react';

interface PharmacyContentCardProps {
    name: string;
    fax?: string;
    phone?: string;
    address?: string;
}

export default function PharmacyContentCard({ name, fax, phone, address }: PharmacyContentCardProps) {
    const t = useTranslations('Dashboard.pharmacy');

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg mt-6">
            <h3 className="text-xl font-bold mb-6 flex items-center text-gray-900">
                <Building2 className="w-6 h-6 mr-3 text-blue-600" />
                {t('title')}
            </h3>

            <div className="space-y-6">
                <div className="flex items-start">
                    <Building2 className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">{t('nameLabel')}</p>
                        <p className="font-medium text-lg text-gray-900">{name}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start">
                        <Phone className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">{t('phoneLabel')}</p>
                            <p className="font-medium text-gray-900">{phone || '-'}</p>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <Printer className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">{t('faxLabel')}</p>
                            <p className="font-medium text-gray-900">{fax || '-'}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">{t('addressLabel')}</p>
                        <p className="font-medium text-gray-900">{address || '-'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
