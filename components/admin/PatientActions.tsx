'use client';

import { useState } from "react";
import { deletePatient } from "@/app/actions/admin";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
import SimpleModal from "./SimpleModal";
import PatientForm from "./PatientForm";
import { Gender, Relationship } from "@prisma/client";
import { useRouter } from "next/navigation";

// Define strict type for props
type Patient = {
    id: string;
    userId: string;
    name: string;
    dateOfBirth: Date;
    gender: Gender;
    relationship: Relationship;
    residentNumber: string | null;
    user: { email: string | null; name: string | null };
};

export default function PatientActions({ patient }: { patient: Patient }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this patient? associated appointments might lose reference.")) return;
        // Note: in real app, might check for existing appointments first
        await deletePatient(patient.id);
        router.refresh();
    };

    // Serialize date for form
    const patientForForm = {
        ...patient,
        dateOfBirth: patient.dateOfBirth.toISOString()
    };

    return (
        <div className="relative">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1 hover:bg-gray-100 rounded">
                <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </button>

            {isMenuOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border rounded shadow-lg z-20">
                        <button
                            onClick={() => { setIsEditOpen(true); setIsMenuOpen(false); }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                            <Edit className="w-4 h-4" /> Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 flex items-center gap-2"
                        >
                            <Trash className="w-4 h-4" /> Delete
                        </button>
                    </div>
                </>
            )}

            <SimpleModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                title="Edit Patient"
            >
                <PatientForm
                    initialData={patientForForm}
                    onSuccess={() => setIsEditOpen(false)}
                />
            </SimpleModal>
        </div>
    );
}
