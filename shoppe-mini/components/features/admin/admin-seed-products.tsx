"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import { getApiErrorMessage } from "@/lib/api-error";
import { DEMO_PRODUCTS } from "@/lib/demo-catalog";
import {
    DEMO_PRODUCT_IMAGES,
    fetchDemoImageFile,
} from "@/lib/demo-images";
import { slugify } from "@/lib/slugify";
import { notify } from "@/lib/toast";
import type { ManageProductItem } from "@/lib/catalog.types";
import { getCategories } from "@/services/category/category.service";
import {
    createProduct,
    getManageProducts,
    uploadProductThumbnail,
} from "@/services/product/product.service";

type SeedButtonProps = {
    onDone?: () => void;
};

async function listAllManageProducts() {
    const items: ManageProductItem[] = [];
    let page = 1;
    let totalPages = 1;
    do {
        const { data } = await getManageProducts({ page, limit: 50 });
        items.push(...((data.items as ManageProductItem[]) ?? []));
        totalPages = data.meta?.totalPages ?? 1;
        page += 1;
    } while (page <= totalPages);
    return items;
}

export default function AdminSeedProductsButton({ onDone }: SeedButtonProps) {
    const [running, setRunning] = useState(false);
    const [progress, setProgress] = useState("");

    const handleSeed = async () => {
        if (running) return;
        const ok = window.confirm(
            `Tạo ${DEMO_PRODUCTS.length} sản phẩm demo kèm ảnh? Sản phẩm đã có ảnh sẽ giữ nguyên.`
        );
        if (!ok) return;

        setRunning(true);
        setProgress("Đang tải danh sách...");
        try {
            const [{ data: categories }, existing] = await Promise.all([
                getCategories(),
                listAllManageProducts(),
            ]);
            const bySlug = new Map(
                (categories ?? []).map((c) => [c.slug, c.id])
            );
            const byName = new Map(
                existing.map((p) => [p.name.trim().toLowerCase(), p])
            );

            let created = 0;
            let imaged = 0;
            let skipped = 0;

            for (let i = 0; i < DEMO_PRODUCTS.length; i++) {
                const item = DEMO_PRODUCTS[i];
                setProgress(`${i + 1}/${DEMO_PRODUCTS.length} · ${item.name}`);

                const key = item.name.trim().toLowerCase();
                let product = byName.get(key);

                if (!product) {
                    const categoryId = bySlug.get(item.categorySlug);
                    if (!categoryId) {
                        skipped += 1;
                        continue;
                    }
                    const { data } = await createProduct({
                        categoryId,
                        name: item.name,
                        description: item.description,
                        price: item.price,
                        ...(item.discountPrice != null
                            ? { discountPrice: item.discountPrice }
                            : {}),
                        status: item.status,
                        warehouse: item.warehouse,
                        ...(item.variants?.length
                            ? { variants: item.variants }
                            : { quantity: item.quantity ?? 0 }),
                    });
                    product = data as ManageProductItem;
                    byName.set(key, product);
                    created += 1;
                }

                if (product.thumbnail) {
                    skipped += 1;
                    continue;
                }

                const photoId = DEMO_PRODUCT_IMAGES[item.name];
                if (!photoId || product.id == null) {
                    skipped += 1;
                    continue;
                }

                try {
                    const file = await fetchDemoImageFile(
                        photoId,
                        slugify(item.name) || "demo"
                    );
                    await uploadProductThumbnail(product.id, file);
                    imaged += 1;
                } catch (imageError) {
                    notify.error(
                        `${item.name}: ${getApiErrorMessage(imageError, "Upload ảnh thất bại")}`
                    );
                }
            }

            notify.success(
                `Demo: tạo ${created} SP, gắn ${imaged} ảnh` +
                    (skipped ? ` · bỏ qua ${skipped}` : "")
            );
            onDone?.();
        } catch (error) {
            notify.error(
                getApiErrorMessage(error, "Không seed được sản phẩm demo.")
            );
        } finally {
            setRunning(false);
            setProgress("");
        }
    };

    return (
        <button
            type="button"
            disabled={running}
            onClick={() => void handleSeed()}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#ee4d2d]/30 bg-white px-4 py-2 text-sm font-medium text-[#ee4d2d] hover:bg-[#fef6f5] disabled:opacity-50"
        >
            <Sparkles className="size-4" />
            {running
                ? progress || "Đang seed..."
                : `Seed ${DEMO_PRODUCTS.length} SP + ảnh`}
        </button>
    );
}
