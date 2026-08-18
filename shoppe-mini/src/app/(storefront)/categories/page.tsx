import CategoryTreeView from "@/components/features/product/category-tree-view";

export default function CategoriesPage() {
    return (
        <div className="mx-auto max-w-[1200px] px-4 py-8">
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-gray-900">
                    Tất cả danh mục
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Duyệt theo cây danh mục cha — con
                </p>
            </div>
            <CategoryTreeView />
        </div>
    );
}
