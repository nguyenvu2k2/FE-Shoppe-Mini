import type { User } from "@/lib/auth-store";

export type UserRole = "ADMIN" | "CUSTOMER";

export interface Permission {
    name: string;
    description?: string;
}

export interface AuthPermissionsResponse {
    role: UserRole | string;
    permissions: Permission[];
}

export interface SignInRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
}

function isUser(data: unknown): data is User {
    return (
        typeof data === "object" &&
        data !== null &&
        "id" in data &&
        "email" in data &&
        "fullName" in data &&
        "role" in data
    );
}

export function parseUserResponse(data: unknown): User | null {
    if (typeof data !== "object" || data === null) {
        return null;
    }

    if ("user" in data) {
        return parseUserResponse((data as { user: unknown }).user);
    }

    return isUser(data) ? data : null;
}

export function isAdminRole(role?: string | null) {
    return String(role ?? "").toUpperCase() === "ADMIN";
}

/** Chỉ cho phép relative path nội bộ — tránh open redirect */
export function sanitizeCallbackUrl(callbackUrl?: string | null): string | null {
    if (!callbackUrl) return null;
    if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) return null;
    if (callbackUrl.startsWith("/login") || callbackUrl.startsWith("/register")) {
        return null;
    }
    return callbackUrl;
}

/**
 * Sau login: ADMIN → /admin (trừ khi callbackUrl là /admin/*)
 * CUSTOMER → callbackUrl hợp lệ hoặc trang chủ /
 */
export function getPostLoginRedirect(
    user: User,
    callbackUrl?: string | null
): string {
    const safeCallback = sanitizeCallbackUrl(callbackUrl);

    if (isAdminRole(user.role)) {
        if (safeCallback?.startsWith("/admin")) return safeCallback;
        return "/admin";
    }

    if (safeCallback?.startsWith("/admin")) return "/";
    return safeCallback ?? "/";
}
