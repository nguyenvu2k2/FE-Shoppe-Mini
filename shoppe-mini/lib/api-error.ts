import { isAxiosError } from "axios";

export function getApiErrorMessage(error: unknown, fallback: string): string {
    if (!isAxiosError(error)) return fallback;
    const message = (error.response?.data as { message?: string | string[] })
        ?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string" && message.trim()) return message;
    return fallback;
}
