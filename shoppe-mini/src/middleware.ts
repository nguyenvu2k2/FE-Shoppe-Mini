import { NextRequest, NextResponse } from "next/server";

/** Chỉ redirect về /shop khi đã login — không áp dụng cho forgot/reset password */
const GUEST_ONLY_PATHS = ["/login", "/register"];
const PROTECTED_PATHS = ["/shop", "/account", "/orders"];

function hasSession(request: NextRequest) {
    return (
        request.cookies.has("accessToken") ||
        request.cookies.has("refreshToken")
    );
}

function matchesPath(pathname: string, paths: string[]) {
    return paths.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`)
    );
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const authenticated = hasSession(request);

    if (matchesPath(pathname, PROTECTED_PATHS) && !authenticated) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/login";
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (
        matchesPath(pathname, GUEST_ONLY_PATHS) &&
        authenticated &&
        request.nextUrl.searchParams.get("session") !== "expired"
    ) {
        const shopUrl = request.nextUrl.clone();
        shopUrl.pathname = "/shop";
        shopUrl.search = "";
        return NextResponse.redirect(shopUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/shop",
        "/shop/:path*",
        "/account",
        "/account/:path*",
        "/orders",
        "/orders/:path*",
        "/login",
        "/register",
    ],
};
