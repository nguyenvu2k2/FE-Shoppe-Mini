"use client";

import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";

import { changeUserPassword } from "@/services/user/user.service";
import { logout } from "@/services/auth/auth.service";
import { notify } from "@/lib/toast";
import { useAuthStore } from "@/lib/auth-store";
import { useCartStore } from "@/lib/cart-store";
import AccountShell from "./account-shell";
import { disconnectSocket } from "@/lib/socket";

const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
        newPassword: z
            .string()
            .trim()
            .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
        confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu mới"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Mật khẩu và xác nhận mật khẩu không khớp",
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        path: ["newPassword"],
        message: "Mật khẩu mới phải khác mật khẩu hiện tại",
    });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

function getErrorMessage(error: unknown, fallback: string) {
    if (!isAxiosError(error)) return fallback;
    const message = (error.response?.data as { message?: string | string[] })
        ?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string" && message.trim()) return message;
    return fallback;
}

function PasswordField({
    label,
    error,
    show,
    onToggleShow,
    registration,
    autoComplete,
    placeholder,
}: {
    label: string;
    error?: string;
    show: boolean;
    onToggleShow: () => void;
    registration: UseFormRegisterReturn;
    autoComplete: string;
    placeholder: string;
}) {
    return (
        <div className="flex min-h-[44px] flex-col items-stretch border-b border-[#f5f5f5] py-3 last:border-b-0 sm:flex-row sm:items-start">
            <label className="mb-1.5 text-sm text-[#555] sm:mb-0 sm:flex sm:w-[30%] sm:shrink-0 sm:items-center sm:justify-end sm:pr-6 sm:pt-2">
                {label}
            </label>
            <div className="w-full max-w-[420px]">
                <div className="relative">
                    <input
                        {...registration}
                        type={show ? "text" : "password"}
                        autoComplete={autoComplete}
                        placeholder={placeholder}
                        className="w-full rounded-sm border border-[#dbdbdb] px-3 py-2 pr-10 text-sm outline-none transition focus:border-[#ee4d2d] focus:shadow-[0_0_0_1px_#ee4d2d]"
                    />
                    <button
                        type="button"
                        onClick={onToggleShow}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                        {show ? (
                            <EyeOff className="size-4" />
                        ) : (
                            <Eye className="size-4" />
                        )}
                    </button>
                </div>
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>
        </div>
    );
}

export default function AccountChangePassword() {
    const router = useRouter();
    const clearUser = useAuthStore((state) => state.clearUser);

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ChangePasswordValues>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (values: ChangePasswordValues) => {
        try {
            const { data } = await changeUserPassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword.trim(),
            });

            notify.success(
                data.message ||
                "Đổi mật khẩu thành công. Vui lòng đăng nhập lại."
            );

            try {
                await logout();
            } catch {
                // ignore
            }

            clearUser();
            useCartStore.getState().clearLocal();
            disconnectSocket();
            router.replace("/login");
        } catch (error) {
            notify.error(
                getErrorMessage(
                    error,
                    "Không thể đổi mật khẩu. Vui lòng thử lại."
                )
            );
        }
    };

    return (
        <AccountShell>
            <div className="rounded-sm bg-white px-6 py-5 shadow-sm ring-1 ring-black/[0.04]">
                <div className="flex items-start gap-3">
                    <span className="mt-1.5 h-5 w-1 shrink-0 rounded-full bg-[#ee4d2d]" />
                    <div>
                        <h1 className="text-xl font-normal capitalize text-[#333]">
                            Bảo mật
                        </h1>
                        <p className="mt-1 text-sm text-[#939393]">
                            Đổi mật khẩu tài khoản. Sau khi đổi, bạn sẽ cần đăng
                            nhập lại.
                        </p>
                    </div>
                </div>
                <div className="mt-4 h-px bg-[#efefef]" />

                <p className="mt-4 rounded-sm bg-[#fff8f6] px-3 py-2 text-xs text-[#8a5a4a]">
                    Tài khoản chỉ đăng nhập bằng Google (không có mật khẩu local)
                    sẽ không đổi được mật khẩu qua form này.
                </p>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="mt-2 max-w-[720px] py-2"
                >
                    <PasswordField
                        label="Mật khẩu hiện tại"
                        registration={register("currentPassword")}
                        show={showCurrent}
                        onToggleShow={() => setShowCurrent((prev) => !prev)}
                        error={errors.currentPassword?.message}
                        autoComplete="current-password"
                        placeholder="Nhập mật khẩu hiện tại"
                    />
                    <PasswordField
                        label="Mật khẩu mới"
                        registration={register("newPassword")}
                        show={showNew}
                        onToggleShow={() => setShowNew((prev) => !prev)}
                        error={errors.newPassword?.message}
                        autoComplete="new-password"
                        placeholder="Ít nhất 6 ký tự"
                    />
                    <PasswordField
                        label="Xác nhận mật khẩu"
                        registration={register("confirmPassword")}
                        show={showConfirm}
                        onToggleShow={() => setShowConfirm((prev) => !prev)}
                        error={errors.confirmPassword?.message}
                        autoComplete="new-password"
                        placeholder="Nhập lại mật khẩu mới"
                    />

                    <div className="flex pt-6 sm:pl-[30%]">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="min-w-[140px] rounded-sm bg-[#ee4d2d] px-8 py-2.5 text-sm font-normal text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSubmitting ? "Đang lưu..." : "Xác nhận"}
                        </button>
                    </div>
                </form>
            </div>
        </AccountShell>
    );
}
