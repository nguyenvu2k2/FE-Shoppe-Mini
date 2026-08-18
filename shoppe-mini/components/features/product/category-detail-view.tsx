"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import ProductCard from "@/components/features/product/product-card";
import { ProductGridSkeleton } from "@/components/features/product/catalog-skeletons";
import EmptyState from "@/components/ui/empty-state";
import ProductImage from "@/components/ui/product-image";
import type { Category, ProductListItem } from "@/lib/catalog.types";
import { getCategoryByIdOrSlug } from "@/services/category/category.service";
import { getProducts } from "@/services/product/product.service";

type CategoryDetailViewProps = {
    slug: string;
};

export default function CategoryDetailView({ slug }: CategoryDetailViewProps) {
    const [category, setCategory] = useState<Category | null>(null);
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError(null);
            setNotFound(false);
            try {
                const { data: cat } = await getCategoryByIdOrSlug(slug);
                if (cancelled) return;
                setCategory(cat);

                const { data: productData } = await getProducts({
                    categoryId: cat.id,
                    limit: 24,
                    page: 1,
                });
                if (cancelled) return;
                setProducts(productData.items ?? []);
            } catch (err: unknown) {
                if (cancelled) return;
                const status = (err as { response?: { status?: number } })
                    ?.response?.status;
                if (status === 404) setNotFound(true);
                else setError("Không tải được danh mục.");
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
            <div className="space-y-6">
                <div className="h-24 animate-pulse rounded-2xl bg-gray-200" />
                <ProductGridSkeleton count={8} />
            </div>
        );
    }

    if (notFound) {
        return (
            <EmptyState
                title="Không tìm thấy danh mục"
                description="Danh mục có thể đã bị xóa hoặc đường dẫn không đúng."
                action={
                    <Link
                        href="/categories"
                        className="text-sm font-medium text-[#ee4d2d] hover:underline"
                    >
                        Về danh sách danh mục
                    </Link>
                }
            />
        );
    }

    if (error || !category) {
        return (
            <EmptyState
                title="Có lỗi xảy ra"
                description={error ?? "Vui lòng thử lại."}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04] sm:p-6">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-gray-100 sm:size-20">
                    <ProductImage
                        src={category.image}
                        alt={category.name}
                        sizes="80px"
                    />
                </div>
                <div>
                    <p className="text-xs text-gray-400">
                        <Link href="/categories" className="hover:text-[#ee4d2d]">
                            Danh mục
                        </Link>
                        <span className="mx-1">/</span>
                        <span>{category.name}</span>
                    </p>
                    <h1 className="text-xl font-semibold text-gray-900">
                        {category.name}
                    </h1>
                    {category.children && category.children.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {category.children.map((child) => (
                                <Link
                                    key={child.id}
                                    href={`/categories/${child.slug}`}
                                    className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 hover:bg-[#fef6f5] hover:text-[#ee4d2d]"
                                >
                                    {child.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {products.length === 0 ? (
                <EmptyState
                    title="Chưa có sản phẩm"
                    description="Danh mục này hiện chưa có sản phẩm đang bán."
                    action={
                        <Link
                            href="/products"
                            className="text-sm font-medium text-[#ee4d2d] hover:underline"
                        >
                            Xem tất cả sản phẩm
                        </Link>
                    }
                />
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}
