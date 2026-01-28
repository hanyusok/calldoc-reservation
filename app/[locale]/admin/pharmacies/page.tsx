import { getPharmacies } from "@/app/actions/pharmacy";
import PharmacyList from "@/components/admin/PharmacyList";
import { getTranslations } from "next-intl/server";

export default async function PharmaciesPage() {
    const t = await getTranslations("Admin.pharmacies");
    const pharmacies = await getPharmacies();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-gray-500">{t('description')}</p>

            <PharmacyList pharmacies={pharmacies} />
        </div>
    );
}
