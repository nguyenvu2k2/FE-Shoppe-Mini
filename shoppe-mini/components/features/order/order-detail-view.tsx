"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import AccountShell from "@/components/features/account/account-shell";
import OrderItems from "@/components/features/order/order-items";
import {
    OrderStatusBadge,
    PaymentMethodBadge,
    PaymentStatusBadge,
} from "@/components/features/order/order-status-badge";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatPrice } from "@/lib/format-price";
import {
    canCustomerCancel,
    canRetryVnpay,
    formatDateTime,
    formatReceiver,
} from "@/lib/order-ui";
import type { Order } from "@/lib/order.types";
import type { PaymentTxn } from "@/lib/payment.types";
import { notify } from "@/lib/toast";
import { cancelMyOrder, getMyOrder } from "@/services/order/order.service";
import {
    createVnpayPayment,
    getOrderPayments,
    redirectToVnpay,
} from "@/services/payment/payment.service";

export default function OrderDetailView() {
    const params = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const orderId = Number(params.id);
    const justPlaced = searchParams.get("placed") === "1";

    const [order, setOrder] = useState<Order | null>(null);
    const [payments, setPayments] = useState<PaymentTxn[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");

    const load = useCallback(async () => {
        if (!Number.isFinite(orderId) || orderId <= 0) {
            setOrder(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const [{ data }, paymentsRes] = await Promise.all([
                getMyOrder(orderId),
                getOrderPayments(orderId).catch(() => ({ data: [] as PaymentTxn[] })),
            ]);
            setOrder(data);
            setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);
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

    const handleRetryVnpay = async () => {
        if (!order) return;
        setBusy(true);
        try {
            const { data } = await createVnpayPayment({ orderId: order.id });
            if (data.paymentUrl) {
                redirectToVnpay(data.paymentUrl);
                return;
            }
            notify.error("Không lấy được link thanh toán VNPay.");
        } catch (error) {
            notify.error(
                getApiErrorMessage(error, "Không tạo được thanh toán VNPay.")
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
            const { data } = await cancelMyOrder(order.id, {
                ...(reason ? { cancelReason: reason } : {}),
            });
            setOrder(data);
            setCancelOpen(false);
            notify.success("Đã hủy đơn hàng.");
        } catch (error) {
            notify.error(getApiErrorMessage(error, "Không hủy được đơn hàng."));
        } finally {
            setBusy(false);
        }
    };

    if (loading) {
        return (
            <AccountShell>
                <div className="h-64 animate-pulse rounded-sm bg-white" />
            </AccountShell>
        );
    }

    if (!order) {
        return (
            <AccountShell>
                <div className="rounded-sm bg-white px-6 py-16 text-center shadow-sm">
                    <p className="text-sm text-gray-600">Không tìm thấy đơn hàng.</p>
                    <Link
                        href="/orders"
                        className="mt-4 inline-block text-sm text-[#ee4d2d] hover:underline"
                    >
                        Về danh sách đơn
                    </Link>
                </div>
            </AccountShell>
        );
    }

    const waitingConfirm =
        order.status === "PENDING" && order.paymentStatus === "PAID";

    return (
        <AccountShell>
            <div className="space-y-4">
                {justPlaced && (
                    <div className="rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        Đặt hàng thành công. Đơn {order.orderCode} đang chờ xử lý.
                    </div>
                )}

                <div className="rounded-sm bg-white px-6 py-5 shadow-sm ring-1 ring-black/[0.04]">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h1 className="text-xl font-normal text-[#333]">
                                Đơn {order.orderCode}
                            </h1>
                            <p className="mt-1 text-sm text-[#939393]">
                                Đặt lúc {formatDateTime(order.createdAt)}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            <OrderStatusBadge status={order.status} />
                            <PaymentStatusBadge status={order.paymentStatus} />
                            <PaymentMethodBadge method={order.paymentMethod} />
                        </div>
                    </div>

                    {waitingConfirm && (
                        <p className="mt-3 rounded-sm bg-sky-50 px-3 py-2 text-sm text-sky-800">
                            Đã thanh toán — chờ shop xác nhận. Không thể hủy đơn.
                        </p>
                    )}

                    {order.status === "CANCELLED" && (
                        <p className="mt-3 rounded-sm bg-gray-50 px-3 py-2 text-sm text-gray-700">
                            Lý do hủy: {order.cancelReason || "—"}
                        </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                        {canRetryVnpay(order) && (
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => void handleRetryVnpay()}
                                className="rounded-sm bg-[#ee4d2d] px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
                            >
                                Thanh toán lại
                            </button>
                        )}
                        {canCustomerCancel(order) && !cancelOpen && (
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => setCancelOpen(true)}
                                className="rounded-sm border border-[#dbdbdb] px-4 py-2 text-sm text-[#555] hover:bg-gray-50 disabled:opacity-50"
                            >
                                Hủy đơn
                            </button>
                        )}
                    </div>

                    {cancelOpen && (
                        <div className="mt-4 rounded-sm border border-gray-200 p-3">
                            <p className="text-sm font-medium text-gray-800">
                                Lý do hủy (không bắt buộc)
                            </p>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows={2}
                                className="mt-2 w-full rounded-sm border border-[#dbdbdb] px-3 py-2 text-sm outline-none focus:border-[#ee4d2d]"
                            />
                            <div className="mt-2 flex gap-2">
                                <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => void handleCancel()}
                                    className="rounded-sm bg-red-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
                                >
                                    Xác nhận hủy
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCancelOpen(false)}
                                    className="rounded-sm px-3 py-1.5 text-sm text-gray-600"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="rounded-sm bg-white px-6 py-5 shadow-sm ring-1 ring-black/[0.04]">
                    <h2 className="text-base font-medium text-[#333]">
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

                <div className="rounded-sm bg-white px-6 py-5 shadow-sm ring-1 ring-black/[0.04]">
                    <h2 className="text-base font-medium text-[#333]">Sản phẩm</h2>
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
                    <div className="rounded-sm bg-white px-6 py-5 shadow-sm ring-1 ring-black/[0.04]">
                        <h2 className="text-base font-medium text-[#333]">
                            Thanh toán
                        </h2>
                        <ul className="mt-3 space-y-2 text-sm">
                            {payments.map((txn) => (
                                <li
                                    key={txn.id}
                                    className="flex flex-wrap justify-between gap-2 rounded-sm bg-gray-50 px-3 py-2"
                                >
                                    <span>
                                        {txn.method} · {txn.status}
                                        {txn.txnRef ? ` · ${txn.txnRef}` : ""}
                                    </span>
                                    <span>{formatPrice(txn.amount)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <Link
                    href="/orders"
                    className="inline-block text-sm text-[#ee4d2d] hover:underline"
                >
                    ← Tất cả đơn hàng
                </Link>
            </div>
        </AccountShell>
    );
}
