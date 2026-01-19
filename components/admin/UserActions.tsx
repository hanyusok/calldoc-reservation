'use client';

import { useState } from "react";
import { deleteAdminUser } from "@/app/actions/admin";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
import SimpleModal from "./SimpleModal";
import UserForm from "./UserForm";
import Portal from "@/components/ui/Portal";
import { Role } from "@prisma/client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type User = {
    id: string;
    name: string | null;
    email: string | null;
    role: Role;
};

export default function UserActions({ user }: { user: User }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
    const router = useRouter();
    const t = useTranslations('Admin.actions');

    const handleDelete = async () => {
        if (!confirm(t('delete') + "?")) return;
        await deleteAdminUser(user.id);
        router.refresh();
    };

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
                <UserForm
                    initialData={user}
                    onSuccess={() => setIsEditOpen(false)}
                />
            </SimpleModal>
        </div>
    );
}
