'use client';

import { useState } from "react";
import { deletePatient } from "@/app/actions/admin";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
import SimpleModal from "./SimpleModal";
import PatientForm from "./PatientForm";
import Portal from "@/components/ui/Portal";
import { Gender, Relationship } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

// Define strict type for props
type Patient = {
    id: string;
    userId: string;
    name: string;
    dateOfBirth: Date; // Keep as Date
    gender: Gender;
    relationship: Relationship;
    residentNumber: string | null;
    user: { email: string | null; name: string | null };
    [key: string]: any;
};

export default function PatientActions({ patient }: { patient: Patient }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
    const router = useRouter();
    const t = useTranslations('Admin.actions');

    const handleDelete = async () => {
        if (!confirm(t('delete') + "?")) return;
        // Note: in real app, might check for existing appointments first
        await deletePatient(patient.id);
        router.refresh();
    };

    // Serialize date for form - Removed as per instruction, passing patient directly
    // const patientForForm = {
    //     ...patient,
    //     dateOfBirth: patient.dateOfBirth.toISOString()
    // };

    return (
        <div className="relative">
            <button
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setMenuPos({ top: rect.bottom + window.scrollY, left: rect.right + window.scrollX - 192 });
                    setIsMenuOpen(!isMenuOpen);
                }}
                className="p-1 hover:bg-gray-100 rounded"
            >
                <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </button>

            {isMenuOpen && (
                <Portal>
                    <div className="fixed inset-0 z-50" onClick={() => setIsMenuOpen(false)} />
                    <div
                        className="fixed bg-white dark:bg-gray-800 border rounded shadow-lg z-50 w-48"
                        style={{
                            top: `${menuPos.top + 5}px`,
                            left: `${menuPos.left}px`,
                        }}
                    >
                        <button
                            onClick={() => { setIsEditOpen(true); setIsMenuOpen(false); }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                            <Edit className="w-4 h-4" /> {t('edit')}
                        </button>
                        <button
                            onClick={handleDelete}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 flex items-center gap-2"
                        >
                            <Trash className="w-4 h-4" /> {t('delete')}
                        </button>
                    </div>
                </Portal>
            )}

            <SimpleModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                title={t('edit')}
            >
                <PatientForm
                    initialData={patient}
                    onSuccess={() => setIsEditOpen(false)}
                />
            </SimpleModal>
        </div>
    );
}
