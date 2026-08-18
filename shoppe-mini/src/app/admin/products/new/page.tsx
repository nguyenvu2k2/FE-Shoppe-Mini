import Link from "next/link";

import AdminProductCreateForm from "@/components/features/admin/admin-product-create-form";

export default function AdminProductNewPage() {
    return (
        <div>
            <div className="mb-6">
                <Link
                    href="/admin/products"
                    className="text-sm text-gray-500 hover:text-[#ee4d2d]"
                >
                    ← Sản phẩm
                </Link>
                <h1 className="mt-1 text-2xl font-semibold text-gray-900">
                    Tạo sản phẩm
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Thông tin cơ bản, tồn kho hoặc variants
                </p>
            </div>
            <AdminProductCreateForm />
        </div>
    );
}
