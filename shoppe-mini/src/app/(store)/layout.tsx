import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AuthGuard from "@/components/features/auth/auth-guard";
import SiteFooter from "@/components/layout/site-footer";
import SiteHeader from "@/components/layout/site-header";

export default async function StoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const hasSession =
        cookieStore.has("accessToken") || cookieStore.has("refreshToken");

    if (!hasSession) {
        redirect("/login");
    }

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <SiteHeader />
            <main className="flex-1">
                <AuthGuard>{children}</AuthGuard>
            </main>
            <SiteFooter />
        </div>
    );
}
