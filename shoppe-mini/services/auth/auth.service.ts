import { api } from "@/lib/axios";
import type { User } from "@/lib/auth-store";
import type {
    AuthPermissionsResponse,
    RegisterRequest,
    SignInRequest,
} from "@/lib/auth.types";

export const login = async (formData: SignInRequest) => {
    return api.post<{ user: User }>("auth/signin", formData);
};

export const googleLogin = async (code: string) => {
    return api.post<{ user: User }>("auth/google", { code });
};

export const registerAuthService = async (formData: RegisterRequest) => {
    return api.post("auth/register", formData);
};

/** User thô từ token — ưu tiên GET /users/me cho hồ sơ đầy đủ */
export const getProfile = async () => {
    return api.get<User>("auth/profile");
};

export const getPermissions = async () => {
    return api.get<AuthPermissionsResponse>("auth/permissions");
};

/** Smoke test quyền admin (cần permission user:read). ADMIN → 200, CUSTOMER → 403 */
export const adminCheck = async () => {
    return api.get("auth/admin-check");
};

export const logout = async () => {
    return api.post("auth/signout");
};

export const refreshSession = async () => {
    return api.post<{ user: User }>("auth/refresh");
};

export const forgotPassword = async (email: string) => {
    return api.post<{ message: string }>("auth/forgot-password", { email });
};

export const resetPassword = async (token: string, newPassword: string) => {
    return api.post<{ message: string }>("auth/reset-password", {
        token,
        newPassword,
    });
};
