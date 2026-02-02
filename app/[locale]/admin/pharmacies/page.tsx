import { getPharmacies } from "@/app/actions/pharmacy";
import PharmacyList from "@/components/admin/PharmacyList";
import { getTranslations } from "next-intl/server";

export default async function PharmaciesPage({
    searchParams
}: {
    searchParams: Promise<{ page?: string, q?: string }>
}) {
    const t = await getTranslations("Admin.pharmacies");
    const awaitedSearchParams = await searchParams;
    const page = Number(awaitedSearchParams.page) || 1;
    const query = awaitedSearchParams.q || "";

    const { pharmacies, totalPages } = await getPharmacies(page, 10, query);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-gray-500">{t('description')}</p>

            <PharmacyList
                initialPharmacies={pharmacies}
                totalPages={totalPages}
                currentPage={page}
                initialQuery={query}
            />
        </div>
    );
}
