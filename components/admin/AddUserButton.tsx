'use client';

import { useState } from "react";
import SimpleModal from "./SimpleModal";
import UserForm from "./UserForm";
import { Plus } from "lucide-react";

export default function AddUserButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                <Plus className="w-4 h-4" />
                Add User
            </button>

            <SimpleModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Add New User"
            >
                <UserForm onSuccess={() => setIsOpen(false)} />
            </SimpleModal>
        </>
    );
}
