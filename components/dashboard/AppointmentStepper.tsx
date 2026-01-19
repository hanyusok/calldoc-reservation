'use client';

import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';

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
        currentStep = 3;
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
        { key: 'request', label: t('request') },
        { key: 'payment', label: t('payment') },
        { key: 'confirmed', label: t('confirmed') },
        { key: 'completed', label: t('completed') },
    ];

    return (
        <div className="w-full py-4">
            <div className="relative flex items-center justify-between w-full">
                {/* Connecting Line */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10" />
                <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 -z-10 transition-all duration-500"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;
                    const isUpcoming = index > currentStep;

                    return (
                        <div key={step.key} className="flex flex-col items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 bg-white
                                    ${isCompleted || isCurrent ? 'border-blue-600' : 'border-gray-300'}
                                    ${isCompleted ? 'bg-blue-600' : ''}
                                `}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5 text-white" />
                                ) : (
                                    <div className={`w-3 h-3 rounded-full ${isCurrent ? 'bg-blue-600' : 'bg-gray-300'}`} />
                                )}
                            </div>
                            <span
                                className={`mt-2 text-xs font-medium transition-colors duration-300
                                    ${isCurrent ? 'text-blue-600' : 'text-gray-500'}
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
