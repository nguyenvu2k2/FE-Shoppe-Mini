"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";

import {
    OrderStatusBadge,
    PaymentStatusBadge,
} from "@/components/features/order/order-status-badge";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatPrice } from "@/lib/format-price";
import type { Order } from "@/lib/order.types";
import type { PaymentTxn } from "@/lib/payment.types";
import { getMyOrder } from "@/services/order/order.service";
import { getOrderPayments } from "@/services/payment/payment.service";

type Phase = "polling" | "paid" | "failed" | "pending" | "error";

const POLL_MS = 2000;
const MAX_ATTEMPTS = 45;

export default function VnpayReturnView() {
    const searchParams = useSearchParams();
    const orderId = Number(searchParams.get("orderId"));
    const orderCode = searchParams.get("orderCode") ?? "";
    const queryStatus = searchParams.get("status");
    const txnRef = searchParams.get("txnRef") ?? "";

    const validOrderId = Number.isFinite(orderId) && orderId > 0;
    const [phase, setPhase] = useState<Phase>(
        validOrderId ? "polling" : "error"
    );
    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState<string | null>(
        validOrderId ? null : "Thiếu thông tin đơn hàng trên URL trả về."
    );
    const attempts = useRef(0);

    useEffect(() => {
        if (!validOrderId) return;

        let cancelled = false;
        let timer: ReturnType<typeof setTimeout> | undefined;
        attempts.current = 0;

        const tick = async () => {
            try {
                const [{ data }] = await Promise.all([
                    getMyOrder(orderId),
                    getOrderPayments(orderId).catch(
                        () => ({ data: [] as PaymentTxn[] })
                    ),
                ]);
                if (cancelled) return;

                setOrder(data);

                if (data.paymentStatus === "PAID") {
                    setPhase("paid");
                    return;
                }

                if (
                    data.status === "CANCELLED" ||
                    data.paymentStatus === "FAILED"
                ) {
                    setPhase("failed");
                    return;
                }

                attempts.current += 1;
                if (attempts.current >= MAX_ATTEMPTS) {
                    setPhase("pending");
                    return;
                }
                timer = setTimeout(() => void tick(), POLL_MS);
            } catch (err) {
                if (cancelled) return;
                attempts.current += 1;
                if (attempts.current >= MAX_ATTEMPTS) {
                    setPhase("error");
                    setError(
                        getApiErrorMessage(
                            err,
                            "Không xác nhận được thanh toán. Vào đơn hàng để kiểm tra."
                        )
                    );
                    return;
                }
                timer = setTimeout(() => void tick(), POLL_MS);
            }
        };

        timer = setTimeout(() => void tick(), 0);

        return () => {
            cancelled = true;
            if (timer) clearTimeout(timer);
        };
    }, [orderId, queryStatus, validOrderId]);

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
