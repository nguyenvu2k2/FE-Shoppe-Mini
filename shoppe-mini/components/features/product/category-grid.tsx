"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import ProductImage from "@/components/ui/product-image";
import { CategoryGridSkeleton } from "@/components/features/product/catalog-skeletons";
import type { Category } from "@/lib/catalog.types";
import { getCategories, getCategoryTree } from "@/services/category/category.service";
import { cn } from "@/lib/utils";

type CategoryGridProps = {
    mode?: "flat" | "tree";
    limit?: number;
    className?: string;
    showViewAll?: boolean;
};

function flattenRoots(tree: Category[]): Category[] {
    return tree.map((node) => ({
        ...node,
        children: undefined,
    }));
}

export default function CategoryGrid({
    mode = "flat",
    limit,
    className,
    showViewAll = false,
}: CategoryGridProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            try {
                const { data } =
                    mode === "tree"
                        ? await getCategoryTree()
                        : await getCategories();
                const list = mode === "tree" ? flattenRoots(data) : data;
                if (!cancelled) {
                    setCategories(limit ? list.slice(0, limit) : list);
                }
            } catch {
                if (!cancelled) setCategories([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void load();
        return () => {
            cancelled = true;
        };
    }, [mode, limit]);

    if (loading) return <CategoryGridSkeleton count={limit ?? 8} />;

    if (categories.length === 0) {
        return (
            <p className="py-6 text-center text-sm text-gray-500">
                Chưa có danh mục nào.
            </p>
        );
    }

    return (
        <div className={cn("space-y-3", className)}>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 md:gap-3">
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        href={`/categories/${category.slug}`}
                        className="group flex flex-col items-center gap-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/[0.04] transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                        <div className="relative size-14 overflow-hidden rounded-full bg-gray-100">
                            <ProductImage
                                src={category.image}
                                alt={category.name}
                                sizes="56px"
                            />
                        </div>
                        <span className="line-clamp-2 text-center text-xs text-gray-700 group-hover:text-[#ee4d2d]">
                            {category.name}
                        </span>
                    </Link>
                ))}
            </div>
            {showViewAll && (
                <div className="text-center">
                    <Link
                        href="/categories"
                        className="text-sm font-medium text-[#ee4d2d] hover:underline"
                    >
                        Xem tất cả danh mục
                    </Link>
                </div>
            )}
        </div>
    );
}
