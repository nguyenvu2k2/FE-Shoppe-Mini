"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ImagePlus, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";

import ProductImage from "@/components/ui/product-image";
import EmptyState from "@/components/ui/empty-state";
import { getApiErrorMessage } from "@/lib/api-error";
import {
    DEMO_CATEGORY_IMAGES,
    fetchDemoImageFile,
} from "@/lib/demo-images";
import { slugify } from "@/lib/slugify";
import { useCan } from "@/lib/use-can";
import { notify } from "@/lib/toast";
import type { Category } from "@/lib/catalog.types";
import {
    createCategory,
    deleteCategory,
    getCategoryTree,
    updateCategory,
    uploadCategoryImage,
} from "@/services/category/category.service";

type FlatCategory = Category & { depth: number };

function flattenTree(nodes: Category[], depth = 0): FlatCategory[] {
    const result: FlatCategory[] = [];
    for (const node of nodes) {
        result.push({ ...node, depth, children: undefined });
        if (node.children?.length) {
            result.push(...flattenTree(node.children, depth + 1));
        }
    }
    return result;
}

type FormState = {
    name: string;
    slug: string;
    parentId: string;
    autoSlug: boolean;
};

const emptyForm: FormState = {
    name: "",
    slug: "",
    parentId: "",
    autoSlug: true,
};

export default function AdminCategoriesManager() {
    const canCreate = useCan("category:create");
    const canUpdate = useCan("category:update");
    const canDelete = useCan("category:delete");

    const [tree, setTree] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mode, setMode] = useState<"list" | "create" | "edit">("list");
    const [editing, setEditing] = useState<Category | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [uploadingId, setUploadingId] = useState<number | null>(null);
    const [seedingImages, setSeedingImages] = useState(false);

    const flat = useMemo(() => flattenTree(tree), [tree]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await getCategoryTree();
            setTree(data ?? []);
        } catch (error) {
            notify.error(
                getApiErrorMessage(error, "Không tải được danh mục.")
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setMode("create");
    };

    const openEdit = (category: Category) => {
        setEditing(category);
        setForm({
            name: category.name,
            slug: category.slug,
            parentId: category.parentId ? String(category.parentId) : "",
            autoSlug: false,
        });
        setMode("edit");
    };

    const closeForm = () => {
        setMode("list");
        setEditing(null);
        setForm(emptyForm);
    };

    const parentOptions = flat.filter((c) => c.id !== editing?.id);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            notify.error("Vui lòng nhập tên danh mục");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: form.name.trim(),
                slug: form.slug.trim() || undefined,
                parentId: form.parentId ? Number(form.parentId) : null,
            };

            if (mode === "edit" && editing) {
                await updateCategory(editing.id, payload);
                notify.success("Cập nhật danh mục thành công");
            } else {
                await createCategory({
                    name: payload.name,
                    slug: payload.slug,
                    parentId: payload.parentId ?? undefined,
                });
                notify.success("Tạo danh mục thành công");
            }
            await load();
            closeForm();
        } catch (error) {
            notify.error(
                getApiErrorMessage(error, "Không lưu được danh mục.")
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (category: Category) => {
        if (
            !window.confirm(
                `Xóa danh mục "${category.name}"? (Không xóa được nếu còn danh mục con hoặc sản phẩm)`
            )
        ) {
            return;
        }
        try {
            await deleteCategory(category.id);
            notify.success("Đã xóa danh mục");
            await load();
        } catch (error) {
            notify.error(
                getApiErrorMessage(
                    error,
                    "Không xóa được. Có thể còn children hoặc products."
                )
            );
        }
    };

    const handleSeedImages = async () => {
        const targets = flat.filter(
            (c) => DEMO_CATEGORY_IMAGES[c.slug] && !c.image
        );
        if (targets.length === 0) {
            notify.info("Các danh mục đã có ảnh hoặc chưa map ảnh demo.");
            return;
        }
        if (
            !window.confirm(
                `Gắn ảnh Unsplash cho ${targets.length} danh mục còn thiếu ảnh?`
            )
        ) {
            return;
        }

        setSeedingImages(true);
        let ok = 0;
        try {
            for (const category of targets) {
                const photoId = DEMO_CATEGORY_IMAGES[category.slug];
                const file = await fetchDemoImageFile(photoId, category.slug);
                await uploadCategoryImage(category.id, file);
                ok += 1;
            }
            notify.success(`Đã gắn ảnh cho ${ok} danh mục.`);
            await load();
        } catch (error) {
            notify.error(
                getApiErrorMessage(error, "Không gắn được ảnh danh mục.")
            );
        } finally {
            setSeedingImages(false);
        }
    };

    const handleImage = async (category: Category, file: File) => {
        setUploadingId(category.id);
        try {
            await uploadCategoryImage(category.id, file);
            notify.success("Đã cập nhật ảnh danh mục");
            await load();
        } catch (error) {
            notify.error(
                getApiErrorMessage(error, "Upload ảnh thất bại.")
            );
        } finally {
            setUploadingId(null);
        }
    };

    if (loading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-14 animate-pulse rounded-xl bg-gray-200"
                    />
                ))}
            </div>
        );
    }

    if (mode !== "list") {
        return (
            <div className="max-w-xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/[0.04]">
                <h2 className="text-lg font-semibold text-gray-900">
                    {mode === "edit" ? "Sửa danh mục" : "Tạo danh mục"}
                </h2>
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm text-gray-600">
                            Tên
                        </label>
                        <input
                            value={form.name}
                            onChange={(e) => {
                                const name = e.target.value;
                                setForm((prev) => ({
                                    ...prev,
                                    name,
                                    slug: prev.autoSlug
                                        ? slugify(name)
                                        : prev.slug,
                                }));
                            }}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#ee4d2d] focus:ring-2 focus:ring-[#ee4d2d]/15"
                            placeholder="Thời trang nam"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm text-gray-600">
                            Slug (tuỳ chọn)
                        </label>
                        <input
                            value={form.slug}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    slug: e.target.value,
                                    autoSlug: false,
                                }))
                            }
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#ee4d2d] focus:ring-2 focus:ring-[#ee4d2d]/15"
                            placeholder="thoi-trang-nam"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm text-gray-600">
                            Danh mục cha
                        </label>
                        <select
                            value={form.parentId}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    parentId: e.target.value,
                                }))
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#ee4d2d]"
                        >
                            <option value="">— Root (không có cha) —</option>
                            {parentOptions.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {"—".repeat(c.depth)} {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-[#ee4d2d] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
                        >
                            {saving ? "Đang lưu..." : "Lưu"}
                        </button>
                        <button
                            type="button"
                            onClick={closeForm}
                            className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-500">
                    {flat.length} danh mục (cây)
                </p>
                <div className="flex flex-wrap gap-2">
                    {canUpdate && (
                        <button
                            type="button"
                            disabled={seedingImages}
                            onClick={() => void handleSeedImages()}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#ee4d2d]/30 bg-white px-4 py-2 text-sm font-medium text-[#ee4d2d] hover:bg-[#fef6f5] disabled:opacity-50"
                        >
                            <Sparkles className="size-4" />
                            {seedingImages
                                ? "Đang gắn ảnh..."
                                : "Gắn ảnh 3 danh mục"}
                        </button>
                    )}
                    {canCreate && (
                        <button
                            type="button"
                            onClick={openCreate}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#ee4d2d] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                        >
                            <Plus className="size-4" />
                            Tạo danh mục
                        </button>
                    )}
                </div>
            </div>

            {flat.length === 0 ? (
                <EmptyState
                    title="Chưa có danh mục"
                    description="Tạo danh mục đầu tiên để gắn sản phẩm."
                    action={
                        canCreate ? (
                            <button
                                type="button"
                                onClick={openCreate}
                                className="rounded-lg bg-[#ee4d2d] px-4 py-2 text-sm text-white"
                            >
                                Tạo danh mục
                            </button>
                        ) : undefined
                    }
                />
            ) : (
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
                    <ul className="divide-y divide-gray-100">
                        {flat.map((category) => (
                            <li
                                key={category.id}
                                className="flex flex-wrap items-center gap-3 px-4 py-3"
                                style={{ paddingLeft: 16 + category.depth * 20 }}
                            >
                                <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                    <ProductImage
                                        src={category.image}
                                        alt={category.name}
                                        sizes="40px"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-gray-900">
                                        {category.name}
                                    </p>
                                    <p className="truncate text-xs text-gray-400">
                                        /{category.slug}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    {canUpdate && (
                                        <>
                                            <label className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-50 hover:text-[#ee4d2d]">
                                                <ImagePlus className="size-4" />
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                                    className="hidden"
                                                    disabled={
                                                        uploadingId ===
                                                        category.id
                                                    }
                                                    onChange={(e) => {
                                                        const file =
                                                            e.target.files?.[0];
                                                        e.target.value = "";
                                                        if (file)
                                                            void handleImage(
                                                                category,
                                                                file
                                                            );
                                                    }}
                                                />
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openEdit(category)
                                                }
                                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-50 hover:text-[#ee4d2d]"
                                            >
                                                <Pencil className="size-4" />
                                            </button>
                                        </>
                                    )}
                                    {canDelete && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                void handleDelete(category)
                                            }
                                            className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
