'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays, startOfToday } from 'date-fns';
import { Users, Calendar as CalendarIcon, Clock, CheckCircle, CreditCard } from 'lucide-react';
import { getAvailableSlots, createAppointment, getDoctorProfile } from '@/app/actions/appointment';
import { getPatients } from '@/app/actions/patient';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

// Types
type Step = 'PATIENT' | 'DATE' | 'CONFIRM' | 'SUCCESS';

export default function BookingPage() {
    const t = useTranslations('Booking');
    const router = useRouter();
    const [step, setStep] = useState<Step>('PATIENT');
    const [patients, setPatients] = useState<any[]>([]);
    const [doctor, setDoctor] = useState<any>(null);

    // Selection State
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
    const [selectedTime, setSelectedTime] = useState('');
    const [slots, setSlots] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [successInfo, setSuccessInfo] = useState<any>(null);

    // Fetch initial data
    useEffect(() => {
        async function init() {
            const [pData, dData] = await Promise.all([getPatients(), getDoctorProfile()]);
            setPatients(pData);
            setDoctor(dData);
        }
        init();
    }, []);

    // Fetch slots when date changes
    useEffect(() => {
        async function fetchSlots() {
            setLoading(true);
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const s = await getAvailableSlots(dateStr);
            setSlots(s);
            setLoading(false);
        }
        fetchSlots();
    }, [selectedDate]);

    const handleCreateAppointment = async () => {
        setLoading(true);
        const result = await createAppointment({
            patientId: selectedPatientId,
            dateString: format(selectedDate, 'yyyy-MM-dd'),
            timeString: selectedTime
        });

        setLoading(false);

        if (result.success) {
            setSuccessInfo(result);
            setStep('SUCCESS');
        } else {
            alert(t('alerts.fail'));
        }
    };

    // --- Step Components ---

    const PatientSelection = () => (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">{t('steps.patient.title')}</h2>
            <div className="grid gap-3">
                {patients.map(p => (
                    <button
                        key={p.id}
                        onClick={() => { setSelectedPatientId(p.id); setStep('DATE'); }}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center
                        ${selectedPatientId === p.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}
                    `}
                    >
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <div className="font-medium text-lg">{p.name}</div>
                            <div className="text-sm text-gray-500 text-sm">{p.relationship}</div>
                        </div>
                    </button>
                ))}
                {patients.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        {t('steps.patient.noProfile')}
                        <br />
                        <Link href="/dashboard/profile" className="text-blue-600 underline text-sm mt-2 inline-block">{t('steps.patient.manageProfiles')}</Link>
                    </div>
                )}
                <Link href="/dashboard/profile" className="text-center text-blue-600 text-sm mt-2 block">{t('steps.patient.addFamily')}</Link>
            </div>
        </div>
    );

    const DateSelection = () => (
        <div className="space-y-6">
            <button onClick={() => setStep('PATIENT')} className="text-sm text-gray-500 mb-2">&larr; {t('steps.date.back')}</button>

            {/* Simple Date Strip (Just next 5 days for simplicity) */}
            <div>
                <h3 className="text-lg font-medium mb-3">{t('steps.date.selectDate')}</h3>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                    {[0, 1, 2, 3, 4].map(days => {
                        const d = addDays(startOfToday(), days);
                        const isSelected = format(d, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                        return (
                            <button
                                key={days}
                                onClick={() => { setSelectedDate(d); setSelectedTime(''); }}
                                className={`flex-shrink-0 w-16 h-20 flex flex-col items-center justify-center rounded-xl border transition-colors
                                ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-600'}
                            `}
                            >
                                <span className="text-xs uppercase font-bold">{format(d, 'EEE')}</span>
                                <span className="text-xl font-bold">{format(d, 'd')}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Time Slots */}
            <div>
                <h3 className="text-lg font-medium mb-3">{t('steps.date.availableTime')}</h3>
                {loading ? (
                    <div className="text-gray-400 text-center py-4">{t('steps.date.loadingSlots')}</div>
                ) : (
                    <div className="grid grid-cols-3 gap-3">
                        {slots.map(t => (
                            <button
                                key={t}
                                onClick={() => setSelectedTime(t)}
                                className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all
                                ${selectedTime === t ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'}
                            `}
                            >
                                {t}
                            </button>
                        ))}
                        {slots.length === 0 && <div className="col-span-3 text-center text-gray-500 text-sm">{t('steps.date.noSlots')}</div>}
                    </div>
                )}
            </div>

            <div className="pt-4">
                <button
                    disabled={!selectedTime}
                    onClick={() => setStep('CONFIRM')}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                    {t('steps.date.continue')}
                </button>
            </div>
        </div>
    );

    const ConfirmStep = () => {
        const p = patients.find(patient => patient.id === selectedPatientId);
        return (
            <div className="space-y-6">
                <button onClick={() => setStep('DATE')} className="text-sm text-gray-500 mb-2">&larr; {t('steps.date.back')}</button>

                <h2 className="text-xl font-bold">{t('steps.confirm.title')}</h2>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                    <div className="p-4 flex items-center">
                        <Users className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                            <div className="text-sm text-gray-500">{t('steps.confirm.patient')}</div>
                            <div className="font-medium">{p?.name}</div>
                        </div>
                    </div>
                    <div className="p-4 flex items-center">
                        <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                            <div className="text-sm text-gray-500">{t('steps.confirm.dateTime')}</div>
                            <div className="font-medium">{format(selectedDate, 'MMM d, yyyy')} at {selectedTime}</div>
                        </div>
                    </div>
                    <div className="p-4 flex items-center">
                        <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                            <div className="text-sm text-gray-500">{t('steps.confirm.fee')}</div>
                            <div className="font-medium text-blue-600">₩15,000</div>
                        </div>
                    </div>
                </div>

                {doctor?.bankAccount && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                        <strong>{t('steps.confirm.payment')}</strong><br />
                        {t('steps.confirm.transferTo')} <br />
                        {doctor.bankName} {doctor.bankAccount} ({doctor.bankHolder})
                        <br /><span className="text-xs text-yellow-600 mt-1 inline-block">{t('steps.confirm.manualVerify')}</span>
                    </div>
                )}

                <button
                    onClick={handleCreateAppointment}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 shadow-lg"
                >
                    {loading ? t('steps.confirm.processing') : t('steps.confirm.confirmBtn')}
                </button>
            </div>
        );
    };

    const SuccessStep = () => (
        <div className="text-center py-12 space-y-6">
            <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-full text-green-600 mb-4">
                <CheckCircle className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{t('steps.success.title')}</h2>
            <p className="text-gray-500">
                {t.rich('steps.success.message', {
                    br: () => <br />
                })}
            </p>
            <div className="pt-8 space-y-3">
                <button onClick={() => router.push('/dashboard')} className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium">{t('steps.success.dashboardBtn')}</button>
                <button onClick={() => { setStep('PATIENT'); setSuccessInfo(null); }} className="w-full bg-white text-blue-600 py-3 rounded-lg font-medium">{t('steps.success.bookAnotherBtn')}</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-safe">
            <header className="bg-white shadow-sm sticky top-0 z-10 px-4 py-4 flex justify-between items-center">
                <button onClick={() => router.back()} className="text-gray-500">{t('cancel')}</button>
                <h1 className="font-bold text-lg">{t('title')}</h1>
                <div className="w-10"></div>{/* Spacer */}
            </header>

            <main className="max-w-md mx-auto px-4 py-6">
                {step === 'PATIENT' && <PatientSelection />}
                {step === 'DATE' && <DateSelection />}
                {step === 'CONFIRM' && <ConfirmStep />}
                {step === 'SUCCESS' && <SuccessStep />}
            </main>
        </div>
    );
}
