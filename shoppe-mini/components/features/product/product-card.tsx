import Link from "next/link";
import { Star } from "lucide-react";

import Price from "@/components/ui/price";
import ProductImage from "@/components/ui/product-image";
import type { ProductListItem } from "@/lib/catalog.types";
import { cn } from "@/lib/utils";

type ProductCardProps = {
    product: ProductListItem;
    className?: string;
};

export default function ProductCard({ product, className }: ProductCardProps) {
    const sold = product.soldCount ?? 0;
    const rating = product.ratingAvg;

    return (
        <Link
            href={`/products/${product.slug}`}
            className={cn(
                "group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/[0.04] transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:ring-[#ee4d2d]/15",
                className
            )}
        >
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                <ProductImage
                    src={product.thumbnail}
                    alt={product.name}
                    className="transition duration-300 group-hover:scale-[1.04]"
                />
            </div>
            <div className="flex flex-1 flex-col gap-1.5 p-3">
                <h3 className="line-clamp-2 min-h-[2.5rem] text-sm leading-snug text-gray-800 transition group-hover:text-[#ee4d2d]">
                    {product.name}
                </h3>
                <Price
                    price={product.price}
                    discountPrice={product.discountPrice}
                    size="sm"
                />
                <div className="mt-auto flex items-center gap-2 text-xs text-gray-400">
                    {rating != null && rating > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-amber-500">
                            <Star className="size-3 fill-current" />
                            {Number(rating).toFixed(1)}
                        </span>
                    )}
                    <span>Đã bán {sold > 999 ? `${(sold / 1000).toFixed(1)}k` : sold}</span>
                </div>
            </div>
        </Link>
    );
}
