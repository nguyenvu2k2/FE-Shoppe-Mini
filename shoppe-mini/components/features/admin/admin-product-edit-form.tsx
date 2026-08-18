"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

import ProductImage from "@/components/ui/product-image";
import { getApiErrorMessage } from "@/lib/api-error";
import { slugify } from "@/lib/slugify";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type {
    Category,
    ProductDetail,
    ProductStatus,
} from "@/lib/catalog.types";
import { getCategories } from "@/services/category/category.service";
import {
    createProductVariant,
    deleteProductImage,
    deleteProductVariant,
    getProductByIdOrSlug,
    updateProduct,
    updateProductInventory,
    updateProductVariant,
    uploadProductImage,
    uploadProductThumbnail,
} from "@/services/product/product.service";

const inputClass =
    "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#ee4d2d] focus:ring-2 focus:ring-[#ee4d2d]/15";

type Tab = "info" | "images" | "variants" | "inventory";

export default function AdminProductEditForm({
    productId,
}: {
    productId: number;
}) {
    const router = useRouter();
    const [tab, setTab] = useState<Tab>("info");
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [categoryId, setCategoryId] = useState("");
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [discountPrice, setDiscountPrice] = useState("");
    const [status, setStatus] = useState<ProductStatus>("DRAFT");

    const [invQty, setInvQty] = useState("0");
    const [invWarehouse, setInvWarehouse] = useState("");

    const [vName, setVName] = useState("");
    const [vSku, setVSku] = useState("");
    const [vPrice, setVPrice] = useState("");
    const [vQty, setVQty] = useState("0");
    const [vWarehouse, setVWarehouse] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [{ data }, cats] = await Promise.all([
                getProductByIdOrSlug(productId),
                getCategories().catch(() => ({ data: [] as Category[] })),
            ]);
            setProduct(data);
            setCategories(cats.data ?? []);
            setCategoryId(String(data.categoryId ?? data.category?.id ?? ""));
            setName(data.name);
            setSlug(data.slug);
            setDescription(data.description ?? "");
            setPrice(String(data.price ?? ""));
            setDiscountPrice(
                data.discountPrice != null ? String(data.discountPrice) : ""
            );
            setStatus((data.status as ProductStatus) || "DRAFT");

            const baseInv = data.inventory?.find((i) => !i.variantId);
            setInvQty(String(baseInv?.quantity ?? data.stock ?? 0));
            setInvWarehouse(baseInv?.warehouse ?? "");
        } catch (error) {
            notify.error(
                getApiErrorMessage(error, "Không tải được sản phẩm.")
            );
            setProduct(null);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        void load();
    }, [load]);

    const hasVariants = (product?.variants?.length ?? 0) > 0;

    const saveInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await updateProduct(productId, {
                categoryId: Number(categoryId),
                name: name.trim(),
                slug: slug.trim() || slugify(name),
                description: description.trim(),
                price: Number(price),
                discountPrice: discountPrice ? Number(discountPrice) : null,
                status,
            });
            setProduct(data);
            notify.success("Đã lưu thông tin sản phẩm");
        } catch (error) {
            notify.error(getApiErrorMessage(error, "Không lưu được."));
        } finally {
            setSaving(false);
        }
    };

    const onThumbnail = async (file: File) => {
        try {
            const { data } = await uploadProductThumbnail(productId, file);
            setProduct(data);
            notify.success("Đã cập nhật ảnh đại diện");
        } catch (error) {
            notify.error(getApiErrorMessage(error, "Upload thumbnail thất bại"));
            await load();
        }
    };

    const onGallery = async (file: File) => {
        try {
            const { data } = await uploadProductImage(productId, file);
            setProduct(data);
            notify.success("Đã thêm ảnh gallery");
        } catch (error) {
            notify.error(getApiErrorMessage(error, "Upload ảnh thất bại"));
            await load();
        }
    };

    const onDeleteImage = async (imageId: number) => {
        if (!window.confirm("Xóa ảnh này?")) return;
        try {
            await deleteProductImage(productId, imageId);
            notify.success("Đã xóa ảnh");
            await load();
        } catch (error) {
            notify.error(getApiErrorMessage(error, "Không xóa được ảnh"));
        }
    };

    const onAddVariant = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await createProductVariant(productId, {
                name: vName.trim(),
                sku: vSku.trim(),
                price: Number(vPrice),
                quantity: Number(vQty) || 0,
                warehouse: vWarehouse.trim() || undefined,
            });
            notify.success("Đã thêm variant");
            setVName("");
            setVSku("");
            setVPrice("");
            setVQty("0");
            setVWarehouse("");
            await load();
        } catch (error) {
            notify.error(getApiErrorMessage(error, "Không thêm được variant"));
        } finally {
            setSaving(false);
        }
    };

    const onUpdateVariant = async (
        variantId: number,
        patch: { name: string; sku: string; price: number }
    ) => {
        try {
            await updateProductVariant(productId, variantId, patch);
            notify.success("Đã cập nhật variant");
            await load();
        } catch (error) {
            notify.error(
                getApiErrorMessage(error, "Không cập nhật được variant")
            );
        }
    };

    const onDeleteVariant = async (variantId: number) => {
        if (
            !window.confirm(
                "Xóa variant? Nếu xóa hết, hệ thống tạo lại inventory cấp product."
            )
        ) {
            return;
        }
        try {
            await deleteProductVariant(productId, variantId);
            notify.success("Đã xóa variant");
            await load();
        } catch (error) {
            notify.error(getApiErrorMessage(error, "Không xóa được variant"));
        }
    };

    const onSaveInventory = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (hasVariants) {
                notify.error("Chọn variant và cập nhật tồn trong bảng bên dưới");
                setSaving(false);
                return;
            }
            await updateProductInventory(productId, {
                quantity: Number(invQty) || 0,
                warehouse: invWarehouse.trim() || undefined,
            });
            notify.success("Đã cập nhật tồn kho");
            await load();
        } catch (error) {
            notify.error(
                getApiErrorMessage(error, "Không cập nhật được tồn kho")
            );
        } finally {
            setSaving(false);
        }
    };

    const onSaveVariantInventory = async (
        variantId: number,
        quantity: number,
        warehouse?: string
    ) => {
        try {
            await updateProductInventory(productId, {
                variantId,
                quantity,
                warehouse: warehouse || undefined,
            });
            notify.success("Đã cập nhật tồn variant");
            await load();
        } catch (error) {
            notify.error(
                getApiErrorMessage(error, "Không cập nhật được tồn kho")
            );
        }
    };

    if (loading) {
        return (
            <div className="h-64 animate-pulse rounded-2xl bg-gray-200" />
        );
    }

    if (!product) {
        return (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                <p className="text-sm text-gray-600">
                    Không tìm thấy sản phẩm (có thể DRAFT chưa public được GET
                    theo id — thử lại hoặc tạo mới).
                </p>
                <Link
                    href="/admin/products"
                    className="mt-4 inline-block text-sm text-[#ee4d2d]"
                >
                    ← Danh sách sản phẩm
                </Link>
            </div>
        );
    }

    const tabs: Array<{ id: Tab; label: string }> = [
        { id: "info", label: "Thông tin" },
        { id: "images", label: "Ảnh" },
        { id: "variants", label: "Variants" },
        { id: "inventory", label: "Tồn kho" },
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <Link
                        href="/admin/products"
                        className="text-sm text-gray-500 hover:text-[#ee4d2d]"
                    >
                        ← Sản phẩm
                    </Link>
                    <h1 className="mt-1 text-xl font-semibold text-gray-900">
                        {product.name}
                    </h1>
                </div>
                <button
                    type="button"
                    onClick={() => router.push(`/products/${product.slug}`)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                    Xem trên store
                </button>
            </div>

            <div className="flex gap-1 overflow-x-auto rounded-xl bg-white p-1 shadow-sm ring-1 ring-black/[0.04]">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        className={cn(
                            "rounded-lg px-4 py-2 text-sm transition",
                            tab === t.id
                                ? "bg-[#fef6f5] font-medium text-[#ee4d2d]"
                                : "text-gray-600 hover:bg-gray-50"
                        )}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/[0.04]">
                {tab === "info" && (
                    <form onSubmit={saveInfo} className="grid max-w-3xl gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="mb-1.5 block text-sm text-gray-600">
                                Danh mục
                            </label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className={inputClass}
                                required
                            >
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="mb-1.5 block text-sm text-gray-600">
                                Tên
                            </label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
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
                                onChange={(e) => setSlug(e.target.value)}
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
                                Giá
                            </label>
                            <input
                                type="number"
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
                                value={discountPrice}
                                onChange={(e) =>
                                    setDiscountPrice(e.target.value)
                                }
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
                        <div className="sm:col-span-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-lg bg-[#ee4d2d] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                            >
                                {saving ? "Đang lưu..." : "Lưu thông tin"}
                            </button>
                        </div>
                    </form>
                )}

                {tab === "images" && (
                    <div className="space-y-6">
                        <div>
                            <p className="mb-2 text-sm font-medium text-gray-800">
                                Ảnh đại diện
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="relative size-28 overflow-hidden rounded-xl bg-gray-100">
                                    <ProductImage
                                        src={product.thumbnail}
                                        alt={product.name}
                                        sizes="112px"
                                    />
                                </div>
                                <label className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50">
                                    Đổi thumbnail
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            e.target.value = "";
                                            if (file) void onThumbnail(file);
                                        }}
                                    />
                                </label>
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-800">
                                    Gallery
                                </p>
                                <label className="cursor-pointer text-sm font-medium text-[#ee4d2d]">
                                    + Thêm ảnh
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            e.target.value = "";
                                            if (file) void onGallery(file);
                                        }}
                                    />
                                </label>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {(product.images ?? []).length === 0 && (
                                    <p className="text-sm text-gray-500">
                                        Chưa có ảnh gallery
                                    </p>
                                )}
                                {(product.images ?? []).map((img) => (
                                    <div
                                        key={img.id}
                                        className="group relative size-24 overflow-hidden rounded-xl bg-gray-100"
                                    >
                                        <ProductImage
                                            src={img.url}
                                            alt=""
                                            sizes="96px"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                void onDeleteImage(img.id)
                                            }
                                            className="absolute top-1 right-1 rounded bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {tab === "variants" && (
                    <div className="space-y-6">
                        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100">
                            {(product.variants ?? []).length === 0 && (
                                <li className="px-4 py-6 text-sm text-gray-500">
                                    Chưa có variant. Thêm variant đầu tiên sẽ bỏ
                                    inventory cấp product.
                                </li>
                            )}
                            {(product.variants ?? []).map((variant) => (
                                <VariantEditRow
                                    key={variant.id}
                                    variant={variant}
                                    onSave={(patch) =>
                                        void onUpdateVariant(variant.id, patch)
                                    }
                                    onDelete={() =>
                                        void onDeleteVariant(variant.id)
                                    }
                                />
                            ))}
                        </ul>

                        <form
                            onSubmit={onAddVariant}
                            className="grid gap-2 rounded-xl border border-dashed border-gray-200 p-4 sm:grid-cols-5"
                        >
                            <input
                                placeholder="Tên"
                                value={vName}
                                onChange={(e) => setVName(e.target.value)}
                                className={inputClass}
                                required
                            />
                            <input
                                placeholder="SKU"
                                value={vSku}
                                onChange={(e) => setVSku(e.target.value)}
                                className={inputClass}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Giá"
                                value={vPrice}
                                onChange={(e) => setVPrice(e.target.value)}
                                className={inputClass}
                                required
                            />
                            <input
                                type="number"
                                placeholder="SL"
                                value={vQty}
                                onChange={(e) => setVQty(e.target.value)}
                                className={inputClass}
                            />
                            <div className="flex gap-2">
                                <input
                                    placeholder="Kho"
                                    value={vWarehouse}
                                    onChange={(e) =>
                                        setVWarehouse(e.target.value)
                                    }
                                    className={inputClass}
                                />
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="shrink-0 rounded-lg bg-[#ee4d2d] px-3 text-white"
                                >
                                    <Plus className="size-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {tab === "inventory" && (
                    <div className="space-y-4">
                        {!hasVariants ? (
                            <form
                                onSubmit={onSaveInventory}
                                className="grid max-w-md gap-4 sm:grid-cols-2"
                            >
                                <div>
                                    <label className="mb-1.5 block text-sm text-gray-600">
                                        Số lượng
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={invQty}
                                        onChange={(e) =>
                                            setInvQty(e.target.value)
                                        }
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm text-gray-600">
                                        Kho
                                    </label>
                                    <input
                                        value={invWarehouse}
                                        onChange={(e) =>
                                            setInvWarehouse(e.target.value)
                                        }
                                        className={inputClass}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="rounded-lg bg-[#ee4d2d] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                                    >
                                        Lưu tồn kho
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <ul className="space-y-3">
                                {(product.variants ?? []).map((variant) => {
                                    const inv = product.inventory?.find(
                                        (i) => i.variantId === variant.id
                                    );
                                    return (
                                        <VariantInventoryRow
                                            key={variant.id}
                                            name={variant.name}
                                            initialQty={
                                                inv?.quantity ??
                                                variant.quantity ??
                                                variant.stock ??
                                                0
                                            }
                                            initialWarehouse={
                                                inv?.warehouse ??
                                                variant.warehouse ??
                                                ""
                                            }
                                            onSave={(qty, warehouse) =>
                                                void onSaveVariantInventory(
                                                    variant.id,
                                                    qty,
                                                    warehouse
                                                )
                                            }
                                        />
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function VariantEditRow({
    variant,
    onSave,
    onDelete,
}: {
    variant: {
        id: number;
        name: string;
        sku: string;
        price: number;
    };
    onSave: (patch: { name: string; sku: string; price: number }) => void;
    onDelete: () => void;
}) {
    const [name, setName] = useState(variant.name);
    const [sku, setSku] = useState(variant.sku);
    const [price, setPrice] = useState(String(variant.price));

    useEffect(() => {
        setName(variant.name);
        setSku(variant.sku);
        setPrice(String(variant.price));
    }, [variant]);

    return (
        <li className="grid gap-2 px-3 py-3 sm:grid-cols-[1fr_1fr_120px_auto]">
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
            />
            <input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className={inputClass}
            />
            <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={inputClass}
            />
            <div className="flex gap-1">
                <button
                    type="button"
                    onClick={() =>
                        onSave({
                            name: name.trim(),
                            sku: sku.trim(),
                            price: Number(price),
                        })
                    }
                    className="rounded-lg bg-gray-900 px-3 py-2 text-xs text-white"
                >
                    Lưu
                </button>
                <button
                    type="button"
                    onClick={onDelete}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                >
                    <Trash2 className="size-4" />
                </button>
            </div>
        </li>
    );
}

function VariantInventoryRow({
    name,
    initialQty,
    initialWarehouse,
    onSave,
}: {
    name: string;
    initialQty: number;
    initialWarehouse: string;
    onSave: (qty: number, warehouse: string) => void;
}) {
    const [qty, setQty] = useState(String(initialQty));
    const [warehouse, setWarehouse] = useState(initialWarehouse);

    useEffect(() => {
        setQty(String(initialQty));
        setWarehouse(initialWarehouse);
    }, [initialQty, initialWarehouse]);

    return (
        <li className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-100 p-3">
            <div className="min-w-[120px] flex-1">
                <p className="text-sm font-medium text-gray-800">{name}</p>
            </div>
            <div>
                <label className="mb-1 block text-xs text-gray-500">SL</label>
                <input
                    type="number"
                    min={0}
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className={cn(inputClass, "w-28")}
                />
            </div>
            <div>
                <label className="mb-1 block text-xs text-gray-500">Kho</label>
                <input
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                    className={cn(inputClass, "w-36")}
                />
            </div>
            <button
                type="button"
                onClick={() => onSave(Number(qty) || 0, warehouse.trim())}
                className="rounded-lg bg-[#ee4d2d] px-4 py-2 text-sm text-white"
            >
                Lưu
            </button>
        </li>
    );
}
