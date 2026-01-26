'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, MapPin, Phone, Printer } from 'lucide-react';
import { requestPrescription } from '@/app/actions/prescription';

interface PharmacySelectorProps {
    appointmentId: string;
    onSuccess: () => void;
}

export default function PharmacySelector({ appointmentId, onSuccess }: PharmacySelectorProps) {
    const t = useTranslations('Dashboard.pharmacy');
    const [name, setName] = useState('');
    const [fax, setFax] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await requestPrescription(appointmentId, {
            name,
            fax,
            phone,
            address
        });

        setLoading(false);

        if (result.success) {
            alert(t('success'));
            onSuccess();
        } else {
            alert(t('error'));
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                {t('title')}
            </h3>

            <p className="text-sm text-gray-500 mb-6">
                {t('description')}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('nameLabel')}</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('namePlaceholder')}
                            className="pl-10 w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('faxLabel')}</label>
                        <div className="relative">
                            <Printer className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={fax}
                                onChange={(e) => setFax(e.target.value)}
                                placeholder={t('faxPlaceholder')}
                                className="pl-10 w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('phoneLabel')}</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder={t('phonePlaceholder')}
                                className="pl-10 w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('addressLabel')}</label>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder={t('addressPlaceholder')}
                        className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {loading ? t('processing') : t('submitForTransfer')}
                </button>
            </form>
        </div>
    );
}
