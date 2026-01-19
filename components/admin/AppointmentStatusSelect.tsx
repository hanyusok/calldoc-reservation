'use client';

import { AppointmentStatus } from "@prisma/client";
import { updateAppointmentStatus } from "@/app/actions/admin";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function AppointmentStatusSelect({
    id,
    currentStatus
}: {
    id: string,
    currentStatus: AppointmentStatus
}) {
    const t = useTranslations('Admin');
    const [loading, setLoading] = useState(false);

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as AppointmentStatus;
        // @ts-ignore
        const statusLabel = t(`statusEnum.${newStatus}`);

        if (!confirm(t('appointmentForm.changeStatusConfirm', { status: statusLabel }))) return;

        setLoading(true);
        const result = await updateAppointmentStatus(id, newStatus);
        setLoading(false);

        if (!result.success) {
            alert(t('appointmentForm.error'));
        }
    };

    const colors = {
        PENDING: "bg-yellow-100 text-yellow-800",
        CONFIRMED: "bg-blue-100 text-blue-800",
        COMPLETED: "bg-green-100 text-green-800",
        CANCELLED: "bg-red-100 text-red-800",
        REJECTED: "bg-gray-100 text-gray-800"
    };

    return (
        <select
            disabled={loading}
            defaultValue={currentStatus}
            onChange={handleChange}
            className={`px-2 py-1 rounded text-xs font-semibold border-0 cursor-pointer ${colors[currentStatus] || 'bg-gray-100'}`}
        >
            {Object.keys(colors).map(status => (
                <option key={status} value={status}>
                    {/* @ts-ignore */}
                    {t(`statusEnum.${status}`)}
                </option>
            ))}
        </select>
    );
}
