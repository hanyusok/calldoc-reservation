"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, Search, Building2, MapPin, Phone, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { createPharmacy, updatePharmacy, deletePharmacy, setPharmacyDefault } from "@/app/actions/pharmacy";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface Pharmacy {
    id: string;
    name: string;
    fax: string | null;
    phone: string | null;
    address: string | null;
    isDefault: boolean;
}

interface PharmacyListProps {
    initialPharmacies: Pharmacy[];
    totalPages: number;
    currentPage: number;
    initialQuery: string;
}

export default function PharmacyList({ initialPharmacies, totalPages, currentPage, initialQuery }: PharmacyListProps) {
    const t = useTranslations('Admin.pharmacies');
    const tCommon = useTranslations('Admin.common');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Local state for immediate UI feedback
    const [searchTerm, setSearchTerm] = useState(initialQuery);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "", fax: "", phone: "", address: "" });
    const [loading, setLoading] = useState(false);

    // Sync searchTerm with URL query param if it changes externally
    useEffect(() => {
        setSearchTerm(initialQuery);
    }, [initialQuery]);

    // Create a query string generator
    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(name, value);
            return params.toString();
        },
        [searchParams]
    );

    // Debounced search handler
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== initialQuery) {
                const params = new URLSearchParams(searchParams.toString());
                if (searchTerm) {
                    params.set('q', searchTerm);
                } else {
                    params.delete('q');
                }
                params.set('page', '1'); // Reset to page 1 on search
                router.push(`${pathname}?${params.toString()}`);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, router, pathname, searchParams, initialQuery]);

    const handlePageChange = (page: number) => {
        router.push(`${pathname}?${createQueryString('page', page.toString())}`);
    };

    const handleOpenModal = (pharmacy?: Pharmacy) => {
        if (pharmacy) {
            setEditingId(pharmacy.id);
            setFormData({
                name: pharmacy.name,
                fax: pharmacy.fax || "",
                phone: pharmacy.phone || "",
                address: pharmacy.address || ""
            });
        } else {
            setEditingId(null);
            setFormData({ name: "", fax: "", phone: "", address: "" });
        }
        setIsModalOpen(true);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = {
            name: formData.name,
            fax: formData.fax || undefined,
            phone: formData.phone || undefined,
            address: formData.address || undefined
        };

        if (editingId) {
            await updatePharmacy(editingId, data);
        } else {
            await createPharmacy(data);
        }

        setLoading(false);
        setIsModalOpen(false);
        router.refresh();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        await deletePharmacy(id);
        router.refresh();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        className="pl-11 w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-blue-700 shadow-md transition-colors whitespace-nowrap"
                >
                    <Plus size={18} />
                    {t('addPharmacy')}
                </button>
            </div>

            <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('table.name')}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('table.phone')}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('table.fax')}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('table.address')}</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">{tCommon('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {initialPharmacies.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <Building2 className="w-12 h-12 text-gray-300 mb-3" />
                                        <p className="text-base font-medium">{t('noPharmacies')}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            initialPharmacies.map((pharmacy) => (
                                <tr key={pharmacy.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900">{pharmacy.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{pharmacy.phone || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{pharmacy.fax || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={pharmacy.address || ''}>
                                        <div className="flex items-center">
                                            {pharmacy.address && <MapPin className="w-3 h-3 mr-1 text-gray-400 flex-shrink-0" />}
                                            <span className="truncate">{pharmacy.address || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={async () => {
                                                if (loading) return;
                                                setLoading(true);
                                                await setPharmacyDefault(pharmacy.id);
                                                setLoading(false);
                                                router.refresh();
                                            }}
                                            className={`mr-4 p-1 rounded-full transition-colors ${pharmacy.isDefault ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'}`}
                                            title="Set as Default"
                                        >
                                            <Star size={18} fill={pharmacy.isDefault ? "currentColor" : "none"} />
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal(pharmacy)}
                                            className="text-blue-600 hover:text-blue-900 mr-4 p-1 hover:bg-blue-50 rounded-full transition-colors"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(pharmacy.id)}
                                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded-full transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={20} className="text-gray-600" />
                    </button>

                    <span className="text-sm font-medium text-gray-700 px-2">
                        {currentPage} / {totalPages}
                    </span>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight size={20} className="text-gray-600" />
                    </button>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100">
                        <h3 className="text-xl font-bold mb-6 text-gray-900">{editingId ? t('editPharmacy') : t('addPharmacy')}</h3>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('form.name')}</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-300 rounded-xl pl-10 p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form.phone')}</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form.fax')}</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.fax}
                                        onChange={e => setFormData({ ...formData, fax: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form.address')}</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl text-sm font-medium transition-colors"
                                >
                                    {tCommon('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md transition-colors"
                                >
                                    {loading ? tCommon('saving') : tCommon('save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
