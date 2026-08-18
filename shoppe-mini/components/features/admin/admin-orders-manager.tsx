"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";

import {
    OrderStatusBadge,
    PaymentStatusBadge,
} from "@/components/features/order/order-status-badge";
import EmptyState from "@/components/ui/empty-state";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatPrice } from "@/lib/format-price";
import {
    ORDER_STATUS_OPTIONS,
    PAYMENT_STATUS_OPTIONS,
    formatDateTime,
    paymentMethodLabel,
} from "@/lib/order-ui";
import type { Order, OrderStatus, PaymentStatus } from "@/lib/order.types";
import { notify } from "@/lib/toast";
import { useCan } from "@/lib/use-can";
import { getManageOrders } from "@/services/order/order.service";

export default function AdminOrdersManager() {
    const canRead = useCan("order:read");
    const [items, setItems] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [status, setStatus] = useState<"" | OrderStatus>("");
    const [paymentStatus, setPaymentStatus] = useState<"" | PaymentStatus>("");
    const [orderCodeInput, setOrderCodeInput] = useState("");
    const [userIdInput, setUserIdInput] = useState("");
    const [orderCode, setOrderCode] = useState("");
    const [userId, setUserId] = useState<number | undefined>();

    const load = useCallback(async () => {
        if (!canRead) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const { data } = await getManageOrders({
                page,
                limit: 20,
                status: status || undefined,
                paymentStatus: paymentStatus || undefined,
                orderCode: orderCode || undefined,
                userId,
            });
            setItems(data.items ?? []);
            setTotalPages(data.meta?.totalPages ?? 1);
            setTotal(data.meta?.total ?? 0);
        } catch (error) {
            notify.error(getApiErrorMessage(error, "Không tải được đơn hàng."));
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [canRead, page, status, paymentStatus, orderCode, userId]);

    useEffect(() => {
        const id = window.setTimeout(() => {
            void load();
        }, 0);
        return () => window.clearTimeout(id);
    }, [load]);

    if (!canRead) {
        return (
            <EmptyState
                title="Không có quyền"
                description="Bạn không có quyền xem đơn hàng."
            />
        );
    }

    return (
        <div className="space-y-4">
            <form
                className="flex flex-col gap-2 lg:flex-row lg:flex-wrap"
                onSubmit={(e) => {
                    e.preventDefault();
                    setPage(1);
                    setOrderCode(orderCodeInput.trim());
                    const parsed = Number(userIdInput.trim());
                    setUserId(
                        userIdInput.trim() && Number.isFinite(parsed)
                            ? parsed
                            : undefined
                    );
                }}
            >
                <div className="relative min-w-[180px] flex-1">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                    <input
                        value={orderCodeInput}
                        onChange={(e) => setOrderCodeInput(e.target.value)}
                        placeholder="Mã đơn (orderCode)"
                        className="w-full rounded-lg border border-gray-200 bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-[#ee4d2d]"
                    />
                </div>
                <input
                    value={userIdInput}
                    onChange={(e) => setUserIdInput(e.target.value)}
                    placeholder="userId"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#ee4d2d] lg:w-32"
                />
                <select
                    value={status}
                    onChange={(e) => {
                        setPage(1);
                        setStatus(e.target.value as "" | OrderStatus);
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                >
                    <option value="">Tất cả trạng thái</option>
                    {ORDER_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <select
                    value={paymentStatus}
                    onChange={(e) => {
                        setPage(1);
                        setPaymentStatus(e.target.value as "" | PaymentStatus);
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                >
                    <option value="">Tất cả thanh toán</option>
                    {PAYMENT_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
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

            <p className="text-sm text-gray-500">{total} đơn hàng</p>

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
                    title="Không có đơn hàng"
                    description="Thử đổi bộ lọc."
                />
            ) : (
                <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 font-medium">Đơn</th>
                                <th className="px-4 py-3 font-medium">Khách</th>
                                <th className="px-4 py-3 font-medium">
                                    Trạng thái
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Thanh toán
                                </th>
                                <th className="px-4 py-3 font-medium">Tổng</th>
                                <th className="px-4 py-3 font-medium text-right">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.map((order) => (
                                <tr
                                    key={order.id}
                                    className="hover:bg-gray-50/80"
                                >
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-900">
                                            {order.orderCode}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {formatDateTime(order.createdAt)}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        <p>{order.user?.fullName ?? "—"}</p>
                                        <p className="text-xs text-gray-400">
                                            {order.user?.email}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <OrderStatusBadge
                                            status={order.status}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col items-start gap-1">
                                            <PaymentStatusBadge
                                                status={order.paymentStatus}
                                            />
                                            <span className="text-xs text-gray-500">
                                                {paymentMethodLabel(
                                                    order.paymentMethod
                                                )}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-[#ee4d2d]">
                                        {formatPrice(order.total)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            href={`/admin/orders/${order.id}`}
                                            className="text-sm text-[#ee4d2d] hover:underline"
                                        >
                                            Chi tiết
                                        </Link>
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
