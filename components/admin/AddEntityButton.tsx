'use client';

import { useState } from "react";
import SimpleModal from "./SimpleModal";
import { Plus } from "lucide-react";

interface AddEntityButtonProps {
    buttonLabel: string;
    modalTitle: string;
    FormComponent: React.ComponentType<{ onSuccess: () => void }>;
}

export default function AddEntityButton({ buttonLabel, modalTitle, FormComponent }: AddEntityButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                <Plus className="w-4 h-4" />
                {buttonLabel}
            </button>

            <SimpleModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={modalTitle}
            >
                <FormComponent onSuccess={() => setIsOpen(false)} />
            </SimpleModal>
        </>
    );
}
