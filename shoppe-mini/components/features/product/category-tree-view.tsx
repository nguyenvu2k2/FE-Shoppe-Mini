"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { CategoryGridSkeleton } from "@/components/features/product/catalog-skeletons";
import EmptyState from "@/components/ui/empty-state";
import ProductImage from "@/components/ui/product-image";
import type { Category } from "@/lib/catalog.types";
import { getCategoryTree } from "@/services/category/category.service";

export default function CategoryTreeView() {
    const [tree, setTree] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        getCategoryTree()
            .then(({ data }) => {
                if (!cancelled) setTree(data ?? []);
            })
            .catch(() => {
                if (!cancelled) setTree([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) return <CategoryGridSkeleton count={12} />;

    if (tree.length === 0) {
        return (
            <EmptyState
                title="Chưa có danh mục"
                description="Danh mục sẽ hiển thị khi admin tạo trên hệ thống."
            />
        );
    }

    return (
        <div className="space-y-4">
            {tree.map((parent) => (
                <div
                    key={parent.id}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]"
                >
                    <Link
                        href={`/categories/${parent.slug}`}
                        className="flex items-center gap-3 border-b border-gray-50 px-4 py-3 transition hover:bg-[#fef6f5]"
                    >
                        <div className="relative size-12 overflow-hidden rounded-xl bg-gray-100">
                            <ProductImage
                                src={parent.image}
                                alt={parent.name}
                                sizes="48px"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900">
                                {parent.name}
                            </p>
                            <p className="text-xs text-gray-400">
                                {parent.children?.length
                                    ? `${parent.children.length} danh mục con`
                                    : "Danh mục gốc"}
                            </p>
                        </div>
                        <ChevronRight className="size-4 text-gray-300" />
                    </Link>

                    {parent.children && parent.children.length > 0 && (
                        <div className="grid grid-cols-2 gap-px bg-gray-50 sm:grid-cols-3 md:grid-cols-4">
                            {parent.children.map((child) => (
                                <Link
                                    key={child.id}
                                    href={`/categories/${child.slug}`}
                                    className="flex items-center gap-2 bg-white px-3 py-3 text-sm text-gray-700 transition hover:bg-[#fef6f5] hover:text-[#ee4d2d]"
                                >
                                    <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-gray-100">
                                        <ProductImage
                                            src={child.image}
                                            alt={child.name}
                                            sizes="32px"
                                        />
                                    </div>
                                    <span className="line-clamp-2">{child.name}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
