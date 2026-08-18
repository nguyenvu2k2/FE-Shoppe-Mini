"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { Minus, Plus, ShoppingCart } from "lucide-react";

import Price from "@/components/ui/price";
import ProductImage from "@/components/ui/product-image";
import type { ProductDetail, ProductVariant } from "@/lib/catalog.types";
import { useAuthStore } from "@/lib/auth-store";
import { useCartStore } from "@/lib/cart-store";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";

type ProductDetailViewProps = {
    product: ProductDetail;
};

function variantStock(variant: ProductVariant) {
    return variant.stock ?? variant.quantity ?? 0;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const addItem = useCartStore((s) => s.addItem);

    const variants = product.variants ?? [];
    const hasVariants = variants.length > 0;

    const images = useMemo(() => {
        const gallery = (product.images ?? []).map((img) => img.url);
        if (product.thumbnail) {
            return [product.thumbnail, ...gallery.filter((u) => u !== product.thumbnail)];
        }
        return gallery;
    }, [product.images, product.thumbnail]);

    const [activeImage, setActiveImage] = useState(0);
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
        hasVariants ? null : null
    );
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    const selectedVariant = variants.find((v) => v.id === selectedVariantId);

    const unitPrice = selectedVariant?.price ?? product.price;
    const discountPrice = selectedVariant ? null : product.discountPrice;

    const availableStock = hasVariants
        ? selectedVariant
            ? variantStock(selectedVariant)
            : 0
        : (product.stock ??
          product.inventory?.find((i) => !i.variantId)?.quantity ??
          0);

    const canAdd =
        availableStock > 0 &&
        quantity >= 1 &&
        quantity <= availableStock &&
        (!hasVariants || selectedVariantId != null);

    const handleAddToCart = async () => {
        if (hasVariants && selectedVariantId == null) {
            notify.error("Vui lòng chọn phân loại sản phẩm");
            return;
        }

        if (!user) {
            notify.info("Vui lòng đăng nhập để thêm vào giỏ hàng");
            router.push(
                `/login?callbackUrl=${encodeURIComponent(`/products/${product.slug}`)}`
            );
            return;
        }

        setAdding(true);
        try {
            await addItem({
                productId: product.id,
                quantity,
                ...(selectedVariantId != null
                    ? { variantId: selectedVariantId }
                    : {}),
            });
            notify.success("Đã thêm vào giỏ hàng");
        } catch (error) {
            const message =
                error instanceof AxiosError
                    ? (error.response?.data as { message?: string | string[] })
                          ?.message
                    : null;
            const text = Array.isArray(message)
                ? message.join(", ")
                : message || "Không thể thêm vào giỏ hàng";
            notify.error(text);
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
            {/* Gallery */}
            <div className="space-y-3">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
                    <ProductImage
                        src={images[activeImage]}
                        alt={product.name}
                        priority
                        sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                </div>
                {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {images.map((url, index) => (
                            <button
                                key={`${url}-${index}`}
                                type="button"
                                onClick={() => setActiveImage(index)}
                                className={cn(
                                    "relative size-16 shrink-0 overflow-hidden rounded-lg ring-2 transition",
                                    activeImage === index
                                        ? "ring-[#ee4d2d]"
                                        : "ring-transparent hover:ring-gray-300"
                                )}
                            >
                                <ProductImage
                                    src={url}
                                    alt={`${product.name} ${index + 1}`}
                                    sizes="64px"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="space-y-5">
                <div>
                    {product.category && (
                        <LinkCategory
                            slug={product.category.slug}
                            name={product.category.name}
                        />
                    )}
                    <h1 className="mt-1 text-xl font-semibold text-gray-900 sm:text-2xl">
                        {product.name}
                    </h1>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                        {product.ratingAvg != null && product.ratingAvg > 0 && (
                            <span>★ {Number(product.ratingAvg).toFixed(1)}</span>
                        )}
                        <span>Đã bán {product.soldCount ?? 0}</span>
                        <span>
                            Kho:{" "}
                            {hasVariants && !selectedVariant
                                ? "—"
                                : availableStock}
                        </span>
                    </div>
                </div>

                <div className="rounded-xl bg-[#fff8f6] px-4 py-3">
                    <Price
                        price={unitPrice}
                        discountPrice={discountPrice}
                        size="lg"
                    />
                </div>

                {hasVariants && (
                    <div>
                        <p className="mb-2 text-sm font-medium text-gray-700">
                            Phân loại
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {variants.map((variant) => {
                                const stock = variantStock(variant);
                                const disabled = stock <= 0;
                                return (
                                    <button
                                        key={variant.id}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => {
                                            setSelectedVariantId(variant.id);
                                            setQuantity(1);
                                        }}
                                        className={cn(
                                            "rounded-lg border px-3 py-2 text-sm transition",
                                            selectedVariantId === variant.id
                                                ? "border-[#ee4d2d] bg-[#fef6f5] text-[#ee4d2d]"
                                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
                                            disabled &&
                                                "cursor-not-allowed opacity-40 line-through"
                                        )}
                                    >
                                        {variant.name}
                                    </button>
                                );
                            })}
                        </div>
                        {selectedVariantId == null && (
                            <p className="mt-2 text-xs text-amber-600">
                                Chọn phân loại trước khi thêm vào giỏ
                            </p>
                        )}
                    </div>
                )}

                <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">
                        Số lượng
                    </p>
                    <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white">
                        <button
                            type="button"
                            aria-label="Giảm"
                            disabled={quantity <= 1}
                            onClick={() =>
                                setQuantity((q) => Math.max(1, q - 1))
                            }
                            className="px-3 py-2 text-gray-600 disabled:opacity-30"
                        >
                            <Minus className="size-4" />
                        </button>
                        <span className="min-w-10 text-center text-sm font-medium">
                            {quantity}
                        </span>
                        <button
                            type="button"
                            aria-label="Tăng"
                            disabled={
                                availableStock <= 0 ||
                                quantity >= availableStock
                            }
                            onClick={() =>
                                setQuantity((q) =>
                                    Math.min(availableStock || q, q + 1)
                                )
                            }
                            className="px-3 py-2 text-gray-600 disabled:opacity-30"
                        >
                            <Plus className="size-4" />
                        </button>
                    </div>
                </div>

                <button
                    type="button"
                    disabled={!canAdd || adding}
                    onClick={handleAddToCart}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ee4d2d] py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[220px]"
                >
                    <ShoppingCart className="size-4" />
                    {adding ? "Đang thêm..." : "Thêm vào giỏ"}
                </button>

                {product.description && (
                    <div className="border-t border-gray-100 pt-5">
                        <h2 className="mb-2 text-sm font-semibold text-gray-900">
                            Mô tả sản phẩm
                        </h2>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                            {product.description}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function LinkCategory({ slug, name }: { slug: string; name: string }) {
    return (
        <Link
            href={`/categories/${slug}`}
            className="text-xs font-medium text-[#ee4d2d] hover:underline"
        >
            {name}
        </Link>
    );
}
