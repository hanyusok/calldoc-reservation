import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import RegisterForm from "./RegisterForm";

export default async function RegisterPage({ params: { locale } }: { params: { locale: string } }) {
    const session = await getServerSession(authOptions);

    if (session?.user) {
        // @ts-ignore
        if (session.user.role === Role.ADMIN) {
            redirect(`/${locale}/admin`);
        } else {
            redirect(`/${locale}/dashboard`);
        }
    }

    return <RegisterForm />;
}
