'use client';

import { addPatient, updatePatient } from "@/app/actions/patient";
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Patient {
    id: string;
    name: string;
    residentNumber: string | null;
    dateOfBirth: string; // ISO string
    gender: 'MALE' | 'FEMALE';
    relationship: 'FAMILY' | 'SELF';
    phoneNumber: string | null;
}

interface PatientFormProps {
    editingPatient: Patient | null;
}

export default function PatientForm({ editingPatient }: PatientFormProps) {
    const t = useTranslations('Profile');
    const router = useRouter();

    // State for controlled inputs
    const [residentNumber, setResidentNumber] = useState(editingPatient?.residentNumber || '');
    const [phoneNumber, setPhoneNumber] = useState(editingPatient?.phoneNumber || '');

    // Handle Phone Number Change
    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/[^0-9]/g, '');

        if (value.length > 3 && value.length <= 7) {
            value = `${value.slice(0, 3)}-${value.slice(3)}`;
        } else if (value.length > 7) {
            value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
        }

        if (value.length > 13) {
            value = value.slice(0, 13);
        }

        setPhoneNumber(value);
    };

    // Handle date format from server (Date object or string)
    const initialDob = editingPatient?.dateOfBirth
        ? editingPatient.dateOfBirth.split('T')[0]
        : '';
    const [dob, setDob] = useState(initialDob);
    const [gender, setGender] = useState(editingPatient?.gender || 'MALE');

    // Handle Resident Number Change
    const handleResidentNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/[^0-9]/g, '');

        // Auto-insert hyphen after 6 digits
        if (value.length > 6) {
            value = value.slice(0, 6) + '-' + value.slice(6);
        }
        // Limit length to 14 characters (6 digits + 1 hyphen + 7 digits)
        if (value.length > 14) {
            value = value.slice(0, 14);
        }

        setResidentNumber(value);

        // Auto-fill DOB and Gender if we have enough digits (YYMMDD + 1st digit of back)
        // clean value for parsing: remove hyphen
        const cleanValue = value.replace(/-/g, '');

        if (cleanValue.length >= 7) {
            const front = cleanValue.slice(0, 6);
            const backFirst = cleanValue.charAt(6);

            const yearPrefix = (backFirst === '1' || backFirst === '2' || backFirst === '5' || backFirst === '6') ? '19' :
                (backFirst === '3' || backFirst === '4' || backFirst === '7' || backFirst === '8') ? '20' : null;

            if (yearPrefix) {
                const year = yearPrefix + front.slice(0, 2);
                const month = front.slice(2, 4);
                const day = front.slice(4, 6);

                // Validate date construction
                const dateStr = `${year}-${month}-${day}`;
                const dateObj = new Date(dateStr);

                // Check if valid date
                if (!isNaN(dateObj.getTime())) {
                    setDob(dateStr);
                }

                // Auto-set Gender
                // 1, 3, 5, 7 -> Male
                // 2, 4, 6, 8 -> Female
                const genderDigit = parseInt(backFirst);
                if ([1, 3, 5, 7].includes(genderDigit)) {
                    setGender('MALE');
                } else if ([2, 4, 6, 8].includes(genderDigit)) {
                    setGender('FEMALE');
                }
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        // Ensure manual overrides are respected in FormData if they differ from default
        formData.set('phoneNumber', phoneNumber);

        try {
            const result = editingPatient
                ? await updatePatient(editingPatient.id, formData)
                : await addPatient(formData);

            // @ts-ignore - simple check for success flag from action
            if (result.success) {
                // Redirect to dashboard
                const locale = window.location.pathname.split('/')[1] || 'ko';
                router.push(`/${locale}/dashboard`);
                router.refresh();
            } else {
                alert('Failed to save patient');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">{t('form.name')}</label>
                <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingPatient?.name || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">{t('form.phoneNumber')}</label>
                <input
                    type="text"
                    name="phoneNumber"
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    placeholder="010-1234-5678"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">{t('form.residentNumber')}</label>
                <input
                    type="text"
                    name="residentNumber"
                    required
                    value={residentNumber}
                    onChange={handleResidentNumberChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    placeholder={t('form.residentNumberPlaceholder')}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('form.dob')}</label>
                    <input
                        type="date"
                        name="dateOfBirth"
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('form.gender.label')}</label>
                    <select
                        name="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    >
                        <option value="MALE">{t('form.gender.male')}</option>
                        <option value="FEMALE">{t('form.gender.female')}</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">{t('form.relationship.label')}</label>
                <select
                    name="relationship"
                    defaultValue={editingPatient?.relationship || 'FAMILY'}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                >
                    <option value="FAMILY">{t('form.relationship.family')}</option>
                    <option value="SELF">{t('form.relationship.self')}</option>
                </select>
            </div>

            <div className="flex space-x-3">
                {editingPatient ? (
                    <Link
                        href="/dashboard/profile"
                        className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        {t('form.cancel')}
                    </Link>
                ) : (
                    <button type="reset" className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        {t('form.cancel')}
                    </button>
                )}

                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    {t('form.save')}
                </button>
            </div>
        </form>
    );
}
