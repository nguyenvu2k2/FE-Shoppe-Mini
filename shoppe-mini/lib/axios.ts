import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore, type User } from "@/lib/auth-store";
import { useCartStore } from "@/lib/cart-store";
import { parseUserResponse } from "@/lib/auth.types";
import { disconnectSocket } from "./socket";

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
    return (
        path.startsWith("/login") ||
        path.startsWith("/signin") ||
        path.startsWith("/register") ||
        path.startsWith("/forgot-password") ||
        path.startsWith("/reset-password")
    );
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
            const { data } = await api.post("auth/refresh");
            const user = parseUserResponse(data) as User | null;
            if (user) {
                useAuthStore.getState().setUser(user);
            }
            processQueue(null);
            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError);
            useAuthStore.getState().clearUser();
            useCartStore.getState().clearLocal();

            disconnectSocket();

            try {
                await api.post("auth/signout");
            } catch {
                // Cookie có thể đã hết hạn — vẫn redirect xuống dưới
            }

            // Chỉ ép login trên route bảo vệ — catalog public (/ , /products...) vẫn xem được khi guest
            if (typeof window !== "undefined" && !isPublicAuthPage()) {
                const path = window.location.pathname;
                const protectedPrefixes = [
                    "/account",
                    "/orders",
                    "/cart",
                    "/checkout",
                    "/payments",
                    "/admin",
                ];
                const onProtected = protectedPrefixes.some(
                    (prefix) =>
                        path === prefix || path.startsWith(`${prefix}/`)
                );
                if (onProtected) {
                    window.location.href = "/login?session=expired";
                }
            }
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);
