import AdminProductEditForm from "@/components/features/admin/admin-product-edit-form";

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function AdminProductEditPage({ params }: PageProps) {
    const { id } = await params;
    const productId = Number(id);

    if (!Number.isFinite(productId)) {
        return (
            <p className="text-sm text-red-600">ID sản phẩm không hợp lệ.</p>
        );
    }

    return <AdminProductEditForm productId={productId} />;
}
