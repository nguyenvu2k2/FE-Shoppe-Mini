import Cookies from "js-cookie";

const cookieOptions = {
    expires: 1,
    secure: false,
    sameSite: "Lax" as const,
};

const refreshCookieOptions = {
    expires: 7,
    secure: false,
    sameSite: "Lax" as const,
};

export const saveTokens = (
    accessToken: string,
    refreshToken: string
) => {
    Cookies.set("accessToken", accessToken, cookieOptions);
    Cookies.set("access_token", accessToken, cookieOptions);

    Cookies.set("refreshToken", refreshToken, refreshCookieOptions);
    Cookies.set("refresh_token", refreshToken, refreshCookieOptions);
};

export const clearTokens = () => {
    Cookies.remove("accessToken");
    Cookies.remove("access_token");
    Cookies.remove("refreshToken");
    Cookies.remove("refresh_token");
};

export const getAccessToken = () =>
    Cookies.get("accessToken") ?? Cookies.get("access_token");