"use client";

import { useAuthStore } from "@/lib/auth-store";

/** ADMIN role bypass; không thì check permission name */
export function useCan(permission: string) {
    const user = useAuthStore((s) => s.user);
    const hasPermission = useAuthStore((s) => s.hasPermission);
    if (String(user?.role).toUpperCase() === "ADMIN") return true;
    return hasPermission(permission);
}
