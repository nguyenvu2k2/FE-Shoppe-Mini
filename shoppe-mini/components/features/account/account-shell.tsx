import Link from "next/link";
import { ChevronRight } from "lucide-react";

import AccountSidebar from "./account-sidebar";

interface AccountShellProps {
    children: React.ReactNode;
}

export default function AccountShell({ children }: AccountShellProps) {
    return (
        <div className="relative overflow-hidden">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 right-0 size-64 rounded-full bg-[#ee4d2d]/[0.04] blur-3xl"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 left-1/4 size-48 rounded-full bg-orange-200/20 blur-3xl"
            />

            <div className="relative mx-auto max-w-[1100px] px-4 py-6">
                <nav
                    aria-label="Breadcrumb"
                    className="mb-4 flex items-center gap-1.5 text-sm text-[#999]"
                >
                    <Link href="/shop" className="transition hover:text-[#ee4d2d]">
                        Trang chủ
                    </Link>
                    <ChevronRight className="size-3.5" />
                    <span className="text-[#555]">Tài khoản</span>
                </nav>

                <div className="flex flex-col gap-5 md:flex-row md:items-start">
                    <aside className="w-full shrink-0 md:w-[220px]">
                        <AccountSidebar />
                    </aside>
                    <div className="min-w-0 flex-1">{children}</div>
                </div>
            </div>
        </div>
    );
}
