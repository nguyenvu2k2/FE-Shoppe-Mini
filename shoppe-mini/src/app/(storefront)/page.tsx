import Link from "next/link";
import type { Metadata } from "next";

import CategoryGrid from "@/components/features/product/category-grid";
import ProductGrid from "@/components/features/product/product-grid";

export const metadata: Metadata = {
    title: "Trang chủ",
};

export default function HomePage() {
    return (
        <div className="pb-10">
            {/* Banner placeholder */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#c73e1d] via-[#ee4d2d] to-[#ff8c5a]">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute -top-20 -right-20 size-72 rounded-full bg-white/30 blur-3xl" />
                    <div className="absolute bottom-0 left-10 size-56 rounded-full bg-orange-200/40 blur-2xl" />
                </div>
                <div className="relative mx-auto flex max-w-[1200px] flex-col gap-4 px-4 py-10 sm:py-14 md:flex-row md:items-center md:justify-between">
                    <div className="max-w-lg text-white">
                        <p className="text-sm font-medium text-white/80">
                            Shop Mini
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                            Mua sắm nhanh — giá tốt mỗi ngày
                        </h1>
                        <p className="mt-2 text-sm text-white/85 sm:text-base">
                            Khám phá danh mục đa dạng và sản phẩm đang bán trên
                            nền tảng lite.
                        </p>
                        <div className="mt-5 flex flex-wrap gap-3">
                            <Link
                                href="/products"
                                className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#ee4d2d] shadow-sm transition hover:bg-orange-50"
                            >
                                Xem sản phẩm
                            </Link>
                            <Link
                                href="/categories"
                                className="rounded-xl border border-white/40 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                            >
                                Danh mục
                            </Link>
                        </div>
                    </div>
                    <div className="hidden h-40 w-full max-w-sm rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm md:block">
                        <p className="text-xs font-medium tracking-wide text-white/70 uppercase">
                            Banner placeholder
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-white/90">
                            Khu vực banner quảng cáo — sẽ gắn API banner khi
                            backend hỗ trợ.
                        </p>
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-[1200px] space-y-8 px-4 py-8">
                <section>
                    <div className="mb-4 flex items-end justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Danh mục
                        </h2>
                    </div>
                    <CategoryGrid mode="flat" limit={8} showViewAll />
                </section>

                <ProductGrid
                    title="Gợi ý hôm nay"
                    limit={8}
                    viewAllHref="/products"
                />
            </div>
        </div>
    );
}
