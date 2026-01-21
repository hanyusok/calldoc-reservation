import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Video, Calendar, ShieldCheck } from "lucide-react";
import { useTranslations } from 'next-intl';
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Home() {
  const t = useTranslations('Index');

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Video className="w-6 h-6 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-bold text-gray-900">CallDoc</span>
        </div>
        <div className="space-x-2 sm:space-x-4 flex items-center">
          <Link href="/auth/login" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 font-medium whitespace-nowrap">{t('nav.login')}</Link>
          <Link href="/dashboard" className="text-sm sm:text-base bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 transition whitespace-nowrap">{t('nav.myPage')}</Link>
          <LanguageSwitcher />
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:py-16 sm:px-6 lg:px-8 text-center sm:text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {t('hero.headlinePrefix')} <br />
              <span className="text-blue-600">{t('hero.headlineSuffix')}</span>
            </h1>
            <p className="text-lg text-gray-600">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/book" className="flex items-center justify-center bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                {t('hero.bookBtn')} <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>

            <div className="pt-8 flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1 text-green-500" /> {t('hero.verifiedDoctor')}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-blue-500" /> {t('hero.easyScheduling')}
              </div>
            </div>
          </div>

          {/* Hero Image / Illustration */}
          <div className="relative h-64 sm:h-96 w-full bg-blue-50 rounded-3xl overflow-hidden flex items-center justify-center">
            <Image
              src="/images/landing/doctor_video.png"
              alt="Professional doctor conducting a video consultation"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 mt-12 py-8 text-center text-sm text-gray-400">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
          <p>&copy; {new Date().getFullYear()} CallDoc Telemedicine. {t('footer.copyright')}</p>
          <div className="hidden sm:block w-px h-3 bg-gray-300"></div>
          <Link href="/policy" className="hover:text-gray-600 underline">
            {t('footer.refundPolicy')}
          </Link>
        </div>
      </footer>
    </div>
  );
}
