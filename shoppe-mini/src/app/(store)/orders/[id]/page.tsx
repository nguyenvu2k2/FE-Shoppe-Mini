import { Suspense } from "react";
import type { Metadata } from "next";

import OrderDetailView from "@/components/features/order/order-detail-view";

export const metadata: Metadata = {
    title: "Chi tiết đơn hàng",
};

export default function OrderDetailPage() {
    return (
        <Suspense
            fallback={
                <div className="py-16 text-center text-sm text-gray-500">
                    Đang tải đơn hàng...
                </div>
            }
        >
            <OrderDetailView />
        </Suspense>
    );
}
