"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, History } from "lucide-react";
import AppointmentCard from "./AppointmentCard";
import { useTranslations } from "next-intl";

export default function PastAppointments({ appointments }: { appointments: any[] }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const t = useTranslations('Dashboard');

    if (appointments.length === 0) return null;

    return (
        <div className="mt-8">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors w-full py-2 border-b border-gray-200 mb-4"
            >
                <History className="w-5 h-5 mr-2" />
                <span className="font-medium text-sm">
                    {/* Hardcoded fallback or need translation key */}
                    {isExpanded ? 'Hide Past History' : `Show Past History (${appointments.length})`}
                </span>
                <div className="ml-auto">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </button>

            {isExpanded && (
                <div className="space-y-4 opacity-75">
                    {appointments.map(appt => (
                        <AppointmentCard key={appt.id} appointment={appt} isPast={true} />
                    ))}
                </div>
            )}
        </div>
    );
}
