import { getDisplayPrice, formatPrice } from "@/lib/format-price";
import { cn } from "@/lib/utils";

type PriceProps = {
    price: number;
    discountPrice?: number | null;
    className?: string;
    size?: "sm" | "md" | "lg";
};

const sizeMap = {
    sm: { current: "text-sm", original: "text-xs" },
    md: { current: "text-base", original: "text-sm" },
    lg: { current: "text-2xl", original: "text-sm" },
};

export default function Price({
    price,
    discountPrice,
    className,
    size = "md",
}: PriceProps) {
    const { current, original, hasDiscount } = getDisplayPrice(
        price,
        discountPrice
    );
    const sizes = sizeMap[size];

    return (
        <div className={cn("flex flex-wrap items-baseline gap-1.5", className)}>
            <span
                className={cn(
                    "font-semibold text-[#ee4d2d]",
                    sizes.current
                )}
            >
                {formatPrice(current)}
            </span>
            {hasDiscount && original != null && (
                <span
                    className={cn(
                        "text-gray-400 line-through",
                        sizes.original
                    )}
                >
                    {formatPrice(original)}
                </span>
            )}
        </div>
    );
}
