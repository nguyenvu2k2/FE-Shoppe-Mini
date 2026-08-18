import { api } from "@/lib/axios";
import type {
    Category,
    CreateCategoryPayload,
    UpdateCategoryPayload,
} from "@/lib/catalog.types";

export const getCategories = async () => {
    return api.get<Category[]>("categories");
};

export const getCategoryTree = async () => {
    return api.get<Category[]>("categories/tree");
};

export const getCategoryByIdOrSlug = async (idOrSlug: string | number) => {
    return api.get<Category>(`categories/${idOrSlug}`);
};

export const createCategory = async (payload: CreateCategoryPayload) => {
    return api.post<Category>("categories", payload);
};

export const updateCategory = async (
    id: number,
    payload: UpdateCategoryPayload
) => {
    return api.patch<Category>(`categories/${id}`, payload);
};

export const deleteCategory = async (id: number) => {
    return api.delete(`categories/${id}`);
};

export const uploadCategoryImage = async (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<Category>(`categories/${id}/image`, formData);
};
