import AccountShell from "@/components/features/account/account-shell";
import { Package } from "lucide-react";

export default function OrdersPage() {
    return (
        <AccountShell>
            <div className="rounded-sm bg-white px-6 py-5 shadow-sm ring-1 ring-black/[0.04]">
                <div className="flex items-start gap-3">
                    <span className="mt-1.5 h-5 w-1 shrink-0 rounded-full bg-[#ee4d2d]" />
                    <div>
                        <h1 className="text-xl font-normal text-[#333]">Đơn Hàng Của Tôi</h1>
                        <p className="mt-1 text-sm text-[#939393]">
                            Theo dõi và quản lý các đơn hàng đã đặt
                        </p>
                    </div>
                </div>
                <div className="mt-4 h-px bg-[#efefef]" />

                <div className="flex flex-col items-center py-16 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-[#fef6f5] text-[#ee4d2d]">
                        <Package className="size-7" strokeWidth={1.5} />
                    </div>
                    <p className="mt-4 text-sm font-medium text-[#333]">
                        Bạn chưa có đơn hàng nào
                    </p>
                    <p className="mt-1 text-sm text-[#999]">
                        Hãy khám phá sản phẩm và đặt hàng ngay nhé!
                    </p>
                </div>
            </div>
        </AccountShell>
    );
}
