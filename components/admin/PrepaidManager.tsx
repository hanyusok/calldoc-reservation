'use client';

import { useState, useEffect } from "react";
import { geAllUsers, addPrepaidCredit, deductPrepaidCredit } from "@/app/actions/admin";
import { Search, Plus, Minus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type User = { id: string; name: string | null; email: string | null; prepaidBalance: number };

export default function PrepaidManager() {
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [amount, setAmount] = useState(10000);
    const t = useTranslations('Admin.prepaid.manager');
    const [description, setDescription] = useState("Admin Adjustment"); // Keep default or localize? Maybe empty is better
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (search.length > 1) {
                const users = await geAllUsers(search);
                setResults(users);
            } else {
                setResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const handleTransaction = async (type: 'ADD' | 'DEDUCT') => {
        if (!selectedUser) return;
        if (amount <= 0) {
            alert("Amount must be positive");
            return;
        }

        const actionText = type === 'ADD' ? t('actions.add') : t('actions.deduct');
        if (!confirm(`${selectedUser.email}: ${amount} KRW - ${actionText}?`)) return;

        setLoading(true);
        let result;
        if (type === 'ADD') {
            result = await addPrepaidCredit(selectedUser.id, amount, description);
        } else {
            result = await deductPrepaidCredit(selectedUser.id, amount, description);
        }
        setLoading(false);

        if (result.success) {
            alert(t('success'));
            setSelectedUser(null); // Reset
            setSearch("");
            setResults([]);
            router.refresh(); // Refresh server components (transaction list)
        } else {
            alert(result.error || t('error'));
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
            <h2 className="text-lg font-bold">{t('title')}</h2>

            {/* User Search / Selection */}
            {!selectedUser ? (
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('searchUser')}</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('searchUser')}
                            className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 dark:border-gray-600"
                        />
                    </div>
                    {results.length > 0 && (
                        <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {results.map(user => (
                                <li
                                    key={user.id}
                                    onClick={() => { setSelectedUser(user); setSearch(""); }}
                                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex justify-between"
                                >
                                    <div>
                                        <div className="font-medium">{user.name || "No Name"}</div>
                                        <div className="text-xs text-gray-500">{user.email}</div>
                                    </div>
                                    <div className="text-sm font-semibold text-blue-600">
                                        {user.prepaidBalance.toLocaleString()} KRW
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ) : (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center">
                    <div>
                        <div className="text-sm text-gray-500">{t('selectUser')}</div>
                        <div className="font-bold">{selectedUser.name} ({selectedUser.email})</div>
                        <div className="text-sm text-blue-600">{t('currentBalance', { balance: selectedUser.prepaidBalance?.toLocaleString() ?? 0 })}</div>
                    </div>
                    <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Transaction Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('amount')}</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 dark:border-gray-600"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('description')}</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 dark:border-gray-600"
                    />
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    disabled={!selectedUser || loading}
                    onClick={() => handleTransaction('ADD')}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="w-4 h-4" />
                    <span>{t('actions.add')}</span>
                </button>
                <button
                    disabled={!selectedUser || loading}
                    onClick={() => handleTransaction('DEDUCT')}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Minus className="w-4 h-4" />
                    <span>{t('actions.deduct')}</span>
                </button>
            </div>
        </div>
    );
}
