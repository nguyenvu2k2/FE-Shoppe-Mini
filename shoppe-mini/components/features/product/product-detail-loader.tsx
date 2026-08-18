"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import ProductDetailView from "@/components/features/product/product-detail-view";
import EmptyState from "@/components/ui/empty-state";
import type { ProductDetail } from "@/lib/catalog.types";
import { getProductByIdOrSlug } from "@/services/product/product.service";

type ProductDetailLoaderProps = {
    slug: string;
};

export default function ProductDetailLoader({ slug }: ProductDetailLoaderProps) {
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setNotFound(false);
            try {
                const { data } = await getProductByIdOrSlug(slug);
                if (!cancelled) setProduct(data);
            } catch (err: unknown) {
                if (cancelled) return;
                const status = (err as { response?: { status?: number } })
                    ?.response?.status;
                setNotFound(status === 404);
                setProduct(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void load();
        return () => {
            cancelled = true;
        };
    }, [slug]);

    if (loading) {
        return (
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="aspect-square animate-pulse rounded-2xl bg-gray-200" />
                <div className="space-y-4">
                    <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
                    <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200" />
                    <div className="h-24 animate-pulse rounded-xl bg-gray-200" />
                    <div className="h-12 w-48 animate-pulse rounded-xl bg-gray-200" />
                </div>
            </div>
        );
    }

    if (notFound || !product) {
        return (
            <EmptyState
                title="Không tìm thấy sản phẩm"
                description="Sản phẩm có thể đã ngừng bán hoặc đường dẫn không đúng."
                action={
                    <Link
                        href="/products"
                        className="text-sm font-medium text-[#ee4d2d] hover:underline"
                    >
                        Xem sản phẩm khác
                    </Link>
                }
            />
        );
    }

    return <ProductDetailView product={product} />;
}
