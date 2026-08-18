import type { Metadata } from "next";

import CartView from "@/components/features/cart/cart-view";

export const metadata: Metadata = {
    title: "Giỏ hàng",
};

export default function CartPage() {
    return (
        <div className="mx-auto max-w-[1200px] px-4 py-8">
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-gray-900">
                    Giỏ hàng
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Kiểm tra sản phẩm trước khi thanh toán
                </p>
            </div>
            <CartView />
        </div>
    );
}
