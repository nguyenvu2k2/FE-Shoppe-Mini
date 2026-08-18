import { api } from "@/lib/axios";
import type {
    AddCartItemPayload,
    Cart,
    UpdateCartItemPayload,
} from "@/lib/cart.types";

export const getCart = async () => {
    return api.get<Cart>("cart");
};

export const addCartItem = async (payload: AddCartItemPayload) => {
    return api.post<Cart>("cart/items", payload);
};

export const updateCartItem = async (
    itemId: number,
    payload: UpdateCartItemPayload
) => {
    return api.patch<Cart>(`cart/items/${itemId}`, payload);
};

export const removeCartItem = async (itemId: number) => {
    return api.delete<Cart>(`cart/items/${itemId}`);
};

export const clearCart = async () => {
    return api.delete<Cart | void>("cart");
};
