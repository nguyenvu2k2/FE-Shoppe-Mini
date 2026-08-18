import type { Metadata } from "next";

import CheckoutView from "@/components/features/checkout/checkout-view";

export const metadata: Metadata = {
    title: "Thanh toán",
};

export default function CheckoutPage() {
    return (
        <div className="mx-auto max-w-[1200px] px-4 py-8">
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-gray-900">
                    Thanh toán
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Chọn địa chỉ và phương thức thanh toán
                </p>
            </div>
            <CheckoutView />
        </div>
    );
}
