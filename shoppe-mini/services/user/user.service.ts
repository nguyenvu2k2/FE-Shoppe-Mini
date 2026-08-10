import { api } from "@/lib/axios";
import type {
    ChangePasswordRequest,
    MessageResponse,
    UpdateProfileRequest,
    UserProfile,
} from "@/lib/user.types";

export const getUserProfile = async () => {
    return api.get<UserProfile>("users/me");
};

export const updateUserProfile = async (payload: UpdateProfileRequest) => {
    return api.patch<UserProfile>("users/me", payload);
};

export const changeUserPassword = async (payload: ChangePasswordRequest) => {
    return api.patch<MessageResponse>("users/me/password", payload);
};

/** POST multipart — BE upload S3 + cập nhật DB avatar */
export const updateUserAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post<UserProfile>("users/me/avatar", formData);
};