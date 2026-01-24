'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Video, Save, CheckCircle2, Mic, Camera, Users, ExternalLink } from 'lucide-react';

export default function MeetSettingsCard() {
    const t = useTranslations('Admin.meetSettings');
    const [defaultLink, setDefaultLink] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const savedLink = localStorage.getItem('calldoc_default_meet_link');
        if (savedLink) setDefaultLink(savedLink);
    }, []);

    const handleSave = () => {
        localStorage.setItem('calldoc_default_meet_link', defaultLink);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const checklistItems = [
        { icon: Mic, label: t('checkMic') },
        { icon: Camera, label: t('checkCamera') },
        { icon: Users, label: t('checkAdmission') },
    ];

    return (
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full">
            <h2 className="text-lg font-semibold flex items-center mb-6 text-gray-900">
                <Video className="w-5 h-5 mr-2 text-blue-600" />
                {t('title')}
            </h2>

            <div className="space-y-6">
                {/* 1. Default Link Setting */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('defaultLinkLabel')}
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={defaultLink}
                            onChange={(e) => setDefaultLink(e.target.value)}
                            placeholder="https://meet.google.com/..."
                            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                            onClick={handleSave}
                            className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors flex items-center ${isSaved ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                            <span className="ml-2">{isSaved ? t('saved') : t('save')}</span>
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        {t('defaultLinkHelp')}
                    </p>
                </div>

                <hr className="border-gray-100" />

                {/* 2. Checklist */}
                <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">{t('checklistTitle')}</h3>
                    <div className="space-y-3">
                        {checklistItems.map((item, idx) => (
                            <div key={idx} className="flex items-center p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors cursor-pointer">
                                <item.icon className="w-4 h-4 text-gray-500 mr-3 group-hover:text-blue-600" />
                                <span className="text-sm text-gray-600 flex-1">{item.label}</span>
                                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-2">
                    <a
                        href="https://meet.google.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center justify-end"
                    >
                        {t('openGoogleMeet')}
                        <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                </div>
            </div>
        </section>
    );
}
