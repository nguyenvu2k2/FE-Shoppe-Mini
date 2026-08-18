/** Format VND — 100000 → 100.000₫ */
export function formatPrice(value?: number | null): string {
    if (value == null || Number.isNaN(Number(value))) return "—";
    return `${Number(value).toLocaleString("vi-VN")}₫`;
}

export function getDisplayPrice(price: number, discountPrice?: number | null) {
    const hasDiscount =
        discountPrice != null &&
        discountPrice > 0 &&
        discountPrice < price;

    return {
        current: hasDiscount ? discountPrice! : price,
        original: hasDiscount ? price : null,
        hasDiscount,
    };
}
