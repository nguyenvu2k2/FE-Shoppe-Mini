import { Suspense } from "react";
import type { Metadata } from "next";

import VnpayReturnView from "@/components/features/payment/vnpay-return-view";

export const metadata: Metadata = {
    title: "Kết quả thanh toán VNPay",
};

export default function VnpayReturnPage() {
    return (
        <Suspense
            fallback={
                <div className="py-16 text-center text-sm text-gray-500">
                    Đang xác nhận thanh toán...
                </div>
            }
        >
            <VnpayReturnView />
        </Suspense>
    );
}
