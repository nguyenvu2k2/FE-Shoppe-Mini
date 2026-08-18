import SiteFooter from "@/components/layout/site-footer";
import SiteHeader from "@/components/layout/site-header";
import MobileBottomNav from "@/components/layout/mobile-bottom-nav";
import PageTransition from "@/components/layout/page-transition";

/** Layout public: browse catalog không bắt buộc login */
export default function StorefrontLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <SiteHeader />
            <main className="flex-1 pb-20 md:pb-0">
                <PageTransition>{children}</PageTransition>
            </main>
            <div className="hidden md:block">
                <SiteFooter />
            </div>
            <MobileBottomNav />
        </div>
    );
}
