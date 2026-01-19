'use client';

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton({ label }: { label: string }) {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="w-full flex items-center space-x-3 px-4 py-2 mt-2 text-red-500 hover:bg-red-50 rounded-lg text-left"
        >
            <LogOut className="w-5 h-5" />
            <span>{label}</span>
        </button>
    );
}
