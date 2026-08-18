"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import OrderItems from "@/components/features/order/order-items";
import {
    OrderStatusBadge,
    PaymentMethodBadge,
    PaymentStatusBadge,
} from "@/components/features/order/order-status-badge";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatPrice } from "@/lib/format-price";
import {
    adminPaymentActions,
    canAdminCancel,
    formatDateTime,
    formatReceiver,
    nextAdminStatus,
    nextAdminStatusLabel,
    paymentStatusLabel,
} from "@/lib/order-ui";
import type { Order, PaymentStatus } from "@/lib/order.types";
import type { PaymentTxn } from "@/lib/payment.types";
import { useCan } from "@/lib/use-can";
import { notify } from "@/lib/toast";
import {
    cancelManageOrder,
    getManageOrder,
    updateManageOrderPayment,
    updateManageOrderStatus,
} from "@/services/order/order.service";
import { getManagePayments } from "@/services/payment/payment.service";

export default function AdminOrderDetail() {
    const params = useParams<{ id: string }>();
    const orderId = Number(params.id);
    const canUpdate = useCan("order:update");
    const canUpdatePayment = useCan("payment:update");

    const [order, setOrder] = useState<Order | null>(null);
    const [payments, setPayments] = useState<PaymentTxn[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");

    const load = useCallback(async () => {
        if (!Number.isFinite(orderId) || orderId <= 0) return;
        setLoading(true);
        try {
            const [{ data }, payRes] = await Promise.all([
                getManageOrder(orderId),
                getManagePayments({ orderId, limit: 50 }).catch(() => ({
                    data: { items: [] as PaymentTxn[] },
                })),
            ]);
            setOrder(data);
            setPayments(payRes.data.items ?? []);
        } catch (error) {
            notify.error(getApiErrorMessage(error, "Không tải được đơn hàng."));
            setOrder(null);
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        const id = window.setTimeout(() => {
            void load();
        }, 0);
        return () => window.clearTimeout(id);
    }, [load]);

    const handleAdvance = async () => {
        if (!order) return;
        const next = nextAdminStatus(order);
        if (!next) return;
        setBusy(true);
        try {
            const { data } = await updateManageOrderStatus(order.id, {
                status: next,
            });
            setOrder(data);
            notify.success(`Đã cập nhật: ${nextAdminStatusLabel(next)}`);
        } catch (error) {
            notify.error(
                getApiErrorMessage(error, "Không cập nhật được trạng thái.")
            );
        } finally {
            setBusy(false);
        }
    };

    const handleCancel = async () => {
        if (!order) return;
        setBusy(true);
        try {
            const reason = cancelReason.trim();
            const { data } = await cancelManageOrder(order.id, {
                ...(reason ? { cancelReason: reason } : {}),
            });
            setOrder(data);
            setCancelOpen(false);
            notify.success("Đã hủy đơn.");
        } catch (error) {
            notify.error(getApiErrorMessage(error, "Không hủy được đơn."));
        } finally {
            setBusy(false);
        }
    };

    const handlePayment = async (
        paymentStatus: Extract<PaymentStatus, "PAID" | "FAILED" | "REFUNDED">
    ) => {
        if (!order) return;
        const label = paymentStatusLabel(paymentStatus);
        if (
            !window.confirm(
                `Đánh dấu thanh toán thành ${label}?`
            )
        ) {
            return;
        }
        setBusy(true);
        try {
            const { data } = await updateManageOrderPayment(order.id, {
                paymentStatus,
            });
            setOrder(data);
            notify.success(`Đã cập nhật thanh toán: ${label}`);
            await load();
        } catch (error) {
            notify.error(
                getApiErrorMessage(error, "Không cập nhật được thanh toán.")
            );
        } finally {
            setBusy(false);
        }
    };

    if (loading) {
        return <div className="h-64 animate-pulse rounded-xl bg-gray-200" />;
    }

    if (!order) {
        return (
            <div className="rounded-xl bg-white p-8 text-center text-sm text-gray-600">
                Không tìm thấy đơn hàng.
            </div>
        );
    }

    const next = nextAdminStatus(order);
    const paymentActions = adminPaymentActions(order);
    const vnpayUnpaid =
        order.paymentMethod === "VNPAY" && order.paymentStatus !== "PAID";

    return (
        <div className="space-y-4">
            <Link
                href="/admin/orders"
                className="text-sm text-gray-500 hover:text-[#ee4d2d]"
            >
                ← Danh sách đơn
            </Link>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">
                            {order.orderCode}
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {formatDateTime(order.createdAt)}
                            {order.user
                                ? ` · ${order.user.fullName} (${order.user.email})`
                                : ""}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        <OrderStatusBadge status={order.status} />
                        <PaymentStatusBadge status={order.paymentStatus} />
                        <PaymentMethodBadge method={order.paymentMethod} />
                    </div>
                </div>

                {vnpayUnpaid && (
                    <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                        Chưa thanh toán VNPay — chưa thể xác nhận hoặc giao hàng.
                    </p>
                )}

                {order.status === "CANCELLED" && (
                    <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                        Lý do hủy: {order.cancelReason || "—"}
                    </p>
                )}

                {canUpdate && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {next && (
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => void handleAdvance()}
                                className="rounded-lg bg-[#ee4d2d] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                            >
                                {nextAdminStatusLabel(next)}
                            </button>
                        )}
                        {canAdminCancel(order) && !cancelOpen && (
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => setCancelOpen(true)}
                                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Hủy đơn
                            </button>
                        )}
                    </div>
                )}

                {cancelOpen && (
                    <div className="mt-4 rounded-lg border border-gray-200 p-3">
                        <p className="text-sm font-medium text-gray-800">
                            Lý do hủy (không bắt buộc)
                        </p>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            rows={2}
                            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#ee4d2d]"
                        />
                        <div className="mt-2 flex gap-2">
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => void handleCancel()}
                                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
                            >
                                Xác nhận hủy
                            </button>
                            <button
                                type="button"
                                onClick={() => setCancelOpen(false)}
                                className="rounded-lg px-3 py-1.5 text-sm text-gray-600"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                )}

                {canUpdatePayment && paymentActions.length > 0 && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                        <p className="mb-2 text-sm font-medium text-gray-800">
                            Cập nhật thanh toán (COD / chuyển khoản)
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {paymentActions.map((action) => (
                                <button
                                    key={action}
                                    type="button"
                                    disabled={busy}
                                    onClick={() => void handlePayment(action)}
                                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Đánh dấu {paymentStatusLabel(action)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04]">
                <h2 className="text-base font-semibold text-gray-900">
                    Người nhận
                </h2>
                <p className="mt-2 text-sm text-gray-800">
                    {order.receiver.name} · {order.receiver.phone}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                    {formatReceiver(order.receiver)}
                </p>
                {order.note && (
                    <p className="mt-3 text-sm text-gray-600">
                        Ghi chú: {order.note}
                    </p>
                )}
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04]">
                <h2 className="text-base font-semibold text-gray-900">
                    Sản phẩm
                </h2>
                <OrderItems items={order.items} />
                <dl className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-sm">
                    <div className="flex justify-between text-gray-600">
                        <dt>Tạm tính</dt>
                        <dd>{formatPrice(order.subtotal)}</dd>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <dt>Phí vận chuyển</dt>
                        <dd>{formatPrice(order.shippingFee)}</dd>
                    </div>
                    <div className="flex justify-between text-base font-medium">
                        <dt>Tổng</dt>
                        <dd className="text-[#ee4d2d]">
                            {formatPrice(order.total)}
                        </dd>
                    </div>
                </dl>
            </div>

            {payments.length > 0 && (
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04]">
                    <h2 className="text-base font-semibold text-gray-900">
                        Ledger thanh toán
                    </h2>
                    <ul className="mt-3 space-y-2 text-sm">
                        {payments.map((txn) => (
                            <li
                                key={txn.id}
                                className="flex flex-wrap justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2"
                            >
                                <span>
                                    #{txn.id} · {txn.method} · {txn.status}
                                    {txn.txnRef ? ` · ${txn.txnRef}` : ""}
                                    {txn.responseCode
                                        ? ` · rc ${txn.responseCode}`
                                        : ""}
                                </span>
                                <span>{formatPrice(txn.amount)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
