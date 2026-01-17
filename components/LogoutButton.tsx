'use client'

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export default function LogoutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
            title="Log out"
        >
            <LogOut className="w-5 h-5 mr-1" />
            <span className="hidden sm:inline">Log Out</span>
        </button>
    )
}
