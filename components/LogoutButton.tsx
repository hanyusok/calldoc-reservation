'use client'

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"
import { useTranslations } from "next-intl"

export default function LogoutButton() {
    const t = useTranslations('Index.nav')

    return (
        <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
            title={t('logout')}
        >
            <LogOut className="w-5 h-5 mr-1" />
            <span className="hidden sm:inline">{t('logout')}</span>
        </button>
    )
}
