import { NextRequest, NextResponse } from "next/server";

/** Alias theo prompt */
const SIGNIN_ALIAS = "/signin";

/** Cần cookie session. Catalog (/ , /categories, /products) là public. */
const PROTECTED_PATHS = [
    "/account",
    "/orders",
    "/cart",
    "/checkout",
    "/payments",
    "/admin",
];

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

    if (pathname === SIGNIN_ALIAS || pathname.startsWith(`${SIGNIN_ALIAS}/`)) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // Chưa có cookie → không vào route bảo vệ
    if (matchesPath(pathname, PROTECTED_PATHS) && !authenticated) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/login";
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    /**
     * KHÔNG redirect /login|/register khi còn cookie.
     * Cookie hết hạn / refresh fail vẫn còn trong browser → user thấy nút
     * "Đăng nhập" (user=null) nhưng middleware đá về / → không vào được login.
     * Việc redirect khi đã login thật do client (LoginForm) xử lý.
     */

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/account",
        "/account/:path*",
        "/orders",
        "/orders/:path*",
        "/cart",
        "/cart/:path*",
        "/checkout",
        "/checkout/:path*",
        "/payments",
        "/payments/:path*",
        "/admin",
        "/admin/:path*",
        "/login",
        "/signin",
        "/signin/:path*",
        "/register",
    ],
};
