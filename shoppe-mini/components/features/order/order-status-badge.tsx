import { cn } from "@/lib/utils";
import {
    orderStatusClass,
    orderStatusLabel,
    paymentMethodLabel,
    paymentStatusClass,
    paymentStatusLabel,
} from "@/lib/order-ui";
import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/order.types";
import type { PaymentTxnStatus } from "@/lib/payment.types";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
    return (
        <span
            className={cn(
                "inline-flex rounded-sm px-2 py-0.5 text-xs font-medium",
                orderStatusClass(status)
            )}
        >
            {orderStatusLabel(status)}
        </span>
    );
}

export function PaymentStatusBadge({
    status,
}: {
    status: PaymentStatus | PaymentTxnStatus;
}) {
    return (
        <span
            className={cn(
                "inline-flex rounded-sm px-2 py-0.5 text-xs font-medium",
                paymentStatusClass(status)
            )}
        >
            {paymentStatusLabel(status)}
        </span>
    );
}

export function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
    return (
        <span className="inline-flex rounded-sm bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
            {paymentMethodLabel(method)}
        </span>
    );
}
