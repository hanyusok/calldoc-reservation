import { getAdminUsers } from "@/app/actions/admin";
import Link from "next/link";
import { Search } from "lucide-react";
import AddUserButton from "@/components/admin/AddUserButton";
import UserActions from "@/components/admin/UserActions";

export default async function AdminUsersPage({
    searchParams
}: {
    searchParams: { page?: string, search?: string }
}) {
    const page = Number(searchParams.page) || 1;
    const search = searchParams.search || "";
    const { users, total, totalPages } = await getAdminUsers(page, 10, search);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">User Management</h1>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">Total: {total}</div>
                    <AddUserButton />
                </div>
            </div>

            {/* Search Bar */}
            <form className="flex gap-2 max-w-md">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        name="search"
                        defaultValue={search}
                        placeholder="Search by name or email..."
                        className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:border-gray-700"
                    />
                </div>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Search
                </button>
            </form>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Patients</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{user.name || "N/A"}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email || "N/A"}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {/* @ts-ignore - _count is added in query */}
                                    {user._count?.patients || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <UserActions user={user} />
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-2">
                <Link
                    href={`?page=${Math.max(1, page - 1)}&search=${search}`}
                    className={`px-3 py-1 rounded border ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
                >
                    Previous
                </Link>
                <span className="px-3 py-1">Page {page} of {totalPages || 1}</span>
                <Link
                    href={`?page=${Math.min(totalPages, page + 1)}&search=${search}`}
                    className={`px-3 py-1 rounded border ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
                >
                    Next
                </Link>
            </div>
        </div>
    );
}
