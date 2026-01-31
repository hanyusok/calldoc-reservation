"use client";

import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import AppointmentStepper from "./AppointmentStepper";
import PayButton from "./PayButton";
import PharmacySelector from "./PharmacySelector";

export default function AppointmentCard({ appointment, isPast = false }: { appointment: any, isPast?: boolean }) {
    const t = useTranslations('Dashboard');
    const locale = useLocale();
    const dateLocale = locale === 'ko' ? ko : enUS;
    const dateFormatStr = locale === 'ko' ? 'yyyy년 M월 d일' : 'MMMM d, yyyy';

    const borderColor = isPast ? 'border-gray-300' : 'border-blue-500';
    const statusColor = appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    // For rejected/fail
    const finalStatusColor = (appointment.status === 'CANCELLED' || appointment.status === 'REJECTED')
        ? 'bg-red-100 text-red-800'
        : (appointment.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' : statusColor);

    return (
        <div className={`bg-white shadow rounded-lg p-5 border-l-4 ${borderColor} space-y-4`}>
            {/* Header: Date/Time and Status */}
            <div className="flex justify-between items-start">
                <div>
                    {/* Suppress hydration warning because simplified implementation relies on browser timezone */}
                    <h3 className={`font-bold flex items-center text-lg ${isPast ? 'text-gray-500' : 'text-gray-900'}`} suppressHydrationWarning>
                        {format(new Date(appointment.startDateTime), dateFormatStr, { locale: dateLocale })}
                    </h3>
                    <div className="text-gray-600 flex items-center mt-1" suppressHydrationWarning>
                        <Clock className="h-4 w-4 mr-1" />
                        {format(new Date(appointment.startDateTime), 'HH:mm')} - {format(new Date(appointment.endDateTime), 'HH:mm')}
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                        {t('appointments.patient')}: <strong>{appointment.patient.name}</strong>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className={`text-sm font-bold px-2 py-1 rounded inline-block ${finalStatusColor}`}>
                        {/* @ts-ignore */}
                        {t(`status.${appointment.status}`) || appointment.status}
                    </div>
                </div>
            </div>

            {/* Stepper Component */}
            <AppointmentStepper
                status={appointment.status}
                paymentStatus={appointment.payment?.status}
                paymentAmount={appointment.payment?.amount}
            />

            {/* Details & Actions */}
            <div className="flex justify-between items-end border-t pt-4">
                <div className="flex-1">
                    {/* @ts-ignore */}
                    {appointment.symptoms && (
                        <div className="text-sm text-gray-600 mb-2">
                            <span className="font-semibold">{t('appointments.symptomsLabel')}:</span> {appointment.symptoms}
                        </div>
                    )}
                    {appointment.meetingLink && !isPast && !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(appointment.status) && (
                        <a
                            href={appointment.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 mt-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            {t('appointments.joinCall')}
                            <ChevronRight className="ml-1 w-4 h-4" />
                        </a>
                    )}
                </div>

                <div className="text-right">
                    <div className={`text-xs mb-2 ${appointment.payment?.status === 'COMPLETED' ? 'text-green-600' : 'text-red-500'}`}>
                        {appointment.payment?.status === 'PENDING'
                            ? (appointment.payment.amount > 0 ? t('appointments.payment.required') : t('appointments.payment.waiting'))
                            : (appointment.payment?.status === 'CANCELED' || appointment.payment?.status === 'FAILED' ? t('status.CANCELED') : t('appointments.payment.paid'))}
                    </div>
                    {!isPast && appointment.status === 'PENDING' && appointment.payment?.status === 'PENDING' && appointment.payment.amount > 0 && (
                        <PayButton
                            appointmentId={appointment.id}
                            paymentId={appointment.payment.id}
                            amount={appointment.payment.amount}
                            customerName={appointment.patient.name}
                        />
                    )}
                </div>
            </div>

            {/* Prescription Transfer Section */}
            {appointment.status === 'COMPLETED' && (
                <div className="border-t pt-4">
                    {appointment.prescription ? (
                        <div className="bg-gray-50 p-4 rounded-lg flex items-start justify-between">
                            <div className="text-sm space-y-1">
                                <div className="font-semibold text-gray-700 mb-2">{t('pharmacy.title')}</div>
                                <div className="font-bold text-gray-900 text-base">{appointment.prescription.pharmacyName}</div>
                                {appointment.prescription.pharmacyAddress && (
                                    <div className="text-gray-600">{appointment.prescription.pharmacyAddress}</div>
                                )}
                                <div className="flex flex-col gap-1 text-xs text-gray-500">
                                    {appointment.prescription.pharmacyPhone && (
                                        <span>Tel: {appointment.prescription.pharmacyPhone}</span>
                                    )}
                                    {appointment.prescription.pharmacyFax && (
                                        <span>Fax: {appointment.prescription.pharmacyFax}</span>
                                    )}
                                </div>
                            </div>
                            <div className={`px-2 py-1 text-xs font-bold rounded ${appointment.prescription.status === 'ISSUED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                {/* @ts-ignore */}
                                {t(`prescriptionStatus.${appointment.prescription.status}`)}
                            </div>
                        </div>
                    ) : (
                        <PharmacySelector appointmentId={appointment.id} onSuccess={() => window.location.reload()} />
                    )}
                </div>
            )}
        </div>
    );
}
