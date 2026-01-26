'use client';

import { useTranslations } from 'next-intl';
import { Check, ClipboardPlus, CircleDollarSign, Goal, Stethoscope } from 'lucide-react';

interface AppointmentStepperProps {
    status: string;
    paymentStatus?: string;
    paymentAmount?: number;
}

export default function AppointmentStepper({ status, paymentStatus, paymentAmount = 0 }: AppointmentStepperProps) {
    const t = useTranslations('Dashboard.stepper');

    // Determine current step (0-indexed)
    let currentStep = 0;

    if (status === 'COMPLETED') {
        currentStep = 4; // Past the last step to mark it as completed (filled)
    } else if (status === 'CONFIRMED') {
        currentStep = 2;
    } else if (status === 'PENDING') {
        if (paymentStatus === 'PENDING' && paymentAmount > 0) {
            currentStep = 1; // Payment required/waiting
        } else {
            currentStep = 0; // Just requested, no fee set yet
        }
    }

    const steps = [
        { key: 'request', label: t('request'), icon: ClipboardPlus },
        { key: 'payment', label: t('payment'), icon: CircleDollarSign },
        { key: 'confirmed', label: t('confirmed'), icon: Goal },
        { key: 'completed', label: t('completed'), icon: Stethoscope },
    ];

    return (
        <div className="w-full py-4">
            <div className="relative flex items-center justify-between w-full">
                {/* Connecting Line */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10" />
                <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 -z-10 transition-all duration-500"
                    style={{ width: `${Math.min((currentStep / (steps.length - 1)) * 100, 100)}%` }}
                />

                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;
                    const Icon = step.icon;

                    return (
                        <div key={step.key} className="flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10
                                    ${isCompleted ? 'bg-blue-600 border-blue-600 text-white' : ''}
                                    ${isCurrent ? 'bg-white border-blue-600 text-blue-600 ring-2 ring-blue-100' : ''}
                                    ${!isCompleted && !isCurrent ? 'bg-white border-gray-300 text-gray-400' : ''}
                                `}
                            >
                                <Icon className="w-5 h-5" />
                            </div>
                            <span
                                className={`mt-2 text-xs font-medium transition-colors duration-300
                                    ${isCurrent ? 'text-blue-600 font-bold' : 'text-gray-500'}
                                `}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
