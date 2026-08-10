"use client";

import { useAuthStore } from "@/src/app/(store)/auth/auth..store";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const isLoading = useAuthStore((state) => state.isLoading);

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <p className="text-sm text-gray-500">Đang tải...</p>
            </div>
        );
    }

    return <>{children}</>;
}
