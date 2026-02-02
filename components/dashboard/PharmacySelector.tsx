"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Search, MapPin } from "lucide-react";
import { requestPrescription } from "@/app/actions/prescription";
import { getPharmacies, createPharmacy } from "@/app/actions/pharmacy";

interface PharmacySelectorProps {
    appointmentId: string;
    onSuccess: () => void;
}

interface Pharmacy {
    id: string;
    name: string;
    fax: string | null;
    phone: string | null;
    address: string | null;
    isDefault: boolean;
}

export default function PharmacySelector({ appointmentId, onSuccess }: PharmacySelectorProps) {
    const t = useTranslations("Dashboard.pharmacy");

    // Mode: 'select' (search existing) or 'create' (add new)
    const [mode, setMode] = useState<'select' | 'create'>('select');

    // Select Mode State
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
    const [isFetching, setIsFetching] = useState(true);

    // Create Mode State (Manual Input)
    const [name, setName] = useState("");
    const [fax, setFax] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    const [loading, setLoading] = useState(false);

    // Fetch pharmacies on mount
    useEffect(() => {
        async function fetchPharmacies() {
            try {
                // getPharmacies now supports pagination and returns { pharmacies: [...], total, totalPages }
                // We fetch a larger number to support client-side filtering for now
                const data = await getPharmacies(1, 100);
                setPharmacies((data as any).pharmacies || []);
            } catch (e) {
                console.error("Failed to fetch pharmacies", e);
            } finally {
                setIsFetching(false);
            }
        }
        fetchPharmacies();
    }, []);

    const [isFocused, setIsFocused] = useState(false);

    // Filter pharmacies
    const filteredPharmacies = useMemo(() => {
        if (!searchTerm) {
            // Return ONLY default pharmacy if no search term
            return pharmacies.filter(p => p.isDefault);
        }
        const lower = searchTerm.toLowerCase();
        return pharmacies.filter(p =>
            p.name.toLowerCase().includes(lower) ||
            (p.address && p.address.toLowerCase().includes(lower))
        );
    }, [pharmacies, searchTerm]);

    const handleSelectPharmacy = (pharmacy: Pharmacy) => {
        setSelectedPharmacy(pharmacy);
        setSearchTerm(pharmacy.name); // Show name in input
        setIsFocused(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        let pharmacyData = { name, fax, phone, address };

        if (mode === 'select') {
            if (!selectedPharmacy) {
                alert(t('errorSelect')); // "Please select a pharmacy"
                setLoading(false);
                return;
            }
            pharmacyData = {
                name: selectedPharmacy.name,
                fax: selectedPharmacy.fax || "",
                phone: selectedPharmacy.phone || "",
                address: selectedPharmacy.address || ""
            };
        } else {
            try {
                const createResult = await createPharmacy({
                    name: pharmacyData.name,
                    fax: pharmacyData.fax || undefined,
                    phone: pharmacyData.phone || undefined,
                    address: pharmacyData.address || undefined
                });

                if (createResult.error) {
                    throw new Error(createResult.error);
                }
            } catch (e) {
                console.error("Failed to create pharmacy", e);
                alert(t('errorCreate'));
                setLoading(false);
                return;
            }
        }

        // Send Prescription Request
        const result = await requestPrescription(appointmentId, pharmacyData);

        setLoading(false);

        if (result.success) {
            alert(t('success') || "Prescription requested successfully.");
            onSuccess();
        } else {
            alert(t('error') || "Failed to request prescription.");
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                {t('title')}
            </h3>

            {/* Custom Tab UI */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => { setMode('select'); setSelectedPharmacy(null); setSearchTerm(''); }}
                    className={`pb-3 px-4 text-sm font-semibold transition-colors relative ${mode === 'select'
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {t('searchMode')}
                    {mode === 'select' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                    )}
                </button>
                <button
                    onClick={() => setMode('create')}
                    className={`pb-3 px-4 text-sm font-semibold transition-colors relative ${mode === 'create'
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {t('createMode')}
                    {mode === 'create' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                    )}
                </button>
            </div>

            <p className="text-sm text-gray-500 mb-6">
                {mode === 'select' ? t('descriptionSelect') : t('descriptionCreate')}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">

                {mode === 'select' && (
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">{t('searchLabel')}</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setSelectedPharmacy(null);
                                }}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => {
                                    // Delay to allow click on dropdown items
                                    setTimeout(() => setIsFocused(false), 200);
                                }}
                                placeholder={t('searchPlaceholder')}
                                className="pl-11 w-full border border-gray-300 rounded-xl p-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                            />
                        </div>
                        {/* Show list if search term exists OR input is focused */}
                        {!selectedPharmacy && (searchTerm || isFocused) && (
                            <div className="absolute z-10 w-full sm:w-[calc(100%-3rem)] bg-white border border-gray-200 rounded-xl shadow-xl mt-1 max-h-60 overflow-y-auto">
                                {!searchTerm && filteredPharmacies.length > 0 && (
                                    <div className="px-5 py-2 bg-gray-50 text-xs font-bold text-gray-500 border-b">
                                        {t('recommendedTitle') || "추천 약국 (가까운 순)"}
                                    </div>
                                )}
                                {filteredPharmacies.length > 0 ? (
                                    filteredPharmacies.map(p => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => handleSelectPharmacy(p)}
                                            className="w-full text-left px-5 py-3 hover:bg-gray-50 transition-colors border-b last:border-0"
                                        >
                                            <div className="font-bold text-gray-900">{p.name}</div>
                                            <div className="text-gray-500 text-sm mt-0.5">{p.address}</div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-5 py-4 text-sm text-gray-500 text-center">
                                        {t('noResults')}
                                        <button
                                            type="button"
                                            onClick={() => setMode('create')}
                                            className="text-blue-600 font-bold ml-1 hover:underline"
                                        >
                                            {t('createNewLink')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        {selectedPharmacy && (
                            <div className="mt-2 p-4 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center animate-fadeIn">
                                <div>
                                    <div className="font-bold text-blue-900">{selectedPharmacy.name}</div>
                                    <div className="text-blue-700 text-sm mt-1">{selectedPharmacy.address}</div>
                                    {selectedPharmacy.fax && <div className="text-blue-600 text-xs mt-1">FAX: {selectedPharmacy.fax}</div>}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setSelectedPharmacy(null); setSearchTerm(''); }}
                                    className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                                >
                                    {t('change') || "Change"}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {mode === 'create' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('nameLabel')}</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t('namePlaceholder')}
                                className="w-full border border-gray-300 rounded-xl p-3 text-base focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('faxLabel')}</label>
                                <input
                                    type="text"
                                    value={fax}
                                    onChange={(e) => setFax(e.target.value)}
                                    placeholder={t('faxPlaceholder')}
                                    className="w-full border border-gray-300 rounded-xl p-3 text-base focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('phoneLabel')}</label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder={t('phonePlaceholder')}
                                    className="w-full border border-gray-300 rounded-xl p-3 text-base focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addressLabel')}</label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder={t('addressPlaceholder')}
                                className="w-full border border-gray-300 rounded-xl p-3 text-base focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || (mode === 'select' && !selectedPharmacy)}
                    className="w-full bg-blue-500 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                    {loading ? t('processing') : (mode === 'create' ? t('createAndSubmit') : t('submitForTransfer'))}
                </button>
            </form>
        </div>
    );
}
