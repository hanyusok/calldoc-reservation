'use client';

import { useState, useEffect } from "react";
import { createPatient, updatePatient, geAllUsers } from "@/app/actions/admin";
import { Gender, Relationship } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type PatientData = {
    id: string;
    userId: string;
    name: string;
    dateOfBirth: string; // ISO string or Date object
    gender: Gender;
    relationship: Relationship;
    residentNumber?: string | null;
    user?: { email: string | null; name: string | null };
};

type Props = {
    initialData?: PatientData;
    onSuccess: () => void;
};

export default function PatientForm({ initialData, onSuccess }: Props) {
    const isEdit = !!initialData;
    const router = useRouter();

    // Form State
    const [userId, setUserId] = useState(initialData?.userId || "");
    const [name, setName] = useState(initialData?.name || "");
    const [gender, setGender] = useState<Gender>(initialData?.gender || "MALE");
    const [relationship, setRelationship] = useState<Relationship>(initialData?.relationship || "FAMILY");
    const [dateOfBirth, setDateOfBirth] = useState(
        initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : ""
    );
    const [residentNumber, setResidentNumber] = useState(initialData?.residentNumber || "");

    // User Search State (Only for Create)
    const [userSearch, setUserSearch] = useState("");
    const [userResults, setUserResults] = useState<{ id: string, email: string | null, name: string | null }[]>([]);
    const [selectedUserEmail, setSelectedUserEmail] = useState(initialData?.user?.email || "");

    const [loading, setLoading] = useState(false);

    // User Search Effect
    useEffect(() => {
        if (isEdit) return; // Cannot change user in edit mode usually
        const timer = setTimeout(async () => {
            if (userSearch.length > 1) {
                const users = await geAllUsers(userSearch);
                setUserResults(users);
            } else {
                setUserResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [userSearch, isEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            name,
            gender,
            relationship,
            dateOfBirth,
            residentNumber
        };

        let result;
        if (isEdit && initialData) {
            result = await updatePatient(initialData.id, payload);
        } else {
            if (!userId) {
                alert("Please select a user");
                setLoading(false);
                return;
            }
            result = await createPatient({ ...payload, userId });
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
                    <label className="block text-sm font-medium mb-1">Owner User</label>
                    {userId ? (
                        <div className="flex justify-between items-center p-2 bg-gray-100 rounded">
                            <span>{selectedUserEmail}</span>
                            <button type="button" onClick={() => { setUserId(""); setSelectedUserEmail(""); }} className="text-red-500 text-sm">Change</button>
                        </div>
                    ) : (
                        <>
                            <input
                                type="text"
                                placeholder="Search user by email..."
                                value={userSearch}
                                onChange={e => setUserSearch(e.target.value)}
                                className="w-full border rounded p-2"
                            />
                            {userResults.length > 0 && (
                                <ul className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-40 overflow-auto">
                                    {userResults.map(u => (
                                        <li key={u.id}
                                            onClick={() => { setUserId(u.id); setSelectedUserEmail(u.email || ""); setUserSearch(""); setUserResults([]); }}
                                            className="p-2 hover:bg-gray-100 cursor-pointer"
                                        >
                                            {u.email} ({u.name})
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    )}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-1">Patient Name</label>
                <input
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full border rounded p-2 bg-transparent"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <select
                        value={gender}
                        onChange={e => setGender(e.target.value as Gender)}
                        className="w-full border rounded p-2 bg-transparent"
                    >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Relationship</label>
                    <select
                        value={relationship}
                        onChange={e => setRelationship(e.target.value as Relationship)}
                        className="w-full border rounded p-2 bg-transparent"
                    >
                        <option value="SELF">Self</option>
                        <option value="FAMILY">Family</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Date of Birth</label>
                <input
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={e => setDateOfBirth(e.target.value)}
                    className="w-full border rounded p-2 bg-transparent"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Resident Number (Optional)</label>
                <input
                    value={residentNumber}
                    onChange={e => setResidentNumber(e.target.value)}
                    className="w-full border rounded p-2 bg-transparent"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? "Saving..." : (isEdit ? "Update Patient" : "Create Patient")}
            </button>
        </form>
    );
}
