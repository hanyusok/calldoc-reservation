'use client';

import { useState } from "react";
import { deleteAdminUser } from "@/app/actions/admin";
import SimpleModal from "./SimpleModal";
import UserForm from "./UserForm";
import ActionMenu from "./ActionMenu";
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
    const [isEditOpen, setIsEditOpen] = useState(false);
    const router = useRouter();
    const t = useTranslations('Admin.actions');

    const handleDelete = async () => {
        if (!confirm(t('delete') + "?")) return;
        await deleteAdminUser(user.id);
        router.refresh();
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
                <UserForm
                    initialData={user}
                    onSuccess={() => setIsEditOpen(false)}
                />
            </SimpleModal>
        </>
    );
}
