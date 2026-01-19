'use client';

import { useState } from "react";
import { createAdminUser, updateAdminUser } from "@/app/actions/admin";
import { Role } from "@prisma/client";

interface UserFormProps {
    initialData?: {
        id: string;
        name: string | null;
        email: string | null;
        role: Role;
    };
    onSuccess: () => void;
}

export default function UserForm({ initialData, onSuccess }: UserFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const role = formData.get("role") as Role;
        const password = formData.get("password") as string;

        try {
            if (initialData) {
                const res = await updateAdminUser(initialData.id, { name, email, role });
                if (res.error) throw new Error(res.error);
            } else {
                const res = await createAdminUser({ name, email, role, password });
                if (res.error) throw new Error(res.error);
            }
            onSuccess();
        } catch (err: any) {
            setError(err.message || "Failed to save user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                    name="name"
                    defaultValue={initialData?.name || ""}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    placeholder="Full Name"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                    name="email"
                    type="email"
                    required
                    defaultValue={initialData?.email || ""}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    placeholder="email@example.com"
                />
            </div>

            {!initialData && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                    <input
                        name="password"
                        type="password"
                        // required // Optional for now as we might just create user for social login linking? Let's make it optional or required based on need.
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        placeholder="Initial Password"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave blank if user will login via Social Auth only.</p>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                <select
                    name="role"
                    defaultValue={initialData?.role || Role.PATIENT}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                >
                    {Object.values(Role).map((r) => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Saving..." : (initialData ? "Update User" : "Create User")}
                </button>
            </div>
        </form>
    );
}
