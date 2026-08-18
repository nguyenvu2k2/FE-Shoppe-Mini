import { create } from "zustand";

import type { Permission, UserRole } from "@/lib/auth.types";

export interface User {
    id: number;
    email: string;
    fullName: string;
    phone?: string | null;
    avatar?: string | null;
    role: UserRole | string;
}

interface AuthState {
    user: User | null;
    permissions: Permission[];
    isLoading: boolean;

    setUser: (user: User) => void;
    setPermissions: (permissions: Permission[]) => void;
    clearUser: () => void;
    setLoading: (loading: boolean) => void;
    hasPermission: (name: string) => boolean;
    hasPermissionPrefix: (prefix: string) => boolean;
    isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    permissions: [],
    isLoading: true,

    setUser: (user) => set({ user }),

    setPermissions: (permissions) => set({ permissions }),

    clearUser: () =>
        set({
            user: null,
            permissions: [],
        }),

    setLoading: (loading) => set({ isLoading: loading }),

    hasPermission: (name) =>
        get().permissions.some((permission) => permission.name === name),

    hasPermissionPrefix: (prefix) =>
        get().permissions.some((permission) =>
            permission.name.startsWith(prefix)
        ),

    isAdmin: () => {
        const { user, permissions } = get();
        if (!user) return false;
        if (String(user.role).toUpperCase() === "ADMIN") return true;
        return permissions.some(
            (permission) =>
                permission.name.startsWith("category:") ||
                permission.name.startsWith("product:") ||
                permission.name.startsWith("order:") ||
                permission.name.startsWith("payment:") ||
                permission.name === "user:read"
        );
    },
}));
