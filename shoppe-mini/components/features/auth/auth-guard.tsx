"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuthStore } from "@/lib/auth-store";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const isLoading = useAuthStore((state) => state.isLoading);
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        if (isLoading) return;
        if (!user) {
            const login = new URL("/login", window.location.origin);
            login.searchParams.set("callbackUrl", pathname);
            router.replace(`${login.pathname}${login.search}`);
        }
    }, [isLoading, user, pathname, router]);

    if (isLoading || !user) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
                <div className="size-8 animate-spin rounded-full border-2 border-[#ee4d2d]/20 border-t-[#ee4d2d]" />
                <p className="text-sm text-gray-500">Đang tải...</p>
            </div>
        );
    }

    return <>{children}</>;
}
