"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, Search, Building2, MapPin, Phone } from "lucide-react";
import { createPharmacy, updatePharmacy, deletePharmacy } from "@/app/actions/pharmacy";

interface Pharmacy {
    id: string;
    name: string;
    fax: string | null;
    phone: string | null;
    address: string | null;
}

export default function PharmacyList({ pharmacies }: { pharmacies: Pharmacy[] }) {
    const t = useTranslations('Admin.pharmacies');
    const tCommon = useTranslations('Admin.common');
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "", fax: "", phone: "", address: "" });
    const [loading, setLoading] = useState(false);

    const filtered = pharmacies.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.address && p.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
        window.location.reload();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        await deletePharmacy(id);
        window.location.reload();
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
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <Building2 className="w-12 h-12 text-gray-300 mb-3" />
                                        <p className="text-base font-medium">{t('noPharmacies')}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map((pharmacy) => (
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
