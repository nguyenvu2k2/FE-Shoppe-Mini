import { create } from "zustand";

import type { Cart } from "@/lib/cart.types";
import {
    addCartItem,
    clearCart as clearCartApi,
    getCart,
    removeCartItem,
    updateCartItem,
} from "@/services/cart/cart.service";
import type { AddCartItemPayload } from "@/lib/cart.types";

interface CartState {
    cart: Cart | null;
    isLoading: boolean;
    /** Số hiển thị trên badge header */
    badgeCount: number;

    setCart: (cart: Cart | null) => void;
    clearLocal: () => void;
    fetchCart: () => Promise<Cart | null>;
    addItem: (payload: AddCartItemPayload) => Promise<Cart>;
    updateItemQuantity: (itemId: number, quantity: number) => Promise<Cart>;
    removeItem: (itemId: number) => Promise<void>;
    clearAll: () => Promise<void>;
}

function badgeFromCart(cart: Cart | null) {
    if (!cart?.summary) return 0;
    return cart.summary.totalQuantity ?? cart.summary.itemCount ?? 0;
}

function applyCart(set: (partial: Partial<CartState>) => void, cart: Cart | null) {
    set({
        cart,
        badgeCount: badgeFromCart(cart),
    });
}

export const useCartStore = create<CartState>((set, get) => ({
    cart: null,
    isLoading: false,
    badgeCount: 0,

    setCart: (cart) => applyCart(set, cart),

    clearLocal: () =>
        set({
            cart: null,
            badgeCount: 0,
            isLoading: false,
        }),

    fetchCart: async () => {
        set({ isLoading: true });
        try {
            const { data } = await getCart();
            applyCart(set, data);
            return data;
        } catch {
            applyCart(set, null);
            return null;
        } finally {
            set({ isLoading: false });
        }
    },

    addItem: async (payload) => {
        const { data } = await addCartItem(payload);
        // Một số BE trả cart đầy đủ; nếu không thì refetch
        if (data?.items && data?.summary) {
            applyCart(set, data);
            return data;
        }
        const cart = await get().fetchCart();
        if (!cart) throw new Error("Không lấy được giỏ hàng sau khi thêm");
        return cart;
    },

    updateItemQuantity: async (itemId, quantity) => {
        const { data } = await updateCartItem(itemId, { quantity });
        if (data?.items && data?.summary) {
            applyCart(set, data);
            return data;
        }
        const cart = await get().fetchCart();
        if (!cart) throw new Error("Không cập nhật được giỏ hàng");
        return cart;
    },

    removeItem: async (itemId) => {
        const { data } = await removeCartItem(itemId);
        if (data?.items && data?.summary) {
            applyCart(set, data);
            return;
        }
        await get().fetchCart();
    },

    clearAll: async () => {
        await clearCartApi();
        applyCart(set, {
            id: get().cart?.id ?? 0,
            items: [],
            summary: {
                itemCount: 0,
                totalQuantity: 0,
                availableItemCount: 0,
                subtotal: 0,
            },
        });
    },
}));
