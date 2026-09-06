import AuthGuard from "@/components/features/auth/auth-guard";
import SiteFooter from "@/components/layout/site-footer";
import SiteHeader from "@/components/layout/site-header";
import MobileBottomNav from "@/components/layout/mobile-bottom-nav";
import PageTransition from "@/components/layout/page-transition";

export default function StoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <SiteHeader />
            <main className="flex-1 pb-20 md:pb-0">
                <AuthGuard>
                    <PageTransition>{children}</PageTransition>
                </AuthGuard>
            </main>
            <div className="hidden md:block">
                <SiteFooter />
            </div>
            <MobileBottomNav />
        </div>
    );
}
