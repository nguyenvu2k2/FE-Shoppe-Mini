export interface Address {
    id: number;
    fullName: string;
    phone: string;
    addressLine: string;
    ward: string;
    district: string;
    province: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAddressRequest {
    fullName: string;
    phone: string;
    addressLine: string;
    ward: string;
    district: string;
    province: string;
    isDefault?: boolean;
}

export interface UpdateAddressRequest {
    fullName?: string;
    phone?: string;
    addressLine?: string;
    ward?: string;
    district?: string;
    province?: string;
    isDefault?: boolean;
}
