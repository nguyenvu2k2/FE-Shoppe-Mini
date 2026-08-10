"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";

import { resetPassword } from "@/services/auth/auth.service";
import { notify } from "@/lib/toast";

const resetPasswordSchema = z
    .object({
        newPassword: z.string().trim().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
        confirmPassword: z.string().trim().min(1, "Vui lòng nhập lại mật khẩu"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Mật khẩu và xác nhận mật khẩu không khớp",
    });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });

    if (!token) {
        return (
            <div className="rounded-sm bg-white px-7.5 py-7.5 shadow-md">
                <h1 className="mb-4 text-xl text-gray-800">Link không hợp lệ</h1>
                <p className="text-sm text-gray-600">
                    Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu
                    link mới.
                </p>
                <Link
                    href="/forgot-password"
                    className="mt-6 inline-block text-sm text-[#ee4d2d] hover:opacity-80"
                >
                    Gửi lại link đặt lại mật khẩu
                </Link>
            </div>
        );
    }

    const onSubmit = async (values: ResetPasswordValues) => {
        try {
            await resetPassword(token, values.newPassword.trim());
            notify.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập.");
            router.replace("/login");
        } catch (error) {
            const message = isAxiosError(error)
                ? (error.response?.data as { message?: string })?.message
                : undefined;
            notify.error(
                message ?? "Không thể đặt lại mật khẩu. Link có thể đã hết hạn."
            );
        }
    };

    return (
        <div className="rounded-sm bg-white px-7.5 py-7.5 shadow-md">
            <h1 className="mb-2 text-xl text-gray-800">Đặt lại mật khẩu</h1>
            <p className="mb-6 text-sm text-gray-500">Nhập mật khẩu mới cho tài khoản của bạn.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
                <div>
                    <div className="relative">
                        <input
                            {...register("newPassword")}
                            type={showPassword ? "text" : "password"}
                            placeholder="Mật khẩu mới"
                            autoComplete="new-password"
                            className="w-full rounded-sm border border-gray-300 px-3 py-2.5 pr-10 text-sm outline-none focus:border-[#ee4d2d] focus:shadow-[0_0_0_1px_#ee4d2d]"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                    {errors.newPassword && (
                        <p className="mt-1 text-sm text-red-500">{errors.newPassword.message}</p>
                    )}
                </div>

                <div>
                    <div className="relative">
                        <input
                            {...register("confirmPassword")}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Nhập lại mật khẩu mới"
                            autoComplete="new-password"
                            className="w-full rounded-sm border border-gray-300 px-3 py-2.5 pr-10 text-sm outline-none focus:border-[#ee4d2d] focus:shadow-[0_0_0_1px_#ee4d2d]"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="size-4" />
                            ) : (
                                <Eye className="size-4" />
                            )}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-1 w-full rounded-sm bg-[#ee4d2d] py-3 text-sm font-medium uppercase text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSubmitting ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
                <Link href="/login" className="text-[#ee4d2d] hover:opacity-80">
                    Quay lại đăng nhập
                </Link>
            </p>
        </div>
    );
}
