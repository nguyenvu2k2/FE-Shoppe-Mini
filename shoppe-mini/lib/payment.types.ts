import type { PaginationMeta } from "@/lib/catalog.types";
import type { PaymentMethod } from "@/lib/order.types";

export type PaymentTxnStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface PaymentTxn {
    id: number;
    orderId: number;
    method: PaymentMethod;
    status: PaymentTxnStatus;
    amount: number;
    txnRef?: string | null;
    transactionId?: string | null;
    bankCode?: string | null;
    responseCode?: string | null;
    paidAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateVnpayPaymentPayload {
    orderId: number;
}

export interface VnpayPaymentCreated {
    paymentId: number;
    orderId: number;
    orderCode: string;
    txnRef: string;
    amount: number;
    expireAt: string;
    paymentUrl: string;
}

export interface AdminPaymentListQuery {
    page?: number;
    limit?: number;
    orderId?: number;
    status?: PaymentTxnStatus;
    method?: PaymentMethod;
}

export interface AdminPaymentListResponse {
    items: PaymentTxn[];
    meta: PaginationMeta;
}
