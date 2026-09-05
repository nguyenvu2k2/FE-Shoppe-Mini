"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/services/auth/auth.service";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth-store";
import { useCartStore } from "@/lib/cart-store";
import { disconnectSocket } from "@/lib/socket";

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await logout();
            useAuthStore.getState().clearUser();
            useCartStore.getState().clearLocal();

            disconnectSocket();

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
            className="rounded-sm border border-white/30 bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/20"
        >
            Đăng xuất
        </button>
    );
}
