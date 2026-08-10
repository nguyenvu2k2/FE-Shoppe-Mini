import { api } from "@/lib/axios";
import type { User } from "@/src/app/(store)/auth/auth..store";

export const login = async (formData: { email: string; password: string; role: string }) => {
    return api.post<User>("auth/signin", formData);
};

export const googleLogin = async (code: string) => {
    return api.post("auth/google", { code });
};

export const registerAuthService = async (formData: { fullName: string, email: string; password: string; role: string }) => {
    return api.post("auth/register", formData);
};

export const getProfile = async () => {
    return api.get<User>("auth/profile");
};

export const logout = async () => {
    return api.post("auth/signout");
};

export const refreshSession = async () => {
    return api.post<User>("auth/refresh");
};

export const forgotPassword = async (email: string) => {
    return api.post<{ message: string }>("auth/forgot-password", { email });
};

export const resetPassword = async (token: string, newPassword: string) => {
    return api.post<{ message: string }>("auth/reset-password", { token, newPassword });
};