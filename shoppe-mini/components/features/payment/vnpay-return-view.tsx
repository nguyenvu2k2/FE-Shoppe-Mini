"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";

import {
    OrderStatusBadge,
    PaymentStatusBadge,
} from "@/components/features/order/order-status-badge";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatPrice } from "@/lib/format-price";
import type { Order, PaymentStatus, OrderStatus } from "@/lib/order.types";
import { getMyOrder } from "@/services/order/order.service";
import { offOrderUpdatedSocet, onOrderUpdatedSocet } from "@/lib/socket";

type OrderUpdatedPayload = {
    orderId?: number;
    paymentStatus?: PaymentStatus;
    status?: OrderStatus;
    order?: Order;
};

type Phase = "polling" | "paid" | "failed" | "pending" | "error";

export default function VnpayReturnView() {
    const searchParams = useSearchParams();
    const orderId = Number(searchParams.get("orderId"));
    const orderCode = searchParams.get("orderCode") ?? "";
    const txnRef = searchParams.get("txnRef") ?? "";

    const validOrderId = Number.isFinite(orderId) && orderId > 0;
    const [phase, setPhase] = useState<Phase>(
        validOrderId ? "polling" : "error"
    );

    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState<string | null>(
        validOrderId ? null : "Thiếu thông tin đơn hàng trên URL trả về."
    );

    useEffect(() => {
        if (!validOrderId) return;

        let cancelled = false;
        let pendingTimer: ReturnType<typeof setTimeout> | undefined;
        let pollTimer: ReturnType<typeof setInterval> | undefined;

        const applyOrder = (data: Order) => {
            setOrder(data);
            if (data.paymentStatus === "PAID") {
                setPhase("paid");
                return true;
            }
            if (data.status === "CANCELLED" || data.paymentStatus === "FAILED") {
                setPhase("failed");
                return true;
            }
            return false;
        };

        const stopWait = () => {
            if (pendingTimer) {
                clearTimeout(pendingTimer);
                pendingTimer = undefined;
            }
            if (pollTimer) {
                clearInterval(pollTimer);
                pollTimer = undefined;
            }
        };

        const fetchOrder = async () => {
            const { data } = await getMyOrder(orderId);
            if (cancelled) return false;
            if (applyOrder(data)) {
                stopWait();
                return true;
            }
            return false;
        };

        const handler = (payload: OrderUpdatedPayload) => {
            if (cancelled) return;
            if (payload.orderId !== orderId) return;
            void fetchOrder().catch(() => {
                /* poll / timeout vẫn chạy */
            });
        };

        // Không đợi GET/socket — GET treo thì trước đây không bao giờ sang pending
        pendingTimer = setTimeout(() => {
            if (cancelled) return;
            setPhase((current) => (current === "polling" ? "pending" : current));
        }, 15_000);

        onOrderUpdatedSocet(handler);
        pollTimer = setInterval(() => {
            void fetchOrder().catch(() => {
                /* lần sau / timeout */
            });
        }, 3000);

        void fetchOrder().catch((err) => {
            if (cancelled) return;
            setError(
                getApiErrorMessage(
                    err,
                    "Chưa xác nhận được từ máy chủ. Đợi thêm hoặc mở đơn hàng."
                )
            );
        });

        return () => {
            cancelled = true;
            offOrderUpdatedSocet(handler);
            stopWait();
        };
    }, [orderId, validOrderId]);

    const heading =
        phase === "paid"
            ? "Thanh toán thành công"
            : phase === "failed"
                ? "Thanh toán không thành công"
                : phase === "pending"
                    ? "Đang chờ xác nhận thanh toán"
                    : phase === "error"
                        ? "Không kiểm tra được thanh toán"
                        : "Đang xác nhận thanh toán VNPay";

    const description =
        phase === "paid"
            ? "Đơn hàng đã được thanh toán."
            : phase === "failed"
                ? order?.cancelReason ||
                "Đơn đã hủy hoặc thanh toán thất bại."
                : phase === "pending"
                    ? "Hệ thống đang xác nhận. Bạn có thể xem lại đơn hàng."
                    : phase === "error"
                        ? error
                        : "Vui lòng chờ trong giây lát.";

    return (
        <div className="mx-auto max-w-lg px-4 py-12">
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/[0.04]">
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#fef6f5]">
                    {phase === "paid" ? (
                        <CircleCheck className="size-8 text-emerald-600" />
                    ) : phase === "failed" || phase === "error" ? (
                        <CircleAlert className="size-8 text-red-500" />
                    ) : (
                        <LoaderCircle className="size-8 animate-spin text-[#ee4d2d]" />
                    )}
                </div>
                <h1 className="text-xl font-semibold text-gray-900">
                    {heading}
                </h1>
                <p className="mt-2 text-sm text-gray-600">{description}</p>

                {(orderCode || txnRef) && (
                    <p className="mt-3 text-xs text-gray-400">
                        {orderCode ? `Mã đơn ${orderCode}` : ""}
                        {txnRef ? ` · txnRef ${txnRef}` : ""}
                    </p>
                )}

                {order && (
                    <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                        <OrderStatusBadge status={order.status} />
                        <PaymentStatusBadge status={order.paymentStatus} />
                        <span className="text-sm font-medium text-[#ee4d2d]">
                            {formatPrice(order.total)}
                        </span>
                    </div>
                )}

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    {Number.isFinite(orderId) && orderId > 0 && (
                        <Link
                            href={`/orders/${orderId}`}
                            className="rounded-xl bg-[#ee4d2d] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
                        >
                            Xem đơn hàng
                        </Link>
                    )}
                    <Link
                        href="/orders"
                        className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        Tất cả đơn
                    </Link>
                </div>
            </div>
        </div>
    );
}
