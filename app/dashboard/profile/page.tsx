import { getPatients, addPatient, deletePatient } from "@/app/actions/patient"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Plus, Trash2, User as UserIcon } from "lucide-react"

export default async function ProfilePage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/auth/login')

    const patients = await getPatients()

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center">
                    {/* Back button could go here */}
                    <h1 className="text-xl font-bold text-gray-900">Manage Patients</h1>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6 space-y-8">

                {/* Patient List */}
                <section>
                    <h2 className="text-lg font-medium text-gray-900 mb-3">Family Members</h2>
                    <div className="space-y-3">
                        {patients.map((patient) => (
                            <div key={patient.id} className="bg-white shadow rounded-lg p-4 flex justify-between items-center">
                                <div className="flex items-center">
                                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                                        <UserIcon className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{patient.name} {patient.relationship === 'SELF' && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full ml-1">Me</span>}</div>
                                        <div className="text-sm text-gray-500">{new Date(patient.dateOfBirth).toLocaleDateString()} • {patient.gender}</div>
                                    </div>
                                </div>
                                {patient.relationship !== 'SELF' && (
                                    <form action={async () => {
                                        'use server';
                                        await deletePatient(patient.id);
                                    }}>
                                        <button type="submit" className="text-red-500 hover:text-red-700 p-2">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </form>
                                )}
                            </div>
                        ))}

                        {patients.length === 0 && (
                            <div className="text-center text-gray-500 py-4">No patients added yet.</div>
                        )}
                    </div>
                </section>

                {/* Add New Patient Form */}
                <section className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Plus className="h-5 w-5 mr-2" /> Add New Patient
                    </h2>

                    {/* @ts-ignore */}
                    <form action={addPatient} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" name="name" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Resident Number (Example: 800101-1234567)</label>
                            <input type="text" name="residentNumber" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" placeholder="YYMMDD-XXXXXXX" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                <input type="date" name="dateOfBirth" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gender</label>
                                <select name="gender" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border">
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Relationship</label>
                            <select name="relationship" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border">
                                <option value="FAMILY">Family Member</option>
                                <option value="SELF">Myself</option>
                            </select>
                        </div>

                        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Save
                        </button>
                    </form>
                </section>

            </main>
        </div>
    )
}
