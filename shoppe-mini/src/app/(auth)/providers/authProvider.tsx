"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { useAuthStore } from "@/lib/auth-store";
import { useCartStore } from "@/lib/cart-store";
import { hydrateAuthSession } from "@/lib/auth-session";
import { connectSocket, disconnectSocket } from "@/lib/socket";

const PUBLIC_AUTH_PATHS = [
    "/login",
    "/signin",
    "/register",
    "/forgot-password",
    "/reset-password",
];

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const setLoading = useAuthStore((state) => state.setLoading);
    /** true = đã thử hydrate xong (kể cả guest) */
    const hydratedRef = useRef(false);

    useEffect(() => {
        const isPublicAuthPage = PUBLIC_AUTH_PATHS.some((path) =>
            pathname.startsWith(path)
        );

        // Trang auth: không block UI; LoginForm tự kiểm tra session nếu cần
        if (isPublicAuthPage) {
            setLoading(false);
            return;
        }

        if (hydratedRef.current) {
            setLoading(false);
            return;
        }

        let cancelled = false;

        const init = async () => {
            setLoading(true);
            try {
                const user = await hydrateAuthSession();
                if (!cancelled) {
                    hydratedRef.current = true;
                }
                if (user) {
                    connectSocket();
                } else {
                    disconnectSocket();
                }
            } catch {
                if (!cancelled) {
                    useAuthStore.getState().clearUser();
                    useCartStore.getState().clearLocal();
                    hydratedRef.current = true;
                }
                disconnectSocket();
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void init();

        return () => {
            cancelled = true;
        };
    }, [pathname, setLoading]);

    return <>{children}</>;
}
