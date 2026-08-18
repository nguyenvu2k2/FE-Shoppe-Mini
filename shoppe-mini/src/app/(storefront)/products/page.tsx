import { Suspense } from "react";
import type { Metadata } from "next";

import ProductsExplorer from "@/components/features/product/products-explorer";
import { ProductGridSkeleton } from "@/components/features/product/catalog-skeletons";

export const metadata: Metadata = {
    title: "Sản phẩm",
};

export default function ProductsPage() {
    return (
        <div className="mx-auto max-w-[1200px] px-4 py-8">
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-gray-900">
                    Sản phẩm
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Tìm kiếm, lọc theo danh mục và phân trang
                </p>
            </div>
            <Suspense fallback={<ProductGridSkeleton count={12} />}>
                <ProductsExplorer />
            </Suspense>
        </div>
    );
}
