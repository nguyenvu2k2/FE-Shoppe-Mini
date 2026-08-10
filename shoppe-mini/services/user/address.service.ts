import { api } from "@/lib/axios";
import type {
    Address,
    CreateAddressRequest,
    UpdateAddressRequest,
} from "@/lib/address.types";
import type { MessageResponse } from "@/lib/user.types";

export const listAddresses = async () => {
    return api.get<Address[]>("users/me/addresses");
};

export const createAddress = async (payload: CreateAddressRequest) => {
    return api.post<Address>("users/me/addresses", payload);
};

export const updateAddress = async (
    id: number,
    payload: UpdateAddressRequest
) => {
    return api.patch<Address>(`users/me/addresses/${id}`, payload);
};

export const deleteAddress = async (id: number) => {
    return api.delete<MessageResponse>(`users/me/addresses/${id}`);
};

export const setAddressDefault = async (id: number) => {
    return api.patch<Address>(`users/me/addresses/${id}/default`);
};
