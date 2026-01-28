"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { createPharmacy, updatePharmacy, deletePharmacy } from "@/app/actions/pharmacy";

interface Pharmacy {
    id: string;
    name: string;
    fax: string | null;
    phone: string | null;
    address: string | null;
}

export default function PharmacyList({ pharmacies }: { pharmacies: Pharmacy[] }) {
    const t = useTranslations('Admin'); // Assuming we will add translations later
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

        // Prepare optional fields
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
        // We rely on server action revalidation to refresh list, 
        // but if it's a client component receiving props, we might need router.refresh() 
        // effectively handled if the parent is a server component refreshing.
        // Actually, for instant feedback, router.refresh is good.
        window.location.reload();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        await deletePharmacy(id);
        window.location.reload();
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search pharmacies..."
                        className="pl-10 w-full border rounded-lg p-2.5 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-blue-700"
                >
                    <Plus size={16} />
                    Add Pharmacy
                </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fax</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No pharmacies found.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((pharmacy) => (
                                <tr key={pharmacy.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pharmacy.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pharmacy.phone || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pharmacy.fax || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs" title={pharmacy.address || ''}>{pharmacy.address || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleOpenModal(pharmacy)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(pharmacy.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 size={16} />
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Pharmacy' : 'Add Pharmacy'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pharmacy Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border rounded p-2 text-sm"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded p-2 text-sm"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fax</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded p-2 text-sm"
                                        value={formData.fax}
                                        onChange={e => setFormData({ ...formData, fax: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input
                                    type="text"
                                    className="w-full border rounded p-2 text-sm"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
