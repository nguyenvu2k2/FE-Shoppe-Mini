"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    LayoutGrid,
    Package,
    ShoppingCart,
    UserRound,
} from "lucide-react";

import { useAuthStore } from "@/lib/auth-store";
import { useCartStore } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

const items = [
    { href: "/", label: "Trang chủ", icon: Home, match: (p: string) => p === "/" },
    {
        href: "/categories",
        label: "Danh mục",
        icon: LayoutGrid,
        match: (p: string) => p.startsWith("/categories"),
    },
    {
        href: "/products",
        label: "Sản phẩm",
        icon: Package,
        match: (p: string) => p.startsWith("/products"),
    },
    {
        href: "/cart",
        label: "Giỏ hàng",
        icon: ShoppingCart,
        match: (p: string) => p.startsWith("/cart"),
        badge: true,
    },
    {
        href: "/account",
        label: "Tài khoản",
        icon: UserRound,
        match: (p: string) =>
            p.startsWith("/account") || p.startsWith("/orders"),
    },
];

export default function MobileBottomNav() {
    const pathname = usePathname();
    const badgeCount = useCartStore((s) => s.badgeCount);
    const user = useAuthStore((s) => s.user);

    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-md md:hidden"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            aria-label="Điều hướng chính"
        >
            <ul className="mx-auto flex max-w-[1200px] items-stretch">
                {items.map(({ href, label, icon: Icon, match, badge }) => {
                    const active = match(pathname);
                    const target =
                        href === "/account" && !user
                            ? `/login?callbackUrl=${encodeURIComponent("/account")}`
                            : href === "/cart" && !user
                              ? `/login?callbackUrl=${encodeURIComponent("/cart")}`
                              : href;

                    return (
                        <li key={href} className="flex-1">
                            <Link
                                href={target}
                                className={cn(
                                    "relative flex flex-col items-center gap-0.5 px-1 py-2 text-[10px] transition",
                                    active
                                        ? "font-semibold text-[#ee4d2d]"
                                        : "text-gray-500 hover:text-gray-800"
                                )}
                            >
                                <span className="relative">
                                    <Icon
                                        className={cn(
                                            "size-5 transition",
                                            active && "scale-105"
                                        )}
                                        strokeWidth={active ? 2.25 : 1.75}
                                    />
                                    {badge && badgeCount > 0 && (
                                        <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ee4d2d] px-0.5 text-[9px] font-bold text-white">
                                            {badgeCount > 99
                                                ? "99+"
                                                : badgeCount}
                                        </span>
                                    )}
                                </span>
                                {label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
