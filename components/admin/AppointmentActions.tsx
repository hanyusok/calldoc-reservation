'use client';

import { startTransition, useState } from "react";
import { deleteAppointment, updateAppointmentStatus } from "@/app/actions/admin";
import SimpleModal from "./SimpleModal";
import AppointmentForm from "./AppointmentForm";
import ActionMenu from "./ActionMenu";
import { AppointmentStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type Appointment = {
    id: string;
    patientId: string;
    startDateTime: Date;
    endDateTime: Date;
    status: AppointmentStatus;
    [key: string]: any;
};

export default function AppointmentActions({ appointment }: { appointment: Appointment }) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const router = useRouter();
    const t = useTranslations('Admin.actions');

    const handleDelete = async () => {
        if (!confirm(t('delete') + "?")) return;
        await deleteAppointment(appointment.id);
        router.refresh();
    };

    return (
        <>
            <ActionMenu
                onEdit={() => setIsEditOpen(true)}
                onDelete={handleDelete}
                editLabel={t('editDetails')}
                deleteLabel={t('delete')}
            />

            <SimpleModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                title={t('editDetails')}
            >
                {/* @ts-ignore */}
                <AppointmentForm
                    initialData={appointment}
                    onSuccess={() => setIsEditOpen(false)}
                />
            </SimpleModal>
        </>
    );
}
