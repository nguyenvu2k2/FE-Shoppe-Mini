"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";

import EmptyState from "@/components/ui/empty-state";
import Price from "@/components/ui/price";
import ProductImage from "@/components/ui/product-image";
import { getApiErrorMessage } from "@/lib/api-error";
import { useCan } from "@/lib/use-can";
import { notify } from "@/lib/toast";
import type { ManageProductItem, ProductStatus } from "@/lib/catalog.types";
import {
    deleteProduct,
    getManageProducts,
} from "@/services/product/product.service";
import { cn } from "@/lib/utils";
import AdminSeedProductsButton from "@/components/features/admin/admin-seed-products";

const STATUS_OPTIONS: Array<{ value: "" | ProductStatus; label: string }> = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "ACTIVE", label: "ACTIVE" },
    { value: "DRAFT", label: "DRAFT" },
    { value: "INACTIVE", label: "INACTIVE" },
];

function statusClass(status?: string) {
    switch (String(status).toUpperCase()) {
        case "ACTIVE":
            return "bg-emerald-50 text-emerald-700";
        case "DRAFT":
            return "bg-amber-50 text-amber-700";
        case "INACTIVE":
            return "bg-gray-100 text-gray-600";
        default:
            return "bg-gray-100 text-gray-600";
    }
}

export default function AdminProductsManager() {
    const canCreate = useCan("product:create");
    const canUpdate = useCan("product:update");
    const canDelete = useCan("product:delete");

    const [items, setItems] = useState<ManageProductItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [qInput, setQInput] = useState("");
    const [q, setQ] = useState("");
    const [status, setStatus] = useState<"" | ProductStatus>("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await getManageProducts({
                page,
                limit: 20,
                q: q || undefined,
                status: status || undefined,
            });
            setItems((data.items as ManageProductItem[]) ?? []);
            setTotalPages(data.meta?.totalPages ?? 1);
            setTotal(data.meta?.total ?? 0);
        } catch (error) {
            notify.error(
                getApiErrorMessage(error, "Không tải được sản phẩm.")
            );
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [page, q, status]);

    useEffect(() => {
        void load();
    }, [load]);

    const handleDelete = async (product: ManageProductItem) => {
        if (!window.confirm(`Xóa sản phẩm "${product.name}"?`)) return;
        try {
            await deleteProduct(product.id);
            notify.success("Đã xóa sản phẩm");
            await load();
        } catch (error) {
            notify.error(getApiErrorMessage(error, "Không xóa được sản phẩm."));
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <form
                    className="flex flex-1 flex-col gap-2 sm:flex-row"
                    onSubmit={(e) => {
                        e.preventDefault();
                        setPage(1);
                        setQ(qInput.trim());
                    }}
                >
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                        <input
                            value={qInput}
                            onChange={(e) => setQInput(e.target.value)}
                            placeholder="Tìm theo tên..."
                            className="w-full rounded-lg border border-gray-200 bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-[#ee4d2d]"
                        />
                    </div>
                    <select
                        value={status}
                        onChange={(e) => {
                            setPage(1);
                            setStatus(e.target.value as "" | ProductStatus);
                        }}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.label} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50"
                    >
                        Lọc
                    </button>
                </form>

                {canCreate && (
                    <div className="flex flex-wrap gap-2">
                        <AdminSeedProductsButton onDone={() => void load()} />
                        <Link
                            href="/admin/products/new"
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#ee4d2d] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                        >
                            <Plus className="size-4" />
                            Tạo sản phẩm
                        </Link>
                    </div>
                )}
            </div>

            <p className="text-sm text-gray-500">{total} sản phẩm</p>

            {loading ? (
                <div className="space-y-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-16 animate-pulse rounded-xl bg-gray-200"
                        />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <EmptyState
                    title="Không có sản phẩm"
                    description="Thử đổi bộ lọc hoặc tạo sản phẩm mới."
                />
            ) : (
                <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 font-medium">SP</th>
                                <th className="px-4 py-3 font-medium">Giá</th>
                                <th className="px-4 py-3 font-medium">Kho</th>
                                <th className="px-4 py-3 font-medium">
                                    Trạng thái
                                </th>
                                <th className="px-4 py-3 font-medium text-right">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50/80">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                <ProductImage
                                                    src={product.thumbnail}
                                                    alt={product.name}
                                                    sizes="48px"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate font-medium text-gray-900">
                                                    {product.name}
                                                </p>
                                                <p className="truncate text-xs text-gray-400">
                                                    {product.category?.name ??
                                                        "—"}{" "}
                                                    · /{product.slug}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Price
                                            price={product.price}
                                            discountPrice={product.discountPrice}
                                            size="sm"
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {product.stock ?? "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={cn(
                                                "rounded-full px-2 py-0.5 text-xs font-medium",
                                                statusClass(product.status)
                                            )}
                                        >
                                            {product.status ?? "—"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-1">
                                            {canUpdate && (
                                                <Link
                                                    href={`/admin/products/${product.id}/edit`}
                                                    className="rounded-lg p-2 text-gray-500 hover:bg-orange-50 hover:text-[#ee4d2d]"
                                                >
                                                    <Pencil className="size-4" />
                                                </Link>
                                            )}
                                            {canDelete && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void handleDelete(
                                                            product
                                                        )
                                                    }
                                                    className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm disabled:opacity-40"
                    >
                        Trước
                    </button>
                    <span className="text-sm text-gray-600">
                        {page}/{totalPages}
                    </span>
                    <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm disabled:opacity-40"
                    >
                        Sau
                    </button>
                </div>
            )}
        </div>
    );
}
