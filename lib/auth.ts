import { NextAuthOptions } from "next-auth"
import bcrypt from "bcryptjs"
import GoogleProvider from "next-auth/providers/google"
import KakaoProvider from "next-auth/providers/kakao"
import NaverProvider from "next-auth/providers/naver"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            allowDangerousEmailAccountLinking: true,
        }),
        KakaoProvider({
            clientId: process.env.KAKAO_CLIENT_ID || "",
            clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
            allowDangerousEmailAccountLinking: true,
        }),
        NaverProvider({
            clientId: process.env.NAVER_CLIENT_ID || "",
            clientSecret: process.env.NAVER_CLIENT_SECRET || "",
            allowDangerousEmailAccountLinking: true,
        }),
        CredentialsProvider({
            name: "Email/Password",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                console.log("Authorize called with:", { email: credentials?.email });

                if (!credentials?.email || !credentials?.password) {
                    console.log("Missing credentials");
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                console.log("User found:", user ? { id: user.id, email: user.email, hasPassword: !!user.password } : "No user");

                if (user && user.password) {
                    const isValid = await bcrypt.compare(credentials.password, user.password);
                    console.log("Password valid:", isValid);
                    if (isValid) {
                        return user;
                    }
                } else {
                    console.log("User has no password or not found");
                }

                return null;
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: '/auth/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                // @ts-ignore
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id as string;
                // @ts-ignore
                session.user.role = token.role as string;
            }
            return session;
        },
    },
}
