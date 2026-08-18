"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/lib/auth-store";
import { isAdminRole } from "@/lib/auth.types";
import { adminCheck } from "@/services/auth/auth.service";
import { notify } from "@/lib/toast";

export default function AdminGuard({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const isLoading = useAuthStore((state) => state.isLoading);
    const user = useAuthStore((state) => state.user);
    const storeIsAdmin = useAuthStore((state) => state.isAdmin);
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            router.replace("/login?callbackUrl=/admin");
            return;
        }

        const locallyAdmin = storeIsAdmin() || isAdminRole(user.role);
        if (!locallyAdmin) {
            notify.error("Bạn không có quyền truy cập trang quản trị.");
            router.replace("/");
            return;
        }

        let cancelled = false;

        const verify = async () => {
            try {
                await adminCheck();
                if (!cancelled) setAllowed(true);
            } catch {
                if (!cancelled) {
                    if (storeIsAdmin()) {
                        setAllowed(true);
                    } else {
                        notify.error(
                            "Bạn không có quyền truy cập trang quản trị."
                        );
                        router.replace("/");
                    }
                }
            }
        };

        void verify();

        return () => {
            cancelled = true;
        };
    }, [isLoading, user, storeIsAdmin, router]);

    if (isLoading || !allowed) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <p className="text-sm text-gray-500">Đang kiểm tra quyền admin...</p>
            </div>
        );
    }

    return <>{children}</>;
}
