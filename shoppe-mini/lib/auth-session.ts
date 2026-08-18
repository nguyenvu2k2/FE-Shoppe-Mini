import { useAuthStore, type User } from "@/lib/auth-store";
import { useCartStore } from "@/lib/cart-store";
import { getPermissions, logout } from "@/services/auth/auth.service";
import { getUserProfile } from "@/services/user/user.service";

function toStoreUser(profile: {
    id: number;
    email: string;
    fullName: string;
    phone?: string | null;
    avatar?: string | null;
    role: string;
}): User {
    return {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        phone: profile.phone,
        avatar: profile.avatar,
        role: profile.role,
    };
}

/**
 * Hydrate session sau login / khi vào app:
 * 1) GET /users/me
 * 2) GET /auth/permissions
 */
export async function hydrateAuthSession(): Promise<User | null> {
    const store = useAuthStore.getState();

    let user: User | null = null;

    try {
        const { data } = await getUserProfile();
        user = toStoreUser(data);
    } catch {
        store.clearUser();
        useCartStore.getState().clearLocal();
        // Xóa cookie hết hạn — tránh lệch UI (hiện Đăng nhập) vs middleware
        try {
            await logout();
        } catch {
            // Guest / cookie đã mất — bỏ qua
        }
        return null;
    }

    store.setUser(user);

    try {
        const { data } = await getPermissions();
        store.setPermissions(data.permissions ?? []);
        if (data.role && data.role !== user.role) {
            store.setUser({ ...user, role: data.role });
            user = { ...user, role: data.role };
        }
    } catch {
        store.setPermissions([]);
    }

    // Badge giỏ hàng — không block session nếu fail
    void useCartStore.getState().fetchCart();

    return user;
}

/** Sau signin/google: set user từ response rồi nạp permissions */
export async function establishSession(user: User): Promise<User> {
    const store = useAuthStore.getState();
    store.setUser(user);

    try {
        const hydrated = await hydrateAuthSession();
        return hydrated ?? user;
    } catch {
        return user;
    }
}
