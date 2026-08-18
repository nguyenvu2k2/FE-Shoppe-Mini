import { api } from "@/lib/axios";
import type {
    AdminOrderListQuery,
    CancelOrderPayload,
    CheckoutResponse,
    CreateOrderPayload,
    Order,
    OrderListQuery,
    OrderListResponse,
    UpdateAdminOrderStatusPayload,
    UpdateAdminPaymentPayload,
    VnpayCheckoutPayload,
} from "@/lib/order.types";

function unwrapCheckout(data: unknown): CheckoutResponse {
    if (!data || typeof data !== "object") {
        throw new Error("Invalid checkout response");
    }
    const raw = data as Record<string, unknown>;
    const nested = raw.order;
    if (
        nested &&
        typeof nested === "object" &&
        "orderCode" in nested &&
        !("orderCode" in raw)
    ) {
        const order = nested as Order;
        return {
            ...order,
            vnpay: (raw.vnpay as VnpayCheckoutPayload | null) ?? null,
            vnpayError: raw.vnpayError as string | undefined,
        };
    }
    const order = data as CheckoutResponse;
    return { ...order, vnpay: order.vnpay ?? null };
}

export const createOrder = async (payload: CreateOrderPayload) => {
    const res = await api.post<CheckoutResponse>("orders", payload);
    return { ...res, data: unwrapCheckout(res.data) };
};

export const getMyOrders = async (params: OrderListQuery = {}) => {
    return api.get<OrderListResponse>("orders", {
        params: {
            page: params.page ?? 1,
            limit: Math.min(params.limit ?? 20, 50),
            status: params.status,
        },
    });
};

export const getMyOrder = async (id: number) => {
    return api.get<Order>(`orders/${id}`);
};

export const cancelMyOrder = async (
    id: number,
    payload: CancelOrderPayload = {}
) => {
    return api.patch<Order>(`orders/${id}/cancel`, payload);
};

export const getManageOrders = async (params: AdminOrderListQuery = {}) => {
    return api.get<OrderListResponse>("orders/manage", {
        params: {
            page: params.page ?? 1,
            limit: Math.min(params.limit ?? 20, 50),
            status: params.status,
            paymentStatus: params.paymentStatus,
            userId: params.userId,
            orderCode: params.orderCode || undefined,
        },
    });
};

export const getManageOrder = async (id: number) => {
    return api.get<Order>(`orders/manage/${id}`);
};

export const updateManageOrderStatus = async (
    id: number,
    payload: UpdateAdminOrderStatusPayload
) => {
    return api.patch<Order>(`orders/manage/${id}/status`, payload);
};

export const cancelManageOrder = async (
    id: number,
    payload: CancelOrderPayload = {}
) => {
    return api.patch<Order>(`orders/manage/${id}/cancel`, payload);
};

export const updateManageOrderPayment = async (
    id: number,
    payload: UpdateAdminPaymentPayload
) => {
    return api.patch<Order>(`orders/manage/${id}/payment`, payload);
};
