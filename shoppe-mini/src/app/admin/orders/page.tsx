import AdminOrdersManager from "@/components/features/admin/admin-orders-manager";

export default function AdminOrdersPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Đơn hàng
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Lọc và xử lý đơn hàng
                </p>
            </div>
            <AdminOrdersManager />
        </div>
    );
}
