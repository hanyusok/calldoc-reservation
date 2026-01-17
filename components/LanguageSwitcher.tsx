'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/lib/navigation';
import { locales } from '@/lib/config';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const toggleLocale = () => {
        const nextLocale = locale === 'en' ? 'ko' : 'en';
        router.replace(pathname, { locale: nextLocale });
    };

    return (
        <button
            onClick={toggleLocale}
            className="px-3 py-1 rounded-md text-sm font-bold transition-colors hover:bg-gray-100 text-gray-700"
            aria-label="Switch Language"
        >
            {locale === 'ko' ? 'EN' : 'KR'}
        </button>
    );
}
