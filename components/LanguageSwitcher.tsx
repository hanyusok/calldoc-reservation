'use client';

import { useLocale } from 'next-intl';
import Image from 'next/image';
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
            className="p-1 rounded-full transition-transform hover:scale-105"
            aria-label="Switch Language"
        >
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 shadow-sm">
                <Image
                    src={locale === 'en' ? '/images/flags/ko.png' : '/images/flags/en.png'}
                    alt={locale === 'en' ? 'Switch to Korean' : 'Switch to English'}
                    fill
                    className="object-cover"
                />
            </div>
        </button>
    );
}
