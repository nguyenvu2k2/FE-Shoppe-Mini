"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
    ChevronDown,
    LayoutDashboard,
    LogOut,
    Package,
    Search,
    ShoppingCart,
    UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { logout } from "@/services/auth/auth.service";
import { initialsFromName } from "@/lib/format-profile";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import { useCartStore } from "@/lib/cart-store";
import { isAdminRole } from "@/lib/auth.types";

const menuItems = [
    { label: "Tài khoản", href: "/account", icon: UserRound },
    { label: "Đơn hàng", href: "/orders", icon: Package },
];

export default function SiteHeader() {
    const router = useRouter();
    const pathname = usePathname();
    const user = useAuthStore((state) => state.user);
    const isLoading = useAuthStore((state) => state.isLoading);
    const badgeCount = useCartStore((state) => state.badgeCount);
    const showAdmin = isAdminRole(user?.role);
    const [search, setSearch] = useState("");

    const handleLogout = async () => {
        try {
            await logout();
            useAuthStore.getState().clearUser();
            useCartStore.getState().clearLocal();
            toast.success("Đăng xuất thành công");
            router.replace("/login");
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Đăng xuất thất bại");
        }
    };

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        const q = search.trim();
        router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
    };

    return (
        <header className="sticky top-0 z-50 shadow-md shadow-orange-900/10">

            <div className="border-b border-orange-100/20 bg-white/95 backdrop-blur-md">
                <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-4 py-3 sm:gap-6">
                    <Link
                        href="/"
                        className="group flex shrink-0 items-center gap-2"
                    >
                        <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#ee4d2d] to-[#ff8c5a] text-sm font-black italic text-white shadow-md shadow-orange-200">
                            S
                        </span>
                        <span className="hidden text-xl font-bold tracking-tight text-gray-900 sm:block">
                            shop
                            <span className="bg-gradient-to-r from-[#ee4d2d] to-[#ff6b4a] bg-clip-text text-transparent">
                                mini
                            </span>
                        </span>
                    </Link>

                    <form
                        onSubmit={handleSearch}
                        className="relative hidden flex-1 md:block"
                    >
                        <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                            className="w-full rounded-xl border border-gray-200 bg-gray-50/80 py-2.5 pr-4 pl-10 text-sm text-gray-800 outline-none transition focus:border-[#ee4d2d]/40 focus:bg-white focus:ring-2 focus:ring-[#ee4d2d]/15"
                        />
                    </form>

                    <nav className="ml-auto flex items-center gap-2 sm:gap-3">
                        <Link
                            href="/categories"
                            className={cn(
                                "hidden rounded-xl px-3 py-2 text-sm font-medium transition sm:inline-flex",
                                pathname.startsWith("/categories")
                                    ? "bg-[#ee4d2d]/10 text-[#ee4d2d]"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            Danh mục
                        </Link>

                        <Link
                            href="/products"
                            className={cn(
                                "hidden rounded-xl px-3 py-2 text-sm font-medium transition sm:inline-flex",
                                pathname.startsWith("/products")
                                    ? "bg-[#ee4d2d]/10 text-[#ee4d2d]"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            Sản phẩm
                        </Link>

                        <Link
                            href="/cart"
                            className={cn(
                                "relative hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition md:flex",
                                pathname === "/cart"
                                    ? "bg-[#ee4d2d]/10 text-[#ee4d2d]"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            <ShoppingCart className="size-5" />
                            <span className="hidden sm:inline">Giỏ hàng</span>
                            {badgeCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ee4d2d] px-1 text-[10px] font-bold text-white">
                                    {badgeCount > 99 ? "99+" : badgeCount}
                                </span>
                            )}
                        </Link>

                        {!isLoading && !user && (
                            <Link
                                href="/login"
                                className="rounded-xl bg-[#ee4d2d] px-3 py-2 text-sm font-medium text-white transition hover:opacity-90"
                            >
                                Đăng nhập
                            </Link>
                        )}

                        {user && (
                            <div className="group relative">
                                <button
                                    type="button"
                                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-2 py-1.5 shadow-sm transition hover:border-[#ee4d2d]/30 hover:shadow-md sm:px-3"
                                    aria-haspopup="true"
                                >
                                    {user.avatar ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={user.avatar}
                                            alt={user.fullName}
                                            className="size-8 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#ee4d2d] to-[#ff8c5a] text-xs font-semibold uppercase text-white">
                                            {initialsFromName(
                                                user.fullName ?? "?"
                                            )}
                                        </span>
                                    )}

                                    <span className="hidden max-w-[100px] truncate text-sm font-medium text-gray-700 lg:block">
                                        {user.fullName ?? "Khách"}
                                    </span>
                                    <ChevronDown className="size-4 text-gray-400 transition group-hover:text-[#ee4d2d]" />
                                </button>

                                <div className="invisible absolute right-0 top-full z-50 w-56 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                                    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-xl shadow-gray-200/50">
                                        <div className="border-b border-gray-100 px-4 py-3">
                                            <p className="truncate text-sm font-semibold text-gray-900">
                                                {user.fullName ?? "Khách"}
                                            </p>
                                            <p className="truncate text-xs text-gray-500">
                                                {user.email ?? ""}
                                            </p>
                                        </div>

                                        {menuItems.map(
                                            ({ label, href, icon: Icon }) => (
                                                <Link
                                                    key={href}
                                                    href={href}
                                                    className={cn(
                                                        "flex items-center gap-3 px-4 py-2.5 text-sm transition",
                                                        pathname === href
                                                            ? "bg-[#ee4d2d]/5 font-medium text-[#ee4d2d]"
                                                            : "text-gray-600 hover:bg-gray-50 hover:text-[#ee4d2d]"
                                                    )}
                                                >
                                                    <Icon className="size-4" />
                                                    {label}
                                                </Link>
                                            )
                                        )}

                                        {showAdmin && (
                                            <Link
                                                href="/admin"
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-2.5 text-sm transition",
                                                    pathname.startsWith(
                                                        "/admin"
                                                    )
                                                        ? "bg-[#ee4d2d]/5 font-medium text-[#ee4d2d]"
                                                        : "text-gray-600 hover:bg-gray-50 hover:text-[#ee4d2d]"
                                                )}
                                            >
                                                <LayoutDashboard className="size-4" />
                                                Quản trị
                                            </Link>
                                        )}

                                        <div className="my-1 border-t border-gray-100" />
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-600 transition hover:bg-red-50 hover:text-red-600"
                                        >
                                            <LogOut className="size-4" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </nav>
                </div>

                <div className="border-t border-gray-100 px-4 pb-3 md:hidden">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm kiếm sản phẩm..."
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-9 text-sm outline-none focus:border-[#ee4d2d]/40 focus:ring-2 focus:ring-[#ee4d2d]/15"
                        />
                    </form>
                </div>
            </div>
        </header>
    );
}
