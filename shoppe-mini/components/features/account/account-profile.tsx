"use client";

import { Camera, CircleHelp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";

import {
    getUserProfile,
    updateUserAvatar,
    updateUserProfile,
} from "@/services/user/user.service";
import type { UserProfile } from "@/lib/user.types";
import { notify } from "@/lib/toast";
import {
    initialsFromName,
    maskEmail,
    usernameFromEmail,
} from "@/lib/format-profile";
import { useAuthStore } from "@/lib/auth-store";
import AccountShell from "./account-shell";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);

const profileSchema = z.object({
    fullName: z.string().trim().min(1, "Vui lòng nhập tên"),
    phone: z
        .string()
        .trim()
        .refine(
            (value) => value === "" || /^0\d{9,10}$/.test(value),
            "Số điện thoại không hợp lệ"
        ),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function getErrorMessage(error: unknown, fallback: string) {
    if (!isAxiosError(error)) return fallback;
    const message = (error.response?.data as { message?: string | string[] })
        ?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string" && message.trim()) return message;
    return fallback;
}

function ProfileSkeleton() {
    return (
        <AccountShell>
            <div className="animate-pulse rounded-sm bg-white px-6 py-5 shadow-sm ring-1 ring-black/[0.04]">
                <div className="h-7 w-40 rounded bg-gray-200" />
                <div className="mt-2 h-4 w-64 rounded bg-gray-100" />
                <div className="mt-5 h-px bg-gray-200" />
                <div className="mt-6 h-[420px] rounded bg-gray-100" />
            </div>
        </AccountShell>
    );
}

function FieldLabel({
    children,
    hint,
}: {
    children: React.ReactNode;
    hint?: boolean;
}) {
    return (
        <label className="mb-1.5 flex items-center gap-1 text-sm text-[#555] sm:mb-0 sm:w-[30%] sm:shrink-0 sm:justify-end sm:pr-6">
            {children}
            {hint && (
                <CircleHelp
                    className="size-3.5 text-gray-400"
                    aria-hidden="true"
                />
            )}
        </label>
    );
}

function FieldRow({
    label,
    hint,
    children,
}: {
    label: string;
    hint?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-[44px] flex-col border-b border-[#f5f5f5] py-3 transition-colors last:border-b-0 hover:bg-[#fafafa]/80 sm:flex-row sm:items-center">
            <FieldLabel hint={hint}>{label}</FieldLabel>
            <div className="flex flex-1 flex-wrap items-center gap-3 text-sm text-[#333]">
                {children}
            </div>
        </div>
    );
}

export default function AccountProfile() {
    const setUser = useAuthStore((state) => state.setUser);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarBroken, setAvatarBroken] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: { fullName: "", phone: "" },
    });

    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            setLoadError(null);
            try {
                const { data } = await getUserProfile();
                setProfile(data);
                setAvatarBroken(false);
                reset({
                    fullName: data.fullName,
                    phone: data.phone ?? "",
                });

                const currentUser = useAuthStore.getState().user;
                if (currentUser) {
                    setUser({
                        ...currentUser,
                        fullName: data.fullName,
                        email: data.email,
                        phone: data.phone,
                        avatar: data.avatar,
                        role: data.role,
                    });
                }
            } catch (error) {
                const message = getErrorMessage(
                    error,
                    "Không thể tải thông tin hồ sơ."
                );
                setLoadError(message);
                notify.error(message);
            } finally {
                setLoading(false);
            }
        };

        void loadProfile();
    }, [reset, setUser]);

    useEffect(() => {
        return () => {
            if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        };
    }, [avatarPreview]);

    const syncAuthUser = (data: UserProfile) => {
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) return;
        setUser({
            ...currentUser,
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            avatar: data.avatar,
        });
    };

    const onSubmit = async (values: ProfileFormValues) => {
        try {
            const payload = {
                fullName: values.fullName.trim(),
                phone: values.phone.trim(),
            };
            const { data } = await updateUserProfile(payload);
            setProfile(data);
            reset({
                fullName: data.fullName,
                phone: data.phone ?? "",
            });
            syncAuthUser(data);
            notify.success("Cập nhật hồ sơ thành công.");
        } catch (error) {
            notify.error(
                getErrorMessage(error, "Không thể cập nhật hồ sơ. Vui lòng thử lại.")
            );
        }
    };

    const handleAvatarChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
            notify.error("Chỉ hỗ trợ JPEG, PNG, WebP, GIF.");
            return;
        }
        if (file.size > MAX_AVATAR_SIZE) {
            notify.error("Dung lượng file tối đa 5 MB.");
            return;
        }

        const localPreview = URL.createObjectURL(file);
        setAvatarBroken(false);
        setAvatarPreview((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return localPreview;
        });

        setIsUploadingAvatar(true);
        try {
            const { data } = await updateUserAvatar(file);

            setProfile(data);
            setAvatarBroken(false);
            setAvatarPreview((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return null;
            });
            syncAuthUser(data);
            notify.success("Cập nhật ảnh đại diện thành công.");
        } catch (error) {
            setAvatarPreview((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return null;
            });
            notify.error(
                getErrorMessage(error, "Không thể tải ảnh lên. Vui lòng thử lại.")
            );
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    if (loading) return <ProfileSkeleton />;

    if (loadError || !profile) {
        return (
            <AccountShell>
                <div className="rounded-sm bg-white px-6 py-12 text-center shadow-sm ring-1 ring-black/[0.04]">
                    <p className="text-sm font-medium text-[#333]">
                        Không tải được hồ sơ
                    </p>
                    <p className="mt-1 text-sm text-[#999]">
                        {loadError ?? "Vui lòng thử lại."}
                    </p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="mt-4 rounded-sm bg-[#ee4d2d] px-5 py-2 text-sm text-white hover:opacity-90"
                    >
                        Tải lại
                    </button>
                </div>
            </AccountShell>
        );
    }

    const displayAvatar = avatarPreview ?? profile.avatar ?? null;
    const showAvatarImage = Boolean(displayAvatar) && !avatarBroken;
    const username = usernameFromEmail(profile.email);

    return (
        <AccountShell>
            <div className="rounded-sm bg-white px-6 py-5 shadow-sm ring-1 ring-black/[0.04]">
                <div className="flex items-start gap-3">
                    <span className="mt-1.5 h-5 w-1 shrink-0 rounded-full bg-[#ee4d2d]" />
                    <div>
                        <h1 className="text-xl font-normal capitalize text-[#333]">
                            Hồ Sơ Của Tôi
                        </h1>
                        <p className="mt-1 text-sm text-[#939393]">
                            Quản lý thông tin hồ sơ để bảo mật tài khoản
                        </p>
                    </div>
                </div>
                <div className="mt-4 h-px bg-[#efefef]" />

                <div className="mt-2 flex flex-col lg:flex-row">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="min-w-0 flex-1 py-2 lg:border-r lg:border-[#efefef] lg:pr-4"
                    >
                        <FieldRow label="Tên đăng nhập">
                            <span>{username}</span>
                        </FieldRow>

                        <FieldRow label="Tên">
                            <div className="w-full max-w-[420px]">
                                <input
                                    {...register("fullName")}
                                    type="text"
                                    className="w-full rounded-sm border border-[#dbdbdb] px-3 py-2 text-sm outline-none transition focus:border-[#ee4d2d] focus:shadow-[0_0_0_1px_#ee4d2d]"
                                />
                                {errors.fullName && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.fullName.message}
                                    </p>
                                )}
                            </div>
                        </FieldRow>

                        <FieldRow label="Email">
                            <span>{maskEmail(profile.email)}</span>
                        </FieldRow>

                        <FieldRow label="Số điện thoại">
                            <div className="w-full max-w-[420px]">
                                <input
                                    {...register("phone")}
                                    type="tel"
                                    inputMode="numeric"
                                    placeholder="0912345678"
                                    className="w-full rounded-sm border border-[#dbdbdb] px-3 py-2 text-sm outline-none transition focus:border-[#ee4d2d] focus:shadow-[0_0_0_1px_#ee4d2d]"
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>
                        </FieldRow>

                        <div className="flex pt-6 sm:pl-[30%]">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="min-w-[140px] rounded-sm bg-[#ee4d2d] px-8 py-2.5 text-sm font-normal text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isSubmitting ? "Đang lưu..." : "Lưu"}
                            </button>
                        </div>
                    </form>

                    <div className="flex flex-col items-center px-4 py-8 lg:w-[280px] lg:shrink-0">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingAvatar}
                            className="group relative disabled:cursor-not-allowed"
                        >
                            <div className="rounded-full p-0.5 ring-1 ring-[#efefef] transition group-hover:ring-[#ee4d2d]/40">
                                <div className="relative size-[100px] overflow-hidden rounded-full bg-[#d0011b]">
                                    {showAvatarImage ? (
                                        // eslint-disable-next-line @next/next/no-img-element -- S3 avatar URL; avoid next/image CORS quirks
                                        <img
                                            key={displayAvatar}
                                            src={displayAvatar!}
                                            alt="Ảnh đại diện"
                                            className="size-full object-cover transition group-hover:scale-105"
                                            onError={() => setAvatarBroken(true)}
                                        />
                                    ) : (
                                        <span className="flex size-full items-center justify-center text-3xl font-normal text-white">
                                            {initialsFromName(profile.fullName)}
                                        </span>
                                    )}
                                    <div
                                        className={`absolute inset-0 flex items-center justify-center bg-black/30 transition ${isUploadingAvatar
                                            ? "opacity-100"
                                            : "opacity-0 group-hover:opacity-100"
                                            }`}
                                    >
                                        {isUploadingAvatar ? (
                                            <span className="text-xs text-white">
                                                Đang tải...
                                            </span>
                                        ) : (
                                            <Camera className="size-5 text-white" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".jpeg,.jpg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            disabled={isUploadingAvatar}
                            onChange={handleAvatarChange}
                        />

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingAvatar}
                            className="mt-4 rounded-sm border border-[#dbdbdb] bg-white px-4 py-2 text-sm text-[#555] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isUploadingAvatar ? "Đang tải..." : "Chọn Ảnh"}
                        </button>

                        <ul className="mt-4 space-y-0.5 text-center text-xs leading-relaxed text-[#999]">
                            <li>Dung lượng tối đa 5 MB</li>
                            <li>Định dạng: JPEG, PNG, WebP, GIF</li>
                        </ul>
                    </div>
                </div>
            </div>
        </AccountShell>
    );
}
