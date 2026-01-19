'use client';

import { useState } from "react";
import { deletePatient } from "@/app/actions/admin";
import SimpleModal from "./SimpleModal";
import PatientForm from "./PatientForm";
import ActionMenu from "./ActionMenu";
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
    const [isEditOpen, setIsEditOpen] = useState(false);
    const router = useRouter();
    const t = useTranslations('Admin.actions');

    const handleDelete = async () => {
        if (!confirm(t('delete') + "?")) return;
        // Note: in real app, might check for existing appointments first
        await deletePatient(patient.id);
        router.refresh();
    };

    const patientForForm = {
        ...patient,
        dateOfBirth: patient.dateOfBirth.toISOString()
    };

    return (
        <>
            <ActionMenu
                onEdit={() => setIsEditOpen(true)}
                onDelete={handleDelete}
                editLabel={t('edit')}
                deleteLabel={t('delete')}
            />

            <SimpleModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                title={t('edit')}
            >
                <PatientForm
                    initialData={patientForForm}
                    onSuccess={() => setIsEditOpen(false)}
                />
            </SimpleModal>
        </>
    );
}
