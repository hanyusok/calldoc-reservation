'use client';

import { useState, useEffect } from "react";
import { createAppointmentAdmin, updateAppointmentAdmin, searchPatients } from "@/app/actions/admin";
import { AppointmentStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

type AppointmentData = {
    id: string;
    patientId: string;
    startDateTime: string | Date;
    endDateTime: string | Date;
    status: AppointmentStatus;
    patient?: { name: string; user: { email: string | null } };
};

type Props = {
    initialData?: AppointmentData;
    onSuccess: () => void;
};

export default function AppointmentForm({ initialData, onSuccess }: Props) {
    const isEdit = !!initialData;
    const router = useRouter();

    const [patientId, setPatientId] = useState(initialData?.patientId || "");
    const [date, setDate] = useState(
        initialData?.startDateTime
            ? new Date(initialData.startDateTime).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
    );
    const [time, setTime] = useState(
        initialData?.startDateTime
            ? format(new Date(initialData.startDateTime), 'HH:mm')
            : "09:00"
    );
    const [status, setStatus] = useState<AppointmentStatus>(initialData?.status || "PENDING");

    // Patient Search
    const [patientSearch, setPatientSearch] = useState("");
    const [patientResults, setPatientResults] = useState<{ id: string, name: string, user: { email: string | null } }[]>([]);
    const [selectedPatientName, setSelectedPatientName] = useState(initialData?.patient?.name || "");

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit) return;
        const timer = setTimeout(async () => {
            if (patientSearch.length > 1) {
                const results = await searchPatients(patientSearch);
                setPatientResults(results);
            } else {
                setPatientResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [patientSearch, isEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Combine Date and Time
        const startDateTime = new Date(`${date}T${time}`);
        const endDateTime = new Date(startDateTime.getTime() + 30 * 60000); // Default 30 mins

        const payload = {
            startDateTime: startDateTime.toISOString(),
            endDateTime: endDateTime.toISOString(),
            status
        };

        let result;
        if (isEdit && initialData) {
            result = await updateAppointmentAdmin(initialData.id, payload);
        } else {
            if (!patientId) {
                alert("Please select a patient");
                setLoading(false);
                return;
            }
            result = await createAppointmentAdmin({
                ...payload,
                patientId,
                amount: 15000 // Default fee
            });
        }

        setLoading(false);
        if (result.success) {
            router.refresh();
            onSuccess();
        } else {
            alert(result.error || "Operation failed");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {!isEdit && (
                <div className="relative">
                    <label className="block text-sm font-medium mb-1">Select Patient</label>
                    {patientId ? (
                        <div className="flex justify-between items-center p-2 bg-gray-100 rounded">
                            <span>{selectedPatientName}</span>
                            <button type="button" onClick={() => { setPatientId(""); setSelectedPatientName(""); }} className="text-red-500 text-sm">Change</button>
                        </div>
                    ) : (
                        <>
                            <input
                                type="text"
                                placeholder="Search patient by name or user email..."
                                value={patientSearch}
                                onChange={e => setPatientSearch(e.target.value)}
                                className="w-full border rounded p-2"
                            />
                            {patientResults.length > 0 && (
                                <ul className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-40 overflow-auto">
                                    {patientResults.map(p => (
                                        <li key={p.id}
                                            onClick={() => { setPatientId(p.id); setSelectedPatientName(`${p.name} (${p.user.email})`); setPatientSearch(""); setPatientResults([]); }}
                                            className="p-2 hover:bg-gray-100 cursor-pointer"
                                        >
                                            {p.name} <span className="text-xs text-gray-500">({p.user.email})</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    )}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <input
                        type="date"
                        required
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full border rounded p-2 bg-transparent"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Time</label>
                    <input
                        type="time"
                        required
                        value={time}
                        onChange={e => setTime(e.target.value)}
                        className="w-full border rounded p-2 bg-transparent"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                    value={status}
                    onChange={e => setStatus(e.target.value as AppointmentStatus)}
                    className="w-full border rounded p-2 bg-transparent"
                >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="REJECTED">REJECTED</option>
                </select>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? "Saving..." : (isEdit ? "Update Appointment" : "Create Appointment")}
            </button>
        </form>
    );
}
