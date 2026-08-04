import axios from "axios";
import Cookies from "js-cookie";

export const api = axios.create({
    baseURL: "/api",
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    if (config.url) {
        config.url = config.url.replace(/^\/+/, "");
    }

    const token = Cookies.get("accessToken") ?? Cookies.get("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});