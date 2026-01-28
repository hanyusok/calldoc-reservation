import { getPharmacies } from "@/app/actions/pharmacy";
import PharmacyList from "@/components/admin/PharmacyList";
import { useTranslations } from "next-intl";

export default async function PharmaciesPage() {
    const pharmacies = await getPharmacies();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Pharmacy Management</h1>
            <p className="text-gray-500">Manage the list of pharmacies available for prescriptions.</p>

            <PharmacyList pharmacies={pharmacies} />
        </div>
    );
}
