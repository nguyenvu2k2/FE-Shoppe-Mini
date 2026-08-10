"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KeyRound, MapPin, Package, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
    { label: "Hồ sơ", href: "/account", icon: UserRound },
    { label: "Đổi mật khẩu", href: "/account/password", icon: KeyRound },
    { label: "Địa chỉ", href: "/account/addresses", icon: MapPin },
    { label: "Đơn hàng", href: "/orders", icon: Package },
];

export default function AccountSidebar() {
    const pathname = usePathname();

    return (
        <nav className="rounded-sm bg-white py-2 shadow-sm ring-1 ring-black/[0.04]">
            <p className="px-4 py-2 text-xs font-medium tracking-wide text-[#999] uppercase">
                Tài khoản
            </p>
            {navItems.map(({ label, href, icon: Icon }) => {
                const active =
                    href === "/account"
                        ? pathname === "/account"
                        : pathname === href || pathname.startsWith(`${href}/`);
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
    );
}
