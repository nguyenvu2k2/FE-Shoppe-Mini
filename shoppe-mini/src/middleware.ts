import { NextRequest, NextResponse } from "next/server";

/** Alias theo prompt */
const SIGNIN_ALIAS = "/signin";

/**
 * Cookie session nằm trên origin Railway (axios + socket credentials).
 * Middleware Vercel không đọc được cookie đó — route bảo vệ do AuthGuard
 * hydrate với BE.
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname === SIGNIN_ALIAS || pathname.startsWith(`${SIGNIN_ALIAS}/`)) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/signin", "/signin/:path*"],
};
