import { api } from "@/lib/axios";
import type {
    CreateProductPayload,
    CreateVariantPayload,
    ProductDetail,
    ProductListQuery,
    ProductListResponse,
    UpdateInventoryPayload,
    UpdateProductPayload,
    UpdateVariantPayload,
} from "@/lib/catalog.types";

export const getProducts = async (params: ProductListQuery = {}) => {
    return api.get<ProductListResponse>("products", {
        params: {
            page: params.page,
            limit: params.limit,
            categoryId: params.categoryId,
            q: params.q || undefined,
        },
    });
};

/** Admin — có filter status */
export const getManageProducts = async (params: ProductListQuery = {}) => {
    return api.get<ProductListResponse>("products/manage", {
        params: {
            page: params.page,
            limit: params.limit,
            categoryId: params.categoryId,
            q: params.q || undefined,
            status: params.status || undefined,
        },
    });
};

export const getProductByIdOrSlug = async (idOrSlug: string | number) => {
    return api.get<ProductDetail>(`products/${idOrSlug}`);
};

export const createProduct = async (payload: CreateProductPayload) => {
    return api.post<ProductDetail>("products", payload);
};

export const updateProduct = async (
    id: number,
    payload: UpdateProductPayload
) => {
    return api.patch<ProductDetail>(`products/${id}`, payload);
};

export const deleteProduct = async (id: number) => {
    return api.delete(`products/${id}`);
};

export const uploadProductThumbnail = async (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<ProductDetail>(`products/${id}/thumbnail`, formData);
};

export const uploadProductImage = async (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<ProductDetail>(`products/${id}/images`, formData);
};

export const deleteProductImage = async (id: number, imageId: number) => {
    return api.delete(`products/${id}/images/${imageId}`);
};

export const createProductVariant = async (
    id: number,
    payload: CreateVariantPayload
) => {
    return api.post<ProductDetail>(`products/${id}/variants`, payload);
};

export const updateProductVariant = async (
    id: number,
    variantId: number,
    payload: UpdateVariantPayload
) => {
    return api.patch<ProductDetail>(
        `products/${id}/variants/${variantId}`,
        payload
    );
};

export const deleteProductVariant = async (id: number, variantId: number) => {
    return api.delete(`products/${id}/variants/${variantId}`);
};

export const updateProductInventory = async (
    id: number,
    payload: UpdateInventoryPayload
) => {
    return api.patch<ProductDetail>(`products/${id}/inventory`, payload);
};
