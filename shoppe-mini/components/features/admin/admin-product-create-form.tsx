"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

import { getApiErrorMessage } from "@/lib/api-error";
import { slugify } from "@/lib/slugify";
import { notify } from "@/lib/toast";
import type { Category, ProductStatus } from "@/lib/catalog.types";
import { getCategories } from "@/services/category/category.service";
import { createProduct } from "@/services/product/product.service";

type VariantRow = {
    key: string;
    name: string;
    sku: string;
    price: string;
    quantity: string;
    warehouse: string;
};

const inputClass =
    "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#ee4d2d] focus:ring-2 focus:ring-[#ee4d2d]/15";

export default function AdminProductCreateForm() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [saving, setSaving] = useState(false);
    const [useVariants, setUseVariants] = useState(false);

    const [categoryId, setCategoryId] = useState("");
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [autoSlug, setAutoSlug] = useState(true);
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [discountPrice, setDiscountPrice] = useState("");
    const [status, setStatus] = useState<ProductStatus>("DRAFT");
    const [quantity, setQuantity] = useState("0");
    const [warehouse, setWarehouse] = useState("");
    const [variants, setVariants] = useState<VariantRow[]>([
        {
            key: "v1",
            name: "",
            sku: "",
            price: "",
            quantity: "0",
            warehouse: "",
        },
    ]);

    useEffect(() => {
        getCategories()
            .then(({ data }) => setCategories(data ?? []))
            .catch(() => setCategories([]));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryId) {
            notify.error("Chọn danh mục");
            return;
        }
        if (!name.trim()) {
            notify.error("Nhập tên sản phẩm");
            return;
        }

        const basePrice = Number(price);
        if (!Number.isFinite(basePrice) || basePrice < 0) {
            notify.error("Giá không hợp lệ");
            return;
        }

        setSaving(true);
        try {
            const payload: Parameters<typeof createProduct>[0] = {
                categoryId: Number(categoryId),
                name: name.trim(),
                slug: slug.trim() || undefined,
                description: description.trim() || undefined,
                price: basePrice,
                discountPrice: discountPrice
                    ? Number(discountPrice)
                    : undefined,
                status,
            };

            if (useVariants) {
                const rows = variants
                    .map((v) => ({
                        name: v.name.trim(),
                        sku: v.sku.trim(),
                        price: Number(v.price),
                        quantity: Number(v.quantity) || 0,
                        warehouse: v.warehouse.trim() || undefined,
                    }))
                    .filter((v) => v.name && v.sku);

                if (rows.length === 0) {
                    notify.error("Thêm ít nhất 1 variant hợp lệ");
                    setSaving(false);
                    return;
                }
                if (rows.some((v) => !Number.isFinite(v.price) || v.price < 0)) {
                    notify.error("Giá variant không hợp lệ");
                    setSaving(false);
                    return;
                }
                payload.variants = rows;
            } else {
                payload.quantity = Number(quantity) || 0;
                if (warehouse.trim()) payload.warehouse = warehouse.trim();
            }

            const { data } = await createProduct(payload);
            notify.success("Tạo sản phẩm thành công");
            router.replace(`/admin/products/${data.id}/edit`);
        } catch (error) {
            notify.error(
                getApiErrorMessage(error, "Không tạo được sản phẩm.")
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mx-auto max-w-3xl space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/[0.04]"
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm text-gray-600">
                        Danh mục *
                    </label>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className={inputClass}
                        required
                    >
                        <option value="">Chọn danh mục</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm text-gray-600">
                        Tên sản phẩm *
                    </label>
                    <input
                        value={name}
                        onChange={(e) => {
                            const next = e.target.value;
                            setName(next);
                            if (autoSlug) setSlug(slugify(next));
                        }}
                        className={inputClass}
                        required
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm text-gray-600">
                        Slug
                    </label>
                    <input
                        value={slug}
                        onChange={(e) => {
                            setSlug(e.target.value);
                            setAutoSlug(false);
                        }}
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm text-gray-600">
                        Trạng thái
                    </label>
                    <select
                        value={status}
                        onChange={(e) =>
                            setStatus(e.target.value as ProductStatus)
                        }
                        className={inputClass}
                    >
                        <option value="DRAFT">DRAFT</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                    </select>
                </div>

                <div>
                    <label className="mb-1.5 block text-sm text-gray-600">
                        Giá *
                    </label>
                    <input
                        type="number"
                        min={0}
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className={inputClass}
                        required
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm text-gray-600">
                        Giá giảm
                    </label>
                    <input
                        type="number"
                        min={0}
                        value={discountPrice}
                        onChange={(e) => setDiscountPrice(e.target.value)}
                        className={inputClass}
                    />
                </div>

                <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm text-gray-600">
                        Mô tả
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className={inputClass}
                    />
                </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                    type="checkbox"
                    checked={useVariants}
                    onChange={(e) => setUseVariants(e.target.checked)}
                    className="size-4 accent-[#ee4d2d]"
                />
                Tạo kèm variants (bỏ tồn kho cấp sản phẩm)
            </label>

            {!useVariants ? (
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-sm text-gray-600">
                            Số lượng tồn
                        </label>
                        <input
                            type="number"
                            min={0}
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm text-gray-600">
                            Kho
                        </label>
                        <input
                            value={warehouse}
                            onChange={(e) => setWarehouse(e.target.value)}
                            className={inputClass}
                            placeholder="HN-01"
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {variants.map((row, index) => (
                        <div
                            key={row.key}
                            className="grid gap-2 rounded-xl border border-gray-100 p-3 sm:grid-cols-5"
                        >
                            <input
                                placeholder="Tên"
                                value={row.name}
                                onChange={(e) =>
                                    setVariants((prev) =>
                                        prev.map((v, i) =>
                                            i === index
                                                ? { ...v, name: e.target.value }
                                                : v
                                        )
                                    )
                                }
                                className={inputClass}
                            />
                            <input
                                placeholder="SKU"
                                value={row.sku}
                                onChange={(e) =>
                                    setVariants((prev) =>
                                        prev.map((v, i) =>
                                            i === index
                                                ? { ...v, sku: e.target.value }
                                                : v
                                        )
                                    )
                                }
                                className={inputClass}
                            />
                            <input
                                type="number"
                                placeholder="Giá"
                                value={row.price}
                                onChange={(e) =>
                                    setVariants((prev) =>
                                        prev.map((v, i) =>
                                            i === index
                                                ? {
                                                      ...v,
                                                      price: e.target.value,
                                                  }
                                                : v
                                        )
                                    )
                                }
                                className={inputClass}
                            />
                            <input
                                type="number"
                                placeholder="SL"
                                value={row.quantity}
                                onChange={(e) =>
                                    setVariants((prev) =>
                                        prev.map((v, i) =>
                                            i === index
                                                ? {
                                                      ...v,
                                                      quantity: e.target.value,
                                                  }
                                                : v
                                        )
                                    )
                                }
                                className={inputClass}
                            />
                            <div className="flex gap-2">
                                <input
                                    placeholder="Kho"
                                    value={row.warehouse}
                                    onChange={(e) =>
                                        setVariants((prev) =>
                                            prev.map((v, i) =>
                                                i === index
                                                    ? {
                                                          ...v,
                                                          warehouse:
                                                              e.target.value,
                                                      }
                                                    : v
                                            )
                                        )
                                    }
                                    className={inputClass}
                                />
                                {variants.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setVariants((prev) =>
                                                prev.filter((_, i) => i !== index)
                                            )
                                        }
                                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() =>
                            setVariants((prev) => [
                                ...prev,
                                {
                                    key: `v${Date.now()}`,
                                    name: "",
                                    sku: "",
                                    price: "",
                                    quantity: "0",
                                    warehouse: "",
                                },
                            ])
                        }
                        className="inline-flex items-center gap-1 text-sm font-medium text-[#ee4d2d]"
                    >
                        <Plus className="size-4" />
                        Thêm variant
                    </button>
                </div>
            )}

            <div className="flex gap-3 border-t border-gray-100 pt-4">
                <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-[#ee4d2d] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
                >
                    {saving ? "Đang tạo..." : "Tạo sản phẩm"}
                </button>
                <button
                    type="button"
                    onClick={() => router.push("/admin/products")}
                    className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                    Hủy
                </button>
            </div>
        </form>
    );
}
