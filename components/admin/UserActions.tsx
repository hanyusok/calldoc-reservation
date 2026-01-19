'use client';

import { useState } from "react";
import { deleteAdminUser } from "@/app/actions/admin";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
import SimpleModal from "./SimpleModal";
import UserForm from "./UserForm";
import { Role } from "@prisma/client";
import { useRouter } from "next/navigation";

type User = {
    id: string;
    name: string | null;
    email: string | null;
    role: Role;
};

export default function UserActions({ user }: { user: User }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this user? This will also delete all associated patients and appointments.")) return;
        await deleteAdminUser(user.id);
        router.refresh();
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
                title="Edit User"
            >
                <UserForm
                    initialData={user}
                    onSuccess={() => setIsEditOpen(false)}
                />
            </SimpleModal>
        </div>
    );
}
