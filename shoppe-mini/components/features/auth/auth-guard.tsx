"use client";

import { useAuthStore } from "@/lib/auth-store";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const isLoading = useAuthStore((state) => state.isLoading);

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
                <div className="size-8 animate-spin rounded-full border-2 border-[#ee4d2d]/20 border-t-[#ee4d2d]" />
                <p className="text-sm text-gray-500">Đang tải...</p>
            </div>
        );
    }

    return <>{children}</>;
}
