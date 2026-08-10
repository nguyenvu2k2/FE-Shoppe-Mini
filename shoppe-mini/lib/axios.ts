import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore, type User } from "@/src/app/(store)/auth/auth..store";

export const api = axios.create({
    baseURL: "/api",
    withCredentials: true,
});

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let failedQueue: Array<{
    resolve: () => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve();
    });
    failedQueue = [];
};

const AUTH_SKIP_PATHS = [
    "auth/refresh",
    "auth/signin",
    "auth/register",
    "auth/signout",
    "auth/forgot-password",
    "auth/reset-password",
    // 401 = sai mật khẩu hiện tại, không phải session hết hạn
    "users/me/password",
];

const shouldSkipRefresh = (url?: string) =>
    !!url && AUTH_SKIP_PATHS.some((path) => url.includes(path));

const isPublicAuthPage = () => {
    if (typeof window === "undefined") return false;
    const path = window.location.pathname;
    return path.startsWith("/login") || path.startsWith("/register") || path.startsWith("/forgot-password") || path.startsWith("/reset-password");
};

api.interceptors.request.use((config) => {
    if (config.url) {
        config.url = config.url.replace(/^\/+/, "");
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryConfig | undefined;

        if (
            error.response?.status !== 401 ||
            !originalRequest ||
            originalRequest._retry ||
            shouldSkipRefresh(originalRequest.url)
        ) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise<void>((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(() => api(originalRequest));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const { data } = await api.post<{ user: User }>("auth/refresh");
            useAuthStore.getState().setUser(data.user);
            processQueue(null);
            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError);
            useAuthStore.getState().clearUser();

            try {
                await api.post("auth/signout");
            } catch {
                // Cookie có thể đã hết hạn — vẫn redirect xuống dưới
            }

            if (typeof window !== "undefined" && !isPublicAuthPage()) {
                window.location.href = "/login?session=expired";
            }
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);
