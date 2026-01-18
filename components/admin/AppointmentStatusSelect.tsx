'use client';

import { AppointmentStatus } from "@prisma/client";
import { updateAppointmentStatus } from "@/app/actions/admin";
import { useState } from "react";

export default function AppointmentStatusSelect({
    id,
    currentStatus
}: {
    id: string,
    currentStatus: AppointmentStatus
}) {
    const [loading, setLoading] = useState(false);

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as AppointmentStatus;
        if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

        setLoading(true);
        const result = await updateAppointmentStatus(id, newStatus);
        setLoading(false);

        if (!result.success) {
            alert("Failed to update status");
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
                    {status}
                </option>
            ))}
        </select>
    );
}
