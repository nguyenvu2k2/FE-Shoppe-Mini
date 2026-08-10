export type UserRole = "ADMIN" | "CUSTOMER";

export interface UserProfile {
    id: number;
    email: string;
    fullName: string;
    phone?: string | null;
    avatar?: string | null;
    role: UserRole | string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateProfileRequest {
    fullName?: string;
    phone?: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface MessageResponse {
    message: string;
}