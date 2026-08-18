import { NextRequest, NextResponse } from "next/server";

const PHOTO_ID = /^photo-[a-zA-Z0-9_-]+$/;

/** Proxy Unsplash (tránh CORS + không đụng rewrite /api → BE). Chỉ cho phép photo id. */
export async function GET(request: NextRequest) {
    const id = request.nextUrl.searchParams.get("id") ?? "";
    if (!PHOTO_ID.test(id)) {
        return NextResponse.json({ message: "Invalid photo id" }, { status: 400 });
    }

    const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&h=800&q=80`;
    const res = await fetch(url, {
        headers: { Accept: "image/*" },
        cache: "force-cache",
    });

    if (!res.ok) {
        return NextResponse.json(
            { message: "Không lấy được ảnh Unsplash" },
            { status: 502 }
        );
    }

    const buffer = await res.arrayBuffer();
    const type = res.headers.get("content-type") || "image/jpeg";

    return new NextResponse(buffer, {
        headers: {
            "Content-Type": type,
            "Cache-Control": "public, max-age=86400",
        },
    });
}
