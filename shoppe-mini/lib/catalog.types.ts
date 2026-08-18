export interface Category {
    id: number;
    name: string;
    slug: string;
    image?: string | null;
    parentId?: number | null;
    children?: Category[];
}

export interface ProductCategoryRef {
    id: number;
    name: string;
    slug: string;
}

export interface ProductListItem {
    id: number;
    name: string;
    slug: string;
    thumbnail?: string | null;
    price: number;
    discountPrice?: number | null;
    stock?: number;
    ratingAvg?: number | null;
    soldCount?: number | null;
    category?: ProductCategoryRef | null;
    categoryId?: number;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ProductListResponse {
    items: ProductListItem[];
    meta: PaginationMeta;
}

export interface ProductImage {
    id: number;
    url: string;
    sortOrder?: number;
}

export interface ProductVariant {
    id: number;
    name: string;
    sku: string;
    price: number;
    quantity?: number;
    stock?: number;
    warehouse?: string | null;
}

export interface ProductInventory {
    id?: number;
    variantId?: number | null;
    quantity: number;
    warehouse?: string | null;
}

export interface ProductDetail extends ProductListItem {
    description?: string | null;
    status?: string;
    images?: ProductImage[];
    variants?: ProductVariant[];
    inventory?: ProductInventory[];
}

export type ProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE";

export interface ProductListQuery {
    page?: number;
    limit?: number;
    categoryId?: number | string;
    q?: string;
    status?: ProductStatus | string;
}

export interface ManageProductItem extends ProductListItem {
    status?: ProductStatus | string;
    description?: string | null;
}

export interface CreateProductVariantInput {
    name: string;
    sku: string;
    price: number;
    quantity: number;
    warehouse?: string;
}

export interface CreateProductPayload {
    categoryId: number;
    name: string;
    slug?: string;
    description?: string;
    price: number;
    discountPrice?: number | null;
    status?: ProductStatus;
    quantity?: number;
    warehouse?: string;
    variants?: CreateProductVariantInput[];
}

export interface UpdateProductPayload {
    categoryId?: number;
    name?: string;
    slug?: string;
    description?: string;
    price?: number;
    discountPrice?: number | null;
    status?: ProductStatus;
}

export interface CreateCategoryPayload {
    name: string;
    slug?: string;
    parentId?: number | null;
}

export interface UpdateCategoryPayload {
    name?: string;
    slug?: string;
    parentId?: number | null;
}

export interface CreateVariantPayload {
    name: string;
    sku: string;
    price: number;
    quantity: number;
    warehouse?: string;
}

export interface UpdateVariantPayload {
    name?: string;
    sku?: string;
    price?: number;
}

export interface UpdateInventoryPayload {
    variantId?: number;
    quantity: number;
    warehouse?: string;
}
