"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import ProductCard from "@/components/features/product/product-card";
import { ProductGridSkeleton } from "@/components/features/product/catalog-skeletons";
import EmptyState from "@/components/ui/empty-state";
import type { ProductListItem } from "@/lib/catalog.types";
import { getProducts } from "@/services/product/product.service";

type ProductGridProps = {
    categoryId?: number | string;
    q?: string;
    page?: number;
    limit?: number;
    title?: string;
    viewAllHref?: string;
};

export default function ProductGrid({
    categoryId,
    q,
    page = 1,
    limit = 12,
    title,
    viewAllHref,
}: ProductGridProps) {
    const [items, setItems] = useState<ProductListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await getProducts({
                    page,
                    limit,
                    categoryId,
                    q,
                });
                if (cancelled) return;
                setItems(data.items ?? []);
            } catch {
                if (!cancelled) {
                    setItems([]);
                    setError("Không tải được sản phẩm. Vui lòng thử lại.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void load();
        return () => {
            cancelled = true;
        };
    }, [categoryId, q, page, limit]);

    return (
        <section className="space-y-4">
            {(title || viewAllHref) && (
                <div className="flex items-end justify-between gap-3">
                    {title && (
                        <h2 className="text-lg font-semibold text-gray-900">
                            {title}
                        </h2>
                    )}
                    {viewAllHref && (
                        <Link
                            href={viewAllHref}
                            className="shrink-0 text-sm font-medium text-[#ee4d2d] hover:underline"
                        >
                            Xem tất cả
                        </Link>
                    )}
                </div>
            )}

            {loading && <ProductGridSkeleton count={Math.min(limit, 8)} />}

            {!loading && error && (
                <EmptyState title="Có lỗi xảy ra" description={error} />
            )}

            {!loading && !error && items.length === 0 && (
                <EmptyState
                    title="Không có sản phẩm"
                    description="Thử đổi bộ lọc hoặc từ khóa tìm kiếm khác."
                />
            )}

            {!loading && !error && items.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
                    {items.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </section>
    );
}
