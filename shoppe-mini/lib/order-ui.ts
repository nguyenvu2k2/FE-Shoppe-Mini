import type {
    Order,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
} from "@/lib/order.types";
import type { PaymentTxnStatus } from "@/lib/payment.types";

export const ORDER_STATUS_OPTIONS: Array<{
    value: OrderStatus;
    label: string;
}> = [
    { value: "PENDING", label: "Chờ xác nhận" },
    { value: "CONFIRMED", label: "Đã xác nhận" },
    { value: "SHIPPING", label: "Đang giao" },
    { value: "COMPLETED", label: "Hoàn thành" },
    { value: "CANCELLED", label: "Đã hủy" },
];

export const PAYMENT_STATUS_OPTIONS: Array<{
    value: PaymentStatus;
    label: string;
}> = [
    { value: "UNPAID", label: "Chưa thanh toán" },
    { value: "PAID", label: "Đã thanh toán" },
    { value: "FAILED", label: "Thất bại" },
    { value: "REFUNDED", label: "Đã hoàn tiền" },
];

export const PAYMENT_METHOD_OPTIONS: Array<{
    value: PaymentMethod;
    label: string;
    hint: string;
}> = [
    {
        value: "COD",
        label: "Thanh toán khi nhận hàng",
        hint: "Trả tiền mặt cho shipper khi nhận hàng",
    },
    {
        value: "BANK_TRANSFER",
        label: "Chuyển khoản ngân hàng",
        hint: "Shop xác nhận sau khi nhận được tiền",
    },
    {
        value: "VNPAY",
        label: "VNPay",
        hint: "Thanh toán qua cổng VNPay",
    },
];

export function orderStatusLabel(status: OrderStatus) {
    return (
        ORDER_STATUS_OPTIONS.find((opt) => opt.value === status)?.label ??
        status
    );
}

export function paymentStatusLabel(status: PaymentStatus | PaymentTxnStatus) {
    return (
        PAYMENT_STATUS_OPTIONS.find((opt) => opt.value === status)?.label ??
        status
    );
}

export function paymentMethodLabel(method: PaymentMethod) {
    return (
        PAYMENT_METHOD_OPTIONS.find((opt) => opt.value === method)?.label ??
        method
    );
}

export function formatDateTime(value?: string | null) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("vi-VN");
}

export function formatReceiver(receiver: Order["receiver"]) {
    return [
        receiver.addressLine,
        receiver.ward,
        receiver.district,
        receiver.province,
    ]
        .filter(Boolean)
        .join(", ");
}

/** Khách: chỉ PENDING và chưa PAID */
export function canCustomerCancel(order: Pick<Order, "status" | "paymentStatus">) {
    return order.status === "PENDING" && order.paymentStatus !== "PAID";
}

/** PENDING + UNPAID + VNPAY */
export function canRetryVnpay(
    order: Pick<Order, "status" | "paymentStatus" | "paymentMethod">
) {
    return (
        order.status === "PENDING" &&
        order.paymentStatus === "UNPAID" &&
        order.paymentMethod === "VNPAY"
    );
}

/** Admin: PENDING|CONFIRMED, chưa PAID */
export function canAdminCancel(order: Pick<Order, "status" | "paymentStatus">) {
    return (
        (order.status === "PENDING" || order.status === "CONFIRMED") &&
        order.paymentStatus !== "PAID"
    );
}

/**
 * VNPay chưa PAID không Confirm/Ship/Complete.
 * COD/BANK được confirm dù UNPAID.
 */
export function nextAdminStatus(
    order: Pick<Order, "status" | "paymentStatus" | "paymentMethod">
): Extract<OrderStatus, "CONFIRMED" | "SHIPPING" | "COMPLETED"> | null {
    if (order.status === "CANCELLED" || order.status === "COMPLETED") {
        return null;
    }
    if (order.paymentMethod === "VNPAY" && order.paymentStatus !== "PAID") {
        return null;
    }
    if (order.status === "PENDING") return "CONFIRMED";
    if (order.status === "CONFIRMED") return "SHIPPING";
    if (order.status === "SHIPPING") return "COMPLETED";
    return null;
}

export function nextAdminStatusLabel(
    status: Extract<OrderStatus, "CONFIRMED" | "SHIPPING" | "COMPLETED">
) {
    switch (status) {
        case "CONFIRMED":
            return "Xác nhận đơn";
        case "SHIPPING":
            return "Chuyển sang đang giao";
        case "COMPLETED":
            return "Hoàn thành đơn";
    }
}

/** Chỉ COD / BANK_TRANSFER. Không dùng cho VNPAY. */
export function adminPaymentActions(
    order: Pick<Order, "paymentMethod" | "paymentStatus">
): Array<Extract<PaymentStatus, "PAID" | "FAILED" | "REFUNDED">> {
    if (order.paymentMethod === "VNPAY") return [];
    const actions: Array<Extract<PaymentStatus, "PAID" | "FAILED" | "REFUNDED">> =
        [];
    if (order.paymentStatus === "UNPAID" || order.paymentStatus === "FAILED") {
        actions.push("PAID");
    }
    if (order.paymentStatus === "UNPAID") {
        actions.push("FAILED");
    }
    if (order.paymentStatus === "PAID") {
        actions.push("REFUNDED");
    }
    return actions;
}

export function orderStatusClass(status: OrderStatus) {
    switch (status) {
        case "PENDING":
            return "bg-amber-50 text-amber-700";
        case "CONFIRMED":
            return "bg-sky-50 text-sky-700";
        case "SHIPPING":
            return "bg-indigo-50 text-indigo-700";
        case "COMPLETED":
            return "bg-emerald-50 text-emerald-700";
        case "CANCELLED":
            return "bg-gray-100 text-gray-600";
        default:
            return "bg-gray-100 text-gray-600";
    }
}

export function paymentStatusClass(status: PaymentStatus | PaymentTxnStatus) {
    switch (status) {
        case "PAID":
            return "bg-emerald-50 text-emerald-700";
        case "UNPAID":
        case "PENDING":
            return "bg-amber-50 text-amber-700";
        case "FAILED":
            return "bg-red-50 text-red-700";
        case "REFUNDED":
            return "bg-gray-100 text-gray-600";
        default:
            return "bg-gray-100 text-gray-600";
    }
}
