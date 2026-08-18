"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import AccountShell from "@/components/features/account/account-shell";
import {
    OrderStatusBadge,
    PaymentStatusBadge,
} from "@/components/features/order/order-status-badge";
import EmptyState from "@/components/ui/empty-state";
import ProductImage from "@/components/ui/product-image";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatPrice } from "@/lib/format-price";
import { ORDER_STATUS_OPTIONS, formatDateTime } from "@/lib/order-ui";
import type { Order, OrderStatus } from "@/lib/order.types";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { getMyOrders } from "@/services/order/order.service";

export default function OrdersListView() {
    const searchParams = useSearchParams();
    const initialStatus = searchParams.get("status") as OrderStatus | null;

    const [status, setStatus] = useState<OrderStatus | "">(
        initialStatus &&
            ORDER_STATUS_OPTIONS.some((opt) => opt.value === initialStatus)
            ? initialStatus
            : ""
    );
    const [page, setPage] = useState(1);
    const [items, setItems] = useState<Order[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await getMyOrders({
                page,
                limit: 20,
                status: status || undefined,
            });
            setItems(data.items ?? []);
            setTotalPages(data.meta?.totalPages ?? 1);
        } catch (error) {
            notify.error(getApiErrorMessage(error, "Không tải được đơn hàng."));
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [page, status]);

    useEffect(() => {
        const id = window.setTimeout(() => {
            void load();
        }, 0);
        return () => window.clearTimeout(id);
    }, [load]);

    return (
        <AccountShell>
            <div className="rounded-sm bg-white px-6 py-5 shadow-sm ring-1 ring-black/[0.04]">
                <div className="flex items-start gap-3">
                    <span className="mt-1.5 h-5 w-1 shrink-0 rounded-full bg-[#ee4d2d]" />
                    <div>
                        <h1 className="text-xl font-normal text-[#333]">
                            Đơn Hàng Của Tôi
                        </h1>
                        <p className="mt-1 text-sm text-[#939393]">
                            Theo dõi và quản lý các đơn hàng đã đặt
                        </p>
                    </div>
                </div>
                <div className="mt-4 h-px bg-[#efefef]" />

                <div className="mt-4 flex gap-1 overflow-x-auto pb-1">
                    <FilterChip
                        active={status === ""}
                        onClick={() => {
                            setPage(1);
                            setStatus("");
                        }}
                    >
                        Tất cả
                    </FilterChip>
                    {ORDER_STATUS_OPTIONS.map((opt) => (
                        <FilterChip
                            key={opt.value}
                            active={status === opt.value}
                            onClick={() => {
                                setPage(1);
                                setStatus(opt.value);
                            }}
                        >
                            {opt.label}
                        </FilterChip>
                    ))}
                </div>

                {loading ? (
                    <div className="mt-6 space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-28 animate-pulse rounded-lg bg-gray-100"
                            />
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <EmptyState
                        title="Chưa có đơn hàng"
                        description="Đơn hàng sẽ hiện ở đây sau khi bạn thanh toán."
                        action={
                            <Link
                                href="/products"
                                className="inline-flex rounded-sm bg-[#ee4d2d] px-4 py-2 text-sm text-white hover:opacity-90"
                            >
                                Khám phá sản phẩm
                            </Link>
                        }
                    />
                ) : (
                    <ul className="mt-4 space-y-3">
                        {items.map((order) => (
                            <li key={order.id}>
                                <Link
                                    href={`/orders/${order.id}`}
                                    className="block rounded-lg border border-[#efefef] p-4 transition hover:border-[#ee4d2d]/40"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-sm font-medium text-[#333]">
                                            {order.orderCode}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            <OrderStatusBadge
                                                status={order.status}
                                            />
                                            <PaymentStatusBadge
                                                status={order.paymentStatus}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-3 flex gap-2 overflow-x-auto">
                                        {(order.items ?? []).slice(0, 4).map((item) => (
                                            <div
                                                key={item.id}
                                                className="relative size-12 shrink-0 overflow-hidden rounded bg-gray-100"
                                            >
                                                <ProductImage
                                                    src={item.thumbnail}
                                                    alt={item.productName}
                                                    sizes="48px"
                                                />
                                            </div>
                                        ))}
                                        {(order.items ?? []).length > 4 && (
                                            <span className="flex size-12 items-center justify-center rounded bg-gray-50 text-xs text-gray-500">
                                                +{(order.items ?? []).length - 4}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                                        <span className="text-[#999]">
                                            {formatDateTime(order.createdAt)}
                                        </span>
                                        <span className="font-medium text-[#ee4d2d]">
                                            {formatPrice(order.total)}
                                        </span>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}

                {totalPages > 1 && (
                    <div className="mt-5 flex items-center justify-center gap-2">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="rounded-sm border border-[#dbdbdb] px-3 py-1.5 text-sm disabled:opacity-40"
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
                            className="rounded-sm border border-[#dbdbdb] px-3 py-1.5 text-sm disabled:opacity-40"
                        >
                            Sau
                        </button>
                    </div>
                )}
            </div>
        </AccountShell>
    );
}

function FilterChip({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "shrink-0 rounded-sm px-3 py-1.5 text-sm transition",
                active
                    ? "bg-[#fef6f5] font-medium text-[#ee4d2d]"
                    : "text-[#555] hover:bg-gray-50"
            )}
        >
            {children}
        </button>
    );
}
