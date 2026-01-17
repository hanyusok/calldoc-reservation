import Link from "next/link";
import { ArrowRight, Video, Calendar, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Video className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">CallDoc</span>
        </div>
        <div className="space-x-4">
          <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 font-medium">Log In</Link>
          <Link href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">My Page</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center sm:text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Your Doctor,<br />
              <span className="text-blue-600">Available Anytime.</span>
            </h1>
            <p className="text-lg text-gray-600">
              Book a video consultation with trusted family physicians.
              Manage appointments for yourself and your loved ones from one clean dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/book" className="flex items-center justify-center bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Book Appointment <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>

            <div className="pt-8 flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1 text-green-500" /> Verified Doctor
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-blue-500" /> Easy Scheduling
              </div>
            </div>
          </div>

          {/* Hero Image / Illustration */}
          <div className="relative h-64 sm:h-96 w-full bg-blue-50 rounded-3xl overflow-hidden flex items-center justify-center">
            {/* Placeholder logic or use an image if available */}
            <div className="text-blue-200">
              <Video className="w-32 h-32 opacity-20" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 mt-12 py-8 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} CallDoc Telemedicine. All rights reserved.
      </footer>
    </div>
  );
}
