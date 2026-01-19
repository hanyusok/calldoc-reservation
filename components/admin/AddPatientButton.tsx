'use client';

import { useState } from "react";
import SimpleModal from "./SimpleModal";
import PatientForm from "./PatientForm";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AddPatientButton() {
    const [isOpen, setIsOpen] = useState(false);
    const t = useTranslations('Admin.patients');

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                <Plus className="w-4 h-4" />
                {t('addPatient')}
            </button>

            <SimpleModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={t('addPatient')}
            >
                <PatientForm onSuccess={() => setIsOpen(false)} />
            </SimpleModal>
        </>
    );
}
