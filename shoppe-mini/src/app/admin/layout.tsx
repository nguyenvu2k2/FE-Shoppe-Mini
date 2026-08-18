"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    ClipboardList,
    FolderTree,
    LayoutDashboard,
    LogOut,
    Menu,
    Package,
    X,
} from "lucide-react";
import { toast } from "sonner";

import AdminGuard from "@/components/features/auth/admin-guard";
import PageTransition from "@/components/layout/page-transition";
import { logout } from "@/services/auth/auth.service";
import { useAuthStore } from "@/lib/auth-store";
import { useCartStore } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

const navItems = [
    { label: "Tổng quan", href: "/admin", icon: LayoutDashboard, exact: true },
    { label: "Đơn hàng", href: "/admin/orders", icon: ClipboardList },
    { label: "Danh mục", href: "/admin/categories", icon: FolderTree },
    { label: "Sản phẩm", href: "/admin/products", icon: Package },
];

function AdminSidebar({
    onNavigate,
}: {
    onNavigate?: () => void;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const hasPermission = useAuthStore((state) => state.hasPermission);

    const handleLogout = async () => {
        try {
            await logout();
            useAuthStore.getState().clearUser();
            useCartStore.getState().clearLocal();
            toast.success("Đăng xuất thành công");
            router.replace("/login");
        } catch {
            toast.error("Đăng xuất thất bại");
        }
    };

    const visibleNav = navItems.filter((item) => {
        if (item.href === "/admin/orders") {
            return (
                hasPermission("order:read") ||
                hasPermission("order:update") ||
                hasPermission("payment:read") ||
                hasPermission("payment:update") ||
                String(user?.role).toUpperCase() === "ADMIN"
            );
        }
        if (item.href === "/admin/categories") {
            return (
                hasPermission("category:read") ||
                hasPermission("category:create") ||
                hasPermission("category:update") ||
                String(user?.role).toUpperCase() === "ADMIN"
            );
        }
        if (item.href === "/admin/products") {
            return (
                hasPermission("product:read") ||
                hasPermission("product:create") ||
                hasPermission("product:update") ||
                String(user?.role).toUpperCase() === "ADMIN"
            );
        }
        return true;
    });

    return (
        <div className="flex h-full flex-col">
            <div className="border-b border-gray-100 px-4 py-4">
                <Link
                    href="/admin"
                    onClick={onNavigate}
                    className="flex items-center gap-2"
                >
                    <span className="flex size-8 items-center justify-center rounded-lg bg-[#ee4d2d] text-sm font-black italic text-white">
                        S
                    </span>
                    <div>
                        <p className="text-sm font-bold text-gray-900">
                            Shop Mini
                        </p>
                        <p className="text-[11px] text-gray-500">Admin</p>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 space-y-0.5 p-3">
                {visibleNav.map(({ label, href, icon: Icon, exact }) => {
                    const active = exact
                        ? pathname === href
                        : pathname === href || pathname.startsWith(`${href}/`);
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={onNavigate}
                            className={cn(
                                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition",
                                active
                                    ? "bg-[#fef6f5] font-medium text-[#ee4d2d]"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <Icon className="size-4 shrink-0" />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-gray-100 p-3">
                <p className="truncate px-3 text-xs text-gray-500">
                    {user?.email}
                </p>
                <Link
                    href="/"
                    onClick={onNavigate}
                    className="mt-1 block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                    ← Về cửa hàng
                </Link>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600"
                >
                    <LogOut className="size-4" />
                    Đăng xuất
                </button>
            </div>
        </div>
    );
}

function AdminShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Desktop sidebar */}
            <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">
                <AdminSidebar />
            </aside>

            {/* Mobile drawer */}
            {open && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        aria-label="Đóng menu"
                        className="absolute inset-0 bg-black/40 animate-fade-in"
                        onClick={() => setOpen(false)}
                    />
                    <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl animate-slide-in-left">
                        <div className="flex items-center justify-end border-b border-gray-100 px-3 py-2">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-50"
                            >
                                <X className="size-5" />
                            </button>
                        </div>
                        <AdminSidebar onNavigate={() => setOpen(false)} />
                    </aside>
                </div>
            )}

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="rounded-lg p-2 text-gray-600 hover:bg-gray-50"
                        aria-label="Mở menu"
                    >
                        <Menu className="size-5" />
                    </button>
                    <p className="text-sm font-semibold text-gray-900">
                        Admin · Shop Mini
                    </p>
                </header>

                <main className="flex-1 overflow-auto p-4 sm:p-6">
                    <PageTransition>{children}</PageTransition>
                </main>
            </div>
        </div>
    );
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminGuard>
            <AdminShell>{children}</AdminShell>
        </AdminGuard>
    );
}
