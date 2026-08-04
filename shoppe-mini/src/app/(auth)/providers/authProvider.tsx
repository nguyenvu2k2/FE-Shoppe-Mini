"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { useAuthStore } from "../../(store)/auth/auth..store";
import { getProfile } from "@/services/auth/auth.service";
import { useRouter } from "next/navigation";



export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { setUser, setLoading } = useAuthStore();
    const router = useRouter();
    useEffect(() => {
        const init = async () => {
            try {
                const token = Cookies.get("access_token");

                if (!token) return;

                const { data } = await getProfile();
                setUser(data);
                router.replace("/shop");
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [setUser, setLoading]);

    return <>{children}</>;
}