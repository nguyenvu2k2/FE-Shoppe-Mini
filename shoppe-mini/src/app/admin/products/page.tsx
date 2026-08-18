import AdminProductsManager from "@/components/features/admin/admin-products-manager";

export default function AdminProductsPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Sản phẩm
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Quản lý sản phẩm
                </p>
            </div>
            <AdminProductsManager />
        </div>
    );
}
