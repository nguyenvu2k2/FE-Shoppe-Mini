import { api } from "@/lib/axios";
import type {
    AdminPaymentListQuery,
    AdminPaymentListResponse,
    CreateVnpayPaymentPayload,
    PaymentTxn,
    VnpayPaymentCreated,
} from "@/lib/payment.types";
import type { UpdateAdminPaymentPayload } from "@/lib/order.types";

export const createVnpayPayment = async (payload: CreateVnpayPaymentPayload) => {
    return api.post<VnpayPaymentCreated>("payments/vnpay/create", payload);
};

export const getOrderPayments = async (orderId: number) => {
    const res = await api.get<PaymentTxn[] | { items: PaymentTxn[] }>(
        `payments/orders/${orderId}`
    );
    const data = Array.isArray(res.data) ? res.data : (res.data.items ?? []);
    return { ...res, data };
};

export const getManagePayments = async (params: AdminPaymentListQuery = {}) => {
    const res = await api.get<AdminPaymentListResponse | PaymentTxn[]>(
        "payments/manage",
        {
            params: {
                page: params.page ?? 1,
                limit: Math.min(params.limit ?? 20, 50),
                orderId: params.orderId,
                status: params.status,
                method: params.method,
            },
        }
    );
    if (Array.isArray(res.data)) {
        return {
            ...res,
            data: {
                items: res.data,
                meta: {
                    page: 1,
                    limit: res.data.length,
                    total: res.data.length,
                    totalPages: 1,
                },
            } satisfies AdminPaymentListResponse,
        };
    }
    return {
        ...res,
        data: {
            items: res.data.items ?? [],
            meta: res.data.meta,
        },
    };
};

export const updateCodPayment = async (
    orderId: number,
    payload: UpdateAdminPaymentPayload
) => {
    return api.patch<PaymentTxn>(`payments/manage/cod/${orderId}`, payload);
};

export function redirectToVnpay(paymentUrl: string) {
    window.location.assign(paymentUrl);
}
