'use client';

import { signIn, useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function LoginForm() {
    const t = useTranslations("Auth.login");
    const { status } = useSession();
    const router = useRouter();
    const [isEmailLoginVisible, setIsEmailLoginVisible] = useState(false);

    // Still keep this for client-side navigation edge cases, but server checks first
    useEffect(() => {
        if (status === 'authenticated') {
            router.refresh(); // Or specialized redirect if needed, but page.tsx handles it
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        {t("title")}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {t("subtitle")}
                    </p>
                </div>

                <div className="mt-8 space-y-4">
                    <button
                        onClick={() => signIn('google')}
                        className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4" />
                            <path d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z" fill="#34A853" />
                            <path d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.51649C-0.185282 10.0056 -0.185282 14.0004 1.51649 17.3912L5.50253 14.3003Z" fill="#FBBC05" />
                            <path d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50261 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z" fill="#EA4335" />
                        </svg>
                        {t("google")}
                    </button>

                    <button
                        onClick={() => signIn('kakao')}
                        className="flex w-full items-center justify-center rounded-lg bg-[#FEE500] px-4 py-3 text-sm font-medium text-[#000000] shadow-sm hover:bg-[#FDD835] focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
                    >
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 3C5.925 3 1 6.925 1 11.775c0 3.325 2.275 6.225 5.675 7.725-.225.825-.825 3.025-.95 3.525-.15.55.2.55.425.4l2.5-1.675c.325-.225 3.325-2.25 3.325-2.25.975.15 2 .225 3.025.225 6.075 0 11-3.925 11-8.775S18.075 3 12 3z" />
                        </svg>
                        {t("kakao")}
                    </button>

                    <button
                        onClick={() => signIn('naver')}
                        className="flex w-full items-center justify-center rounded-lg bg-[#03C75A] px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-[#02b351] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
                        </svg>
                        {t("naver")}
                    </button>

                    {!isEmailLoginVisible ? (
                        <button
                            onClick={() => setIsEmailLoginVisible(true)}
                            className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <span className="mr-2">✉️</span>
                            {t("continueWithEmail")}
                        </button>
                    ) : (
                        <div className="animate-in slide-in-from-top-4 fade-in duration-300">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-gray-50 px-2 text-gray-500">{t("orContinue")}</span>
                                </div>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
                                    const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
                                    signIn('credentials', {
                                        email,
                                        password,
                                        callbackUrl: `/${window.location.pathname.split('/')[1]}/dashboard`
                                    });
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <label htmlFor="email" className="sr-only">{t("emailLabel")}</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 pl-2"
                                        placeholder={t("emailLabel")}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password" className="sr-only">{t("passwordLabel")}</label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 pl-2"
                                        placeholder={t("passwordLabel")}
                                    />
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                    >
                                        {t("signInBtn")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                <div className="text-center text-xs text-gray-500 mt-8">
                    {t("agreement")}
                </div>

                <div className="text-center text-sm text-gray-600">
                    {t("noAccount")}{' '}
                    <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
                        {t("signUpLink")}
                    </Link>
                </div>
            </div>
        </div>
    );
}
