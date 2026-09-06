/** REST + Socket cùng origin Railway — cookie credentials mới gửi được cho handshake. */
export function getApiBaseUrl() {
    const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    return raw.replace(/\/+$/, "");
}
