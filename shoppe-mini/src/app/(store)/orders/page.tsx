import { Suspense } from "react";
import type { Metadata } from "next";

import OrdersListView from "@/components/features/order/orders-list-view";

export const metadata: Metadata = {
    title: "Đơn hàng của tôi",
};

export default function OrdersPage() {
    return (
        <Suspense
            fallback={
                <div className="mx-auto max-w-[1100px] px-4 py-16 text-center text-sm text-gray-500">
                    Đang tải đơn hàng...
                </div>
            }
        >
            <OrdersListView />
        </Suspense>
    );
}
