import AdminCategoriesManager from "@/components/features/admin/admin-categories-manager";

export default function AdminCategoriesPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Danh mục
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Quản lý danh mục
                </p>
            </div>
            <AdminCategoriesManager />
        </div>
    );
}
