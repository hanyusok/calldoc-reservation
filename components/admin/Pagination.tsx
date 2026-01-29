import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Pagination({ page, totalPages, basePath = "" }: { page: number, totalPages: number, basePath?: string }) {
    const t = useTranslations('Common');

    // Resolve clean path (preserve other params if needed, but simple for now)
    // Actually, simple link replacement is redundant if we don't have existing query params logic nicely wrapped.
    // Assuming this component is used inside a page that parses ?page=...

    return (
        <div className="flex justify-center gap-2 mt-4">
            <Link
                href={`?page=${Math.max(1, page - 1)}`}
                className={`px-3 py-1 rounded border ${page <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'}`}
            >
                {t('previous')}
            </Link>
            <span className="px-3 py-1 text-sm flex items-center">{t('page', { current: page, total: totalPages || 1 })}</span>
            <Link
                href={`?page=${Math.min(totalPages, page + 1)}`}
                className={`px-3 py-1 rounded border ${page >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'}`}
            >
                {t('next')}
            </Link>
        </div>
    );
}
