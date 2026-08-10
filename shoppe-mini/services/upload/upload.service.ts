import { api } from "@/lib/axios";
import type { UploadResponse } from "@/lib/upload.types";

export const uploadFile = async (file: File, folder = "avatars") => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post<UploadResponse>(`files/upload?folder=${folder}`, formData);
};
