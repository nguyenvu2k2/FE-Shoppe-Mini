"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KeyRound, MapPin, Package, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
    { label: "Hồ sơ", href: "/account", icon: UserRound, match: (p: string) => p === "/account" },
    {
        label: "Bảo mật",
        href: "/account/security",
        icon: KeyRound,
        match: (p: string) =>
            p.startsWith("/account/security") || p.startsWith("/account/password"),
    },
    {
        label: "Địa chỉ",
        href: "/account/addresses",
        icon: MapPin,
        match: (p: string) => p.startsWith("/account/addresses"),
    },
    {
        label: "Đơn hàng",
        href: "/orders",
        icon: Package,
        match: (p: string) => p.startsWith("/orders"),
    },
];

export default function AccountSidebar() {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile: horizontal tabs */}
            <nav className="mb-1 flex gap-1 overflow-x-auto rounded-sm bg-white p-1.5 shadow-sm ring-1 ring-black/[0.04] md:hidden">
                {navItems.map(({ label, href, icon: Icon, match }) => {
                    const active = match(pathname);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex shrink-0 items-center gap-1.5 rounded-sm px-3 py-2 text-sm transition",
                                active
                                    ? "bg-[#fef6f5] font-medium text-[#ee4d2d]"
                                    : "text-[#555] hover:bg-gray-50"
                            )}
                        >
                            <Icon className="size-4" />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* Desktop sidebar */}
            <nav className="hidden rounded-sm bg-white py-2 shadow-sm ring-1 ring-black/[0.04] md:block">
                <p className="px-4 py-2 text-xs font-medium tracking-wide text-[#999] uppercase">
                    Tài khoản
                </p>
                {navItems.map(({ label, href, icon: Icon, match }) => {
                    const active = match(pathname);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "relative flex items-center gap-3 px-4 py-3 text-sm transition",
                                active
                                    ? "bg-[#fef6f5] font-medium text-[#ee4d2d]"
                                    : "text-[#555] hover:bg-gray-50 hover:text-[#333]"
                            )}
                        >
                            {active && (
                                <span className="absolute top-1/2 left-0 h-6 w-[3px] -translate-y-1/2 rounded-r bg-[#ee4d2d]" />
                            )}
                            <Icon className="size-4 shrink-0" />
                            {label}
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
