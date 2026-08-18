"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";
import {
    AlertTriangle,
    Minus,
    Plus,
    ShoppingBag,
    Trash2,
} from "lucide-react";

import EmptyState from "@/components/ui/empty-state";
import Price from "@/components/ui/price";
import ProductImage from "@/components/ui/product-image";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format-price";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { CartItem } from "@/lib/cart.types";

function apiErrorMessage(error: unknown, fallback: string) {
    if (error instanceof AxiosError) {
        const message = (
            error.response?.data as { message?: string | string[] }
        )?.message;
        if (Array.isArray(message)) return message.join(", ");
        if (typeof message === "string") return message;
    }
    return fallback;
}

function CartItemRow({
    item,
    busyId,
    onUpdate,
    onRemove,
}: {
    item: CartItem;
    busyId: number | null;
    onUpdate: (itemId: number, quantity: number) => Promise<void>;
    onRemove: (itemId: number) => Promise<void>;
}) {
    const busy = busyId === item.id;
    const maxStock = Math.max(item.availableStock, 0);
    const name = item.product?.name ?? `Sản phẩm #${item.productId}`;
    const slug = item.product?.slug;
    const thumb = item.product?.thumbnail;

    return (
        <article
            className={cn(
                "flex gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/[0.04] sm:gap-4 sm:p-4",
                !item.isAvailable && "opacity-90"
            )}
        >
            <Link
                href={slug ? `/products/${slug}` : "/products"}
                className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:size-24"
            >
                <ProductImage src={thumb} alt={name} sizes="96px" />
            </Link>

            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <Link
                            href={slug ? `/products/${slug}` : "/products"}
                            className="line-clamp-2 text-sm font-medium text-gray-900 hover:text-[#ee4d2d]"
                        >
                            {name}
                        </Link>
                        {item.variant && (
                            <p className="mt-0.5 text-xs text-gray-500">
                                Phân loại: {item.variant.name}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => void onRemove(item.id)}
                        className="shrink-0 rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                        aria-label="Xóa sản phẩm"
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>

                {!item.isAvailable && (
                    <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-amber-700">
                        <AlertTriangle className="size-3.5" />
                        Hết hàng hoặc không đủ số lượng
                    </p>
                )}

                <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                    <Price price={item.unitPrice} size="sm" />

                    <div className="flex items-center gap-3">
                        <div className="inline-flex items-center rounded-lg border border-gray-200">
                            <button
                                type="button"
                                disabled={busy || item.quantity <= 1}
                                onClick={() =>
                                    void onUpdate(item.id, item.quantity - 1)
                                }
                                className="px-2.5 py-1.5 text-gray-600 disabled:opacity-30"
                                aria-label="Giảm số lượng"
                            >
                                <Minus className="size-3.5" />
                            </button>
                            <span className="min-w-8 text-center text-sm font-medium">
                                {item.quantity}
                            </span>
                            <button
                                type="button"
                                disabled={
                                    busy ||
                                    !item.isAvailable ||
                                    item.quantity >= maxStock
                                }
                                onClick={() =>
                                    void onUpdate(item.id, item.quantity + 1)
                                }
                                className="px-2.5 py-1.5 text-gray-600 disabled:opacity-30"
                                aria-label="Tăng số lượng"
                            >
                                <Plus className="size-3.5" />
                            </button>
                        </div>
                        <p className="min-w-[72px] text-right text-sm font-semibold text-[#ee4d2d]">
                            {formatPrice(item.lineTotal)}
                        </p>
                    </div>
                </div>
            </div>
        </article>
    );
}

export default function CartView() {
    const cart = useCartStore((s) => s.cart);
    const isLoading = useCartStore((s) => s.isLoading);
    const fetchCart = useCartStore((s) => s.fetchCart);
    const updateItemQuantity = useCartStore((s) => s.updateItemQuantity);
    const removeItem = useCartStore((s) => s.removeItem);
    const clearAll = useCartStore((s) => s.clearAll);

    const [busyId, setBusyId] = useState<number | null>(null);
    const [clearing, setClearing] = useState(false);

    useEffect(() => {
        void fetchCart();
    }, [fetchCart]);

    const handleUpdate = useCallback(
        async (itemId: number, quantity: number) => {
            if (quantity < 1) return;
            setBusyId(itemId);
            try {
                await updateItemQuantity(itemId, quantity);
            } catch (error) {
                notify.error(
                    apiErrorMessage(error, "Không cập nhật được số lượng")
                );
            } finally {
                setBusyId(null);
            }
        },
        [updateItemQuantity]
    );

    const handleRemove = useCallback(
        async (itemId: number) => {
            if (!window.confirm("Xóa sản phẩm này khỏi giỏ hàng?")) return;
            setBusyId(itemId);
            try {
                await removeItem(itemId);
                notify.success("Đã xóa khỏi giỏ hàng");
            } catch (error) {
                notify.error(apiErrorMessage(error, "Không xóa được sản phẩm"));
            } finally {
                setBusyId(null);
            }
        },
        [removeItem]
    );

    const handleClear = async () => {
        if (!cart?.items?.length) return;
        if (!window.confirm("Xóa toàn bộ sản phẩm trong giỏ hàng?")) return;
        setClearing(true);
        try {
            await clearAll();
            notify.success("Đã xóa toàn bộ giỏ hàng");
        } catch (error) {
            notify.error(apiErrorMessage(error, "Không xóa được giỏ hàng"));
        } finally {
            setClearing(false);
        }
    };

    if (isLoading && !cart) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-28 animate-pulse rounded-xl bg-gray-200"
                    />
                ))}
            </div>
        );
    }

    const items = cart?.items ?? [];
    const summary = cart?.summary;

    if (items.length === 0) {
        return (
            <EmptyState
                title="Giỏ hàng trống"
                description="Thêm sản phẩm từ trang chi tiết để bắt đầu mua sắm."
                action={
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#ee4d2d] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
                    >
                        <ShoppingBag className="size-4" />
                        Tiếp tục mua sắm
                    </Link>
                }
            />
        );
    }

    const unavailableCount = items.filter((i) => !i.isAvailable).length;
    const availableItemCount = summary?.availableItemCount ?? 0;
    const canCheckout = availableItemCount > 0 && unavailableCount === 0;

    return (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-gray-500">
                        {summary?.itemCount ?? items.length} sản phẩm
                        {unavailableCount > 0 && (
                            <span className="ml-2 text-amber-600">
                                · {unavailableCount} không khả dụng
                            </span>
                        )}
                    </p>
                    <button
                        type="button"
                        disabled={clearing}
                        onClick={() => void handleClear()}
                        className="text-sm text-gray-500 transition hover:text-red-600 disabled:opacity-40"
                    >
                        Xóa tất cả
                    </button>
                </div>

                {items.map((item) => (
                    <CartItemRow
                        key={item.id}
                        item={item}
                        busyId={busyId}
                        onUpdate={handleUpdate}
                        onRemove={handleRemove}
                    />
                ))}
            </div>

            <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04] lg:sticky lg:top-24">
                <h2 className="text-base font-semibold text-gray-900">
                    Tóm tắt đơn
                </h2>
                <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                        <dt>Tổng số lượng</dt>
                        <dd>{summary?.totalQuantity ?? 0}</dd>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <dt>Sản phẩm khả dụng</dt>
                        <dd>{summary?.availableItemCount ?? 0}</dd>
                    </div>
                    <div className="flex justify-between border-t border-gray-100 pt-3 text-base">
                        <dt className="font-medium text-gray-900">Tạm tính</dt>
                        <dd className="font-semibold text-[#ee4d2d]">
                            {formatPrice(summary?.subtotal ?? 0)}
                        </dd>
                    </div>
                </dl>

                {unavailableCount > 0 && (
                    <p className="mt-3 text-xs text-amber-700">
                        Vui lòng xóa sản phẩm hết hàng trước khi thanh toán.
                    </p>
                )}
                {availableItemCount === 0 && (
                    <p className="mt-3 text-xs text-amber-700">
                        Không có sản phẩm khả dụng để thanh toán.
                    </p>
                )}

                {canCheckout ? (
                    <Link
                        href="/checkout"
                        className="mt-5 block w-full rounded-xl bg-[#ee4d2d] py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
                    >
                        Thanh toán
                    </Link>
                ) : (
                    <button
                        type="button"
                        disabled
                        className="mt-5 w-full cursor-not-allowed rounded-xl bg-gray-200 py-3 text-sm font-semibold text-gray-500"
                    >
                        Thanh toán
                    </button>
                )}
                <Link
                    href="/products"
                    className="mt-3 block text-center text-sm font-medium text-[#ee4d2d] hover:underline"
                >
                    Tiếp tục mua sắm
                </Link>
            </aside>
        </div>
    );
}
