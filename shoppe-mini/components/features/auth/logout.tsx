"use client";

import { useRouter } from "next/navigation";
import { clearTokens } from "@/lib/auth";
import { logout } from "@/services/auth/auth.service";
import { toast } from "sonner";
import { useAuthStore } from "@/src/app/(store)/auth/auth..store";

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await logout();

            clearTokens();

            useAuthStore.getState().clearUser();

            toast.success("Đăng xuất thành công");

            router.replace("/login");

        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Đăng xuất thất bại");

        }
    };

    return (
        <button
            type="button"
            onClick={handleLogout}
            className="rounded-sm bg-[#ee4d2d] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
            Đăng xuất
        </button>
    );
}
