export interface CartProductRef {
    id: number;
    name: string;
    slug: string;
    thumbnail?: string | null;
    status?: string;
    price?: number;
    discountPrice?: number | null;
}

export interface CartVariantRef {
    id: number;
    name: string;
    sku?: string;
    price?: number;
}

export interface CartItem {
    id: number;
    productId: number;
    variantId?: number | null;
    product?: CartProductRef | null;
    variant?: CartVariantRef | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    availableStock: number;
    isAvailable: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CartSummary {
    itemCount: number;
    totalQuantity: number;
    availableItemCount: number;
    subtotal: number;
}

export interface Cart {
    id: number;
    updatedAt?: string;
    items: CartItem[];
    summary: CartSummary;
}

export interface AddCartItemPayload {
    productId: number;
    quantity: number;
    variantId?: number;
}

export interface UpdateCartItemPayload {
    quantity: number;
}
