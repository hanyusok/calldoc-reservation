'use client';

import { useState, useEffect } from "react";
import { setAppointmentPayment, sendMeetingLink } from "@/app/actions/admin";
import { DollarSign, Video, ZoomIn, Check, PrinterCheck } from "lucide-react";

// ... (existing code)


import SimpleModal from "./SimpleModal";
import { useRouter } from "next/navigation";
import { AppointmentStatus, PaymentStatus } from "@prisma/client";
import { useTranslations } from "next-intl";

type Appointment = {
    id: string;
    status: AppointmentStatus;
    symptoms: string | null;
    meetingLink: string | null;
    payment: {
        amount: number;
        status: PaymentStatus;
    } | null;
};

export default function AppointmentFlowManager({ appointment }: { appointment: Appointment }) {
    const t = useTranslations('Admin.flowManager');
    const tAdmin = useTranslations('Admin');
    const [viewSymptoms, setViewSymptoms] = useState(false);
    const [isPriceOpen, setIsPriceOpen] = useState(false);
    const [isLinkOpen, setIsLinkOpen] = useState(false);

    const [price, setPrice] = useState(15000);
    const [link, setLink] = useState(appointment.meetingLink || "");

    useEffect(() => {
        if (!appointment.meetingLink) {
            const savedDefault = localStorage.getItem('calldoc_default_meet_link');
            setLink(savedDefault || "https://meet.google.com/new");
        }
    }, [appointment.meetingLink]);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleSetPrice = async () => {
        setLoading(true);
        await setAppointmentPayment(appointment.id, price);
        setLoading(false);
        setIsPriceOpen(false);
        router.refresh();
    };

    const handleSendLink = async () => {
        setLoading(true);
        await sendMeetingLink(appointment.id, link);
        setLoading(false);
        setIsLinkOpen(false);
        router.refresh();
    };

    return (
        <div className="flex gap-2 justify-end">
            {/* 1. View Symptoms - Always available if exists */}
            {appointment.symptoms && (
                <>
                    <button
                        onClick={() => setViewSymptoms(true)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded tooltip"
                        title={t('viewSymptoms')}
                    >
                        <ZoomIn className="w-5 h-5" />
                    </button>
                    <SimpleModal isOpen={viewSymptoms} onClose={() => setViewSymptoms(false)} title={t('viewSymptomsTitle')}>
                        <div className="p-4 bg-gray-50 rounded mb-4 whitespace-pre-wrap">
                            {appointment.symptoms}
                        </div>
                        <button onClick={() => setViewSymptoms(false)} className="w-full bg-gray-200 py-2 rounded">{t('close')}</button>
                    </SimpleModal>
                </>
            )}

            {/* 2. Set Price - If Payment Pending and Amount is 0 (or want to update) */}
            {appointment.payment?.status === 'PENDING' && (
                <>
                    <button
                        onClick={() => setIsPriceOpen(true)}
                        className={`p-2 rounded ${appointment.payment?.amount > 0 ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50 animate-pulse'}`}
                        title={t('setPriceTitle')}
                    >
                        <DollarSign className="w-5 h-5" />
                    </button>
                    <SimpleModal isOpen={isPriceOpen} onClose={() => setIsPriceOpen(false)} title={t('setPriceTitle')}>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">{t('setPriceDesc')}</p>
                            <div>
                                <label className="block text-sm font-medium">{t('amountLabel')}</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={e => setPrice(Number(e.target.value))}
                                    onFocus={(e) => e.target.select()}
                                    className="w-full border p-2 rounded text-right"
                                />
                            </div>
                            <button
                                onClick={handleSetPrice}
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-2 rounded"
                            >
                                {loading ? t('saveButton') : t('setPriceButton')}
                            </button>
                        </div>
                    </SimpleModal>
                </>
            )}

            {/* 3. Send Link - If Confirmed (Paid) */}
            {appointment.status === 'CONFIRMED' && (
                <>
                    <button
                        onClick={() => setIsLinkOpen(true)}
                        className={`p-2 rounded ${appointment.meetingLink ? 'text-blue-600 bg-blue-50' : 'text-gray-600 bg-gray-100'}`}
                        title={t('sendLinkTitle')}
                    >
                        <Video className="w-5 h-5" />
                    </button>
                    <SimpleModal isOpen={isLinkOpen} onClose={() => setIsLinkOpen(false)} title={t('sendLinkTitle')}>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">{t('sendLinkDesc')}</p>
                            <div>
                                <label className="block text-sm font-medium">{t('meetingUrlLabel')}</label>
                                <input
                                    type="text"
                                    value={link}
                                    onChange={e => setLink(e.target.value)}
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                            <button
                                onClick={handleSendLink}
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-2 rounded"
                            >
                                {loading ? t('sendingButton') : t('sendLinkButton')}
                            </button>
                        </div>
                    </SimpleModal>
                </>
            )}

            {/* 4. Issue Prescription - If Completed and Requested */}
            {/* @ts-ignore - appointment type expansion */}
            {appointment.prescription && (
                <>
                    <PrescriptionManager appointment={appointment} t={t} tAdmin={tAdmin} />
                </>
            )}
        </div>
    );
}

import { issuePrescription, updatePrescriptionPharmacy } from "@/app/actions/prescription";
import { sendFax } from "@/app/actions/fax";
import { getPharmacies, createPharmacy } from "@/app/actions/pharmacy";
import { Search, MapPin } from "lucide-react";

function PrescriptionManager({ appointment, t, tAdmin }: { appointment: any, t: any, tAdmin: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Pharmacy Edit State
    const [isEditingPharmacy, setIsEditingPharmacy] = useState(false);
    const [pharmacies, setPharmacies] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPharmacy, setSelectedPharmacy] = useState<any | null>(null);

    useEffect(() => {
        if (isEditingPharmacy && pharmacies.length === 0) {
            getPharmacies(1, 100).then(data => setPharmacies((data as any).pharmacies || []));
        }
    }, [isEditingPharmacy]);

    const filteredPharmacies = pharmacies.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.address && p.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleUpdatePharmacy = async () => {
        if (!selectedPharmacy) return;
        setLoading(true);
        await updatePrescriptionPharmacy(appointment.prescription.id, {
            name: selectedPharmacy.name,
            fax: selectedPharmacy.fax, // allow null
            phone: selectedPharmacy.phone, // allow null
            address: selectedPharmacy.address // allow null
        });
        setLoading(false);
        setIsEditingPharmacy(false);
        router.refresh();
    };

    const handleSendFax = async () => {
        if (!selectedFile) return;
        setLoading(true);

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("prescriptionId", appointment.prescription.id);

        const result = await sendFax(formData);

        if (result?.error) {
            alert(t('faxFail') + ": " + result.error);
        } else {
            alert(t('faxSuccess'));
            setIsOpen(false);
            router.refresh();
        }
        setLoading(false);
    };

    const handleManualIssue = async () => {
        setLoading(true);
        // Fallback or just set status
        await issuePrescription(appointment.prescription.id, "");
        setLoading(false);
        setIsOpen(false);
        router.refresh();
    };

    const isIssued = appointment.prescription.status === 'ISSUED';
    const btnColor = isIssued ? 'text-green-600 bg-green-50' : (appointment.prescription.status === 'REQUESTED' ? 'text-red-600 bg-red-50 animate-pulse' : 'text-gray-400 bg-gray-100');

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={`p-2 rounded ${btnColor}`}
                title={isIssued ? t('viewPrescriptionTitle') : t('sendFaxTitle')}
            >
                <PrinterCheck className="w-5 h-5" />
            </button>
            <SimpleModal isOpen={isOpen} onClose={() => setIsOpen(false)} title={isIssued ? t('viewPrescriptionTitle') : t('sendFaxTitle')}>
                <div className="space-y-4">
                    {/* Pharmacy Information Section */}
                    <div className="bg-gray-50 p-3 rounded relative group">
                        {!isEditingPharmacy ? (
                            <>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-sm font-bold text-gray-700 mb-1">{t('pharmacy')}</div>
                                        <div className="text-gray-900">{appointment.prescription.pharmacyName}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {t('fax')}: {appointment.prescription.pharmacyFax || '-'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {appointment.prescription.pharmacyAddress || '-'}
                                        </div>
                                    </div>
                                    {!isIssued && (
                                        <button
                                            onClick={() => setIsEditingPharmacy(true)}
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            {tAdmin('actions.edit')}
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">약국 검색/변경</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        placeholder="약국 이름 검색..."
                                        className="w-full border p-2 rounded text-sm"
                                        autoFocus
                                    />
                                    {searchTerm && (
                                        <div className="absolute z-10 w-full bg-white border shadow-lg max-h-40 overflow-y-auto mt-1 rounded">
                                            {filteredPharmacies.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => {
                                                        setSelectedPharmacy(p);
                                                        setSearchTerm(p.name);
                                                    }}
                                                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 border-b last:border-0"
                                                >
                                                    <div className="font-bold">{p.name}</div>
                                                    <div className="text-xs text-gray-500">{p.address}</div>
                                                </button>
                                            ))}
                                            {filteredPharmacies.length === 0 && (
                                                <div className="p-2 text-xs text-gray-500 text-center">검색 결과 없음</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {selectedPharmacy && (
                                    <div className="text-xs bg-blue-50 p-2 rounded text-blue-800">
                                        선택됨: {selectedPharmacy.name} (Fax: {selectedPharmacy.fax})
                                    </div>
                                )}
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => setIsEditingPharmacy(false)}
                                        className="px-3 py-1 text-xs text-gray-600 bg-gray-200 rounded"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={handleUpdatePharmacy}
                                        disabled={!selectedPharmacy || loading}
                                        className="px-3 py-1 text-xs text-white bg-blue-600 rounded disabled:opacity-50"
                                    >
                                        변경 저장
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">{t('status')}</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${isIssued ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {tAdmin(`prescriptionStatusEnum.${appointment.prescription.status}`)}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">{t('fileUrlLabel') || "처방전 파일 (PDF)"}</label>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={e => {
                                if (e.target.files && e.target.files[0]) {
                                    setSelectedFile(e.target.files[0]);
                                }
                            }}
                            className="w-full border p-2 rounded text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            disabled={isIssued}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            선택한 PDF 파일이 팩스로 전송됩니다.
                        </p>
                    </div>

                    {!isIssued && (
                        <div className="flex flex-col gap-2">
                            {selectedFile && (
                                <button
                                    onClick={handleSendFax}
                                    disabled={loading || !selectedFile || !appointment.prescription.pharmacyFax}
                                    className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? t('faxSending') : t('sendFaxButton')}
                                </button>
                            )}
                            {selectedFile && !appointment.prescription.pharmacyFax && (
                                <p className="text-xs text-red-500 text-center">
                                    약국 팩스 번호가 없습니다. 약국을 변경해주세요.
                                </p>
                            )}

                            <button
                                onClick={handleManualIssue}
                                disabled={loading}
                                className="w-full bg-gray-200 text-gray-700 py-2 rounded text-sm hover:bg-gray-300"
                            >
                                {t('issueButton')} (단순 상태 변경)
                            </button>
                        </div>
                    )}

                    {isIssued && (
                        <div className="text-center text-sm text-green-600 font-medium py-2">
                            ✓ {t('issued')}
                        </div>
                    )}
                </div>
            </SimpleModal>
        </>
    )
}
