"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "../../(store)/auth/auth..store";
import { getProfile } from "@/services/auth/auth.service";

const PUBLIC_AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { setUser, setLoading } = useAuthStore();

    useEffect(() => {
        const isPublicAuthPage = PUBLIC_AUTH_PATHS.some((path) =>
            pathname.startsWith(path)
        );

        if (isPublicAuthPage) {
            setLoading(false);
            return;
        }

        const init = async () => {
            setLoading(true);
            try {
                const { data } = await getProfile();
                setUser(data);
            } catch {
                // Không đăng nhập hoặc refresh thất bại — axios interceptor xử lý redirect
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [pathname, setUser, setLoading]);

    return <>{children}</>;
}
