import type { PaginationMeta } from "@/lib/catalog.types";

export type OrderStatus =
    | "PENDING"
    | "CONFIRMED"
    | "SHIPPING"
    | "COMPLETED"
    | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PAID" | "FAILED" | "REFUNDED";

export type PaymentMethod = "COD" | "BANK_TRANSFER" | "VNPAY";

export interface OrderUser {
    id: number;
    fullName: string;
    email: string;
}

export interface OrderReceiver {
    name: string;
    phone: string;
    addressLine: string;
    ward: string;
    district: string;
    province: string;
}

export interface OrderItem {
    id: number;
    productId: number;
    variantId?: number | null;
    productName: string;
    variantName?: string | null;
    sku?: string | null;
    thumbnail?: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
}

export interface Order {
    id: number;
    orderCode: string;
    user?: OrderUser | null;
    receiver: OrderReceiver;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    subtotal: number;
    shippingFee: number;
    total: number;
    note?: string | null;
    cancelReason?: string | null;
    items: OrderItem[];
    paidAt?: string | null;
    shippedAt?: string | null;
    completedAt?: string | null;
    cancelledAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface VnpayCheckoutPayload {
    paymentId: number;
    txnRef: string;
    expireAt: string;
    paymentUrl: string;
}

export interface CheckoutResponse extends Order {
    vnpay: VnpayCheckoutPayload | null;
    vnpayError?: string;
}

export interface CreateOrderPayload {
    addressId: number;
    paymentMethod: PaymentMethod;
    note?: string;
}

export interface OrderListQuery {
    page?: number;
    limit?: number;
    status?: OrderStatus;
}

export interface OrderListResponse {
    items: Order[];
    meta: PaginationMeta;
}

export interface CancelOrderPayload {
    cancelReason?: string;
}

export interface AdminOrderListQuery {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    userId?: number;
    orderCode?: string;
}

export interface UpdateAdminOrderStatusPayload {
    status: Extract<OrderStatus, "CONFIRMED" | "SHIPPING" | "COMPLETED">;
}

export interface UpdateAdminPaymentPayload {
    paymentStatus: Extract<PaymentStatus, "PAID" | "FAILED" | "REFUNDED">;
}
