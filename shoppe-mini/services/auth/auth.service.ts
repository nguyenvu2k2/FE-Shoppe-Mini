import { api } from "@/lib/axios"

export const login = async (formData: { email: string; password: string; role: string }) => {
    return api.post("auth/signin", formData);
};

export const registerAuthService = async (formData: { fullName: string, email: string; password: string; role: string }) => {
    return api.post("auth/register", formData);
};

export const getProfile = async () => {
    return api.get("auth/profile", { withCredentials: true });
}

export const logout = async () => {
    return api.post("auth/signout", {}, { withCredentials: true });
}