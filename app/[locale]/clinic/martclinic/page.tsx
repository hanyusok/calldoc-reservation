import { useTranslations } from 'next-intl';

export default function MartClinicPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Mart Clinic (마트의원)</h1>
                <p className="text-xl text-gray-600">Trusted Family Healthcare at Your Convenience</p>
            </header>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-600">About Us</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Located conveniently on the 2nd floor of Lotte Mart in Anseong, Mart Clinic has been serving the community since 2011. Under the leadership of <strong>Dr. Yuseok Han</strong>, a specialist in Pediatrics, we provide comprehensive care for the whole family.
                    </p>
                    <div className="flex items-center text-gray-700">
                        <span className="font-semibold mr-2">Established:</span> May 9, 2011
                    </div>
                </section>

                <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-600">Medical Departments</h2>
                    <ul className="grid grid-cols-2 gap-2 text-gray-700">
                        <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>Internal Medicine</li>
                        <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>Pediatrics</li>
                        <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>ENT (Ear, Nose, Throat)</li>
                        <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>Dermatology</li>
                        <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>Orthopedics (Pain Clinic)</li>
                        <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>Obesity Clinic</li>
                    </ul>
                </section>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-blue-50 p-6 rounded-xl">
                    <h3 className="font-bold text-lg mb-2 text-blue-800">Specialized Care</h3>
                    <p className="text-sm text-blue-700">
                        From Vitamin IV therapy to growth development clinics, we offer specialized treatments tailored to your needs.
                    </p>
                </div>
                <div className="bg-blue-50 p-6 rounded-xl">
                    <h3 className="font-bold text-lg mb-2 text-blue-800">Diagnostics</h3>
                    <p className="text-sm text-blue-700">
                        Equipped for Pediatric Abdominal Ultrasound, Musculoskeletal Ultrasound, and rapid diagnostic testing.
                    </p>
                </div>
                <div className="bg-blue-50 p-6 rounded-xl">
                    <h3 className="font-bold text-lg mb-2 text-blue-800">Vaccinations</h3>
                    <p className="text-sm text-blue-700">
                        Comprehensive immunization programs for infants, children, and adults.
                    </p>
                </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
                <h2 className="text-2xl font-semibold mb-6 text-center text-gray-900">Visit Us</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Location</h3>
                        <p className="text-gray-600 mb-4">
                            4478, Seodong-daero, Gongdo-eup, Anseong-si, Gyeonggi-do<br />
                            (Lotte Mart Anseong Branch, 2nd Floor)
                        </p>
                        <h3 className="font-semibold text-lg mb-2">Contact</h3>
                        <p className="text-gray-600">
                            031-657-8279
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Clinic Hours</h3>
                        <p className="text-gray-600 mb-2">
                            We are open for your convenience, including weekends.
                        </p>
                        <ul className="space-y-1 text-sm text-gray-600">
                            <li className="flex justify-between border-b border-gray-200 py-1"><span>Mon - Fri</span> <span>Check with clinic</span></li>
                            <li className="flex justify-between border-b border-gray-200 py-1"><span>Saturday</span> <span>Open</span></li>
                            <li className="flex justify-between border-b border-gray-200 py-1"><span>Sunday</span> <span>Open</span></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
