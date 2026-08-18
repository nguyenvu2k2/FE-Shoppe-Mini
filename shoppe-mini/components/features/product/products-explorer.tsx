"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import ProductCard from "@/components/features/product/product-card";
import { ProductGridSkeleton } from "@/components/features/product/catalog-skeletons";
import EmptyState from "@/components/ui/empty-state";
import type { Category, ProductListItem } from "@/lib/catalog.types";
import { getCategories } from "@/services/category/category.service";
import { getProducts } from "@/services/product/product.service";
import { cn } from "@/lib/utils";

const LIMIT = 12;

export default function ProductsExplorer() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const q = searchParams.get("q") || "";
    const categoryId = searchParams.get("categoryId") || "";

    const [queryInput, setQueryInput] = useState(q);
    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<ProductListItem[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const updateParams = useCallback(
        (patch: Record<string, string | null>) => {
            const params = new URLSearchParams(searchParams.toString());
            Object.entries(patch).forEach(([key, value]) => {
                if (value == null || value === "") params.delete(key);
                else params.set(key, value);
            });
            const qs = params.toString();
            router.push(qs ? `/products?${qs}` : "/products");
        },
        [router, searchParams]
    );

    useEffect(() => {
        setQueryInput(q);
    }, [q]);

    useEffect(() => {
        let cancelled = false;
        getCategories()
            .then(({ data }) => {
                if (!cancelled) setCategories(data ?? []);
            })
            .catch(() => {
                if (!cancelled) setCategories([]);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await getProducts({
                    page,
                    limit: LIMIT,
                    categoryId: categoryId || undefined,
                    q: q || undefined,
                });
                if (cancelled) return;
                setItems(data.items ?? []);
                setTotalPages(data.meta?.totalPages ?? 1);
                setTotal(data.meta?.total ?? 0);
            } catch {
                if (!cancelled) {
                    setItems([]);
                    setError("Không tải được danh sách sản phẩm.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void load();
        return () => {
            cancelled = true;
        };
    }, [page, q, categoryId]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateParams({ q: queryInput.trim() || null, page: "1" });
    };

    return (
        <div className="space-y-5">
            <form
                onSubmit={handleSearch}
                className="flex flex-col gap-3 sm:flex-row"
            >
                <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                    <input
                        value={queryInput}
                        onChange={(e) => setQueryInput(e.target.value)}
                        placeholder="Tìm sản phẩm..."
                        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm outline-none focus:border-[#ee4d2d]/40 focus:ring-2 focus:ring-[#ee4d2d]/15"
                    />
                </div>
                <button
                    type="submit"
                    className="rounded-xl bg-[#ee4d2d] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
                >
                    Tìm kiếm
                </button>
            </form>

            <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                    type="button"
                    onClick={() =>
                        updateParams({ categoryId: null, page: "1" })
                    }
                    className={cn(
                        "shrink-0 rounded-full px-3.5 py-1.5 text-sm transition",
                        !categoryId
                            ? "bg-[#ee4d2d] text-white"
                            : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
                    )}
                >
                    Tất cả
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() =>
                            updateParams({
                                categoryId: String(cat.id),
                                page: "1",
                            })
                        }
                        className={cn(
                            "shrink-0 rounded-full px-3.5 py-1.5 text-sm transition",
                            categoryId === String(cat.id)
                                ? "bg-[#ee4d2d] text-white"
                                : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
                        )}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            <p className="text-sm text-gray-500">
                {loading ? "Đang tải..." : `${total} sản phẩm`}
            </p>

            {loading && <ProductGridSkeleton count={LIMIT} />}
            {!loading && error && (
                <EmptyState title="Có lỗi xảy ra" description={error} />
            )}
            {!loading && !error && items.length === 0 && (
                <EmptyState
                    title="Không tìm thấy sản phẩm"
                    description="Thử từ khóa khác hoặc chọn danh mục khác."
                />
            )}
            {!loading && !error && items.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
                    {items.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}

            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() =>
                            updateParams({ page: String(page - 1) })
                        }
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm disabled:opacity-40"
                    >
                        Trước
                    </button>
                    <span className="text-sm text-gray-600">
                        Trang {page} / {totalPages}
                    </span>
                    <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() =>
                            updateParams({ page: String(page + 1) })
                        }
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm disabled:opacity-40"
                    >
                        Sau
                    </button>
                </div>
            )}
        </div>
    );
}
