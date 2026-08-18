import { ClipboardList, FolderTree, Package } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
    return (
        <div className="mx-auto max-w-4xl">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Tổng quan quản trị
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Quản lý đơn hàng, danh mục và sản phẩm Shop Mini
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link
                    href="/admin/orders"
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-[#ee4d2d]/40 hover:shadow-md"
                >
                    <ClipboardList className="mb-3 size-6 text-[#ee4d2d]" />
                    <h2 className="font-medium text-gray-900">Đơn hàng</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Xác nhận, giao hàng, thanh toán
                    </p>
                </Link>
                <Link
                    href="/admin/categories"
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-[#ee4d2d]/40 hover:shadow-md"
                >
                    <FolderTree className="mb-3 size-6 text-[#ee4d2d]" />
                    <h2 className="font-medium text-gray-900">Danh mục</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Tạo, sửa, xóa và ảnh danh mục
                    </p>
                </Link>
                <Link
                    href="/admin/products"
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-[#ee4d2d]/40 hover:shadow-md"
                >
                    <Package className="mb-3 size-6 text-[#ee4d2d]" />
                    <h2 className="font-medium text-gray-900">Sản phẩm</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Ảnh, phân loại, tồn kho
                    </p>
                </Link>
            </div>
        </div>
    );
}
