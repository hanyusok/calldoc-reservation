import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import LoginForm from "./LoginForm";

export default async function LoginPage({ params: { locale } }: { params: { locale: string } }) {
    const session = await getServerSession(authOptions);

    if (session?.user) {
        // @ts-ignore
        if (session.user.role === Role.ADMIN) {
            redirect(`/${locale}/admin`); // Redirect to localized admin
        } else {
            redirect(`/${locale}/dashboard`); // Redirect to localized dashboard
        }
    }

    return <LoginForm />;
}
