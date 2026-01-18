'use client';

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'authenticated') {
            router.push('/dashboard');
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
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to book your consultation
                    </p>
                </div>

                <div className="mt-8 space-y-4">
                    <button
                        onClick={() => signIn('google')}
                        className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google"
                            className="mr-3 h-5 w-5"
                        />
                        Sign in with Google
                    </button>

                    <button
                        onClick={() => signIn('kakao')}
                        className="flex w-full items-center justify-center rounded-lg bg-[#FEE500] px-4 py-3 text-sm font-medium text-[#000000] shadow-sm hover:bg-[#FDD835] focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
                    >
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 3C5.925 3 1 6.925 1 11.775c0 3.325 2.275 6.225 5.675 7.725-.225.825-.825 3.025-.95 3.525-.15.55.2.55.425.4l2.5-1.675c.325-.225 3.325-2.25 3.325-2.25.975.15 2 .225 3.025.225 6.075 0 11-3.925 11-8.775S18.075 3 12 3z" />
                        </svg>
                        Sign in with Kakao
                    </button>

                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-gray-50 px-2 text-gray-500">Or use email (Testing)</span>
                        </div>
                    </div>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
                        const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
                        signIn('credentials', { email, password });
                    }} className="space-y-4">
                        <div>
                            <input
                                name="email"
                                type="email"
                                placeholder="Email (admin@calldoc.com or patient@test.com)"
                                required
                                className="block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <input
                                name="password"
                                type="password"
                                placeholder="Password (any)"
                                required
                                className="block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Sign in with Credentials
                        </button>
                    </form>
                </div>

                <div className="text-center text-xs text-gray-500 mt-8">
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                </div>
            </div>
        </div>
    );
}
