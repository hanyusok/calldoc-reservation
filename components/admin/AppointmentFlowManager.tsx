'use client';

import { useState, useEffect } from "react";
import { setAppointmentPayment, sendMeetingLink } from "@/app/actions/admin";
import { DollarSign, Video, FileText, Check } from "lucide-react";
import SimpleModal from "./SimpleModal";
import { useRouter } from "next/navigation";
import { AppointmentStatus, PaymentStatus } from "@prisma/client";
import { useTranslations } from "next-intl";

type Appointment = {
    id: string;
    status: AppointmentStatus;
    symptoms: string | null;
    meetingLink: string | null;
    payment: {
        amount: number;
        status: PaymentStatus;
    } | null;
};

export default function AppointmentFlowManager({ appointment }: { appointment: Appointment }) {
    const t = useTranslations('Admin.flowManager');
    const [viewSymptoms, setViewSymptoms] = useState(false);
    const [isPriceOpen, setIsPriceOpen] = useState(false);
    const [isLinkOpen, setIsLinkOpen] = useState(false);

    const [price, setPrice] = useState(15000);
    const [link, setLink] = useState(appointment.meetingLink || "");

    useEffect(() => {
        if (!appointment.meetingLink) {
            const savedDefault = localStorage.getItem('calldoc_default_meet_link');
            setLink(savedDefault || "https://meet.google.com/new");
        }
    }, [appointment.meetingLink]);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleSetPrice = async () => {
        setLoading(true);
        await setAppointmentPayment(appointment.id, price);
        setLoading(false);
        setIsPriceOpen(false);
        router.refresh();
    };

    const handleSendLink = async () => {
        setLoading(true);
        await sendMeetingLink(appointment.id, link);
        setLoading(false);
        setIsLinkOpen(false);
        router.refresh();
    };

    return (
        <div className="flex gap-2 justify-end">
            {/* 1. View Symptoms - Always available if exists */}
            {appointment.symptoms && (
                <>
                    <button
                        onClick={() => setViewSymptoms(true)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded tooltip"
                        title={t('viewSymptoms')}
                    >
                        <FileText className="w-5 h-5" />
                    </button>
                    <SimpleModal isOpen={viewSymptoms} onClose={() => setViewSymptoms(false)} title={t('viewSymptomsTitle')}>
                        <div className="p-4 bg-gray-50 rounded mb-4 whitespace-pre-wrap">
                            {appointment.symptoms}
                        </div>
                        <button onClick={() => setViewSymptoms(false)} className="w-full bg-gray-200 py-2 rounded">{t('close')}</button>
                    </SimpleModal>
                </>
            )}

            {/* 2. Set Price - If Payment Pending and Amount is 0 (or want to update) */}
            {appointment.payment?.status === 'PENDING' && (
                <>
                    <button
                        onClick={() => setIsPriceOpen(true)}
                        className={`p-2 rounded ${appointment.payment?.amount > 0 ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50 animate-pulse'}`}
                        title={t('setPriceTitle')}
                    >
                        <DollarSign className="w-5 h-5" />
                    </button>
                    <SimpleModal isOpen={isPriceOpen} onClose={() => setIsPriceOpen(false)} title={t('setPriceTitle')}>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">{t('setPriceDesc')}</p>
                            <div>
                                <label className="block text-sm font-medium">{t('amountLabel')}</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={e => setPrice(Number(e.target.value))}
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                            <button
                                onClick={handleSetPrice}
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-2 rounded"
                            >
                                {loading ? t('saveButton') : t('setPriceButton')}
                            </button>
                        </div>
                    </SimpleModal>
                </>
            )}

            {/* 3. Send Link - If Confirmed (Paid) */}
            {appointment.status === 'CONFIRMED' && (
                <>
                    <button
                        onClick={() => setIsLinkOpen(true)}
                        className={`p-2 rounded ${appointment.meetingLink ? 'text-blue-600 bg-blue-50' : 'text-gray-600 bg-gray-100'}`}
                        title={t('sendLinkTitle')}
                    >
                        <Video className="w-5 h-5" />
                    </button>
                    <SimpleModal isOpen={isLinkOpen} onClose={() => setIsLinkOpen(false)} title={t('sendLinkTitle')}>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">{t('sendLinkDesc')}</p>
                            <div>
                                <label className="block text-sm font-medium">{t('meetingUrlLabel')}</label>
                                <input
                                    type="text"
                                    value={link}
                                    onChange={e => setLink(e.target.value)}
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                            <button
                                onClick={handleSendLink}
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-2 rounded"
                            >
                                {loading ? t('sendingButton') : t('sendLinkButton')}
                            </button>
                        </div>
                    </SimpleModal>
                </>
            )}
        </div>
    );
}
