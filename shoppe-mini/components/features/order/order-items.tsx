import Price from "@/components/ui/price";
import ProductImage from "@/components/ui/product-image";
import { formatPrice } from "@/lib/format-price";
import type { OrderItem } from "@/lib/order.types";

export default function OrderItems({ items }: { items: OrderItem[] }) {
    return (
        <ul className="divide-y divide-gray-100">
            {(items ?? []).map((item) => (
                <li key={item.id} className="flex gap-3 py-3">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <ProductImage
                            src={item.thumbnail}
                            alt={item.productName}
                            sizes="64px"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium text-gray-900">
                            {item.productName}
                        </p>
                        {(item.variantName || item.sku) && (
                            <p className="mt-0.5 text-xs text-gray-500">
                                {[item.variantName, item.sku]
                                    .filter(Boolean)
                                    .join(" · ")}
                            </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            {formatPrice(item.unitPrice)} × {item.quantity}
                        </p>
                    </div>
                    <div className="shrink-0">
                        <Price price={item.lineTotal} size="sm" />
                    </div>
                </li>
            ))}
        </ul>
    );
}
