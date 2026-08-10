"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { forgotPassword } from "@/services/auth/auth.service";
import { notify } from "@/lib/toast";

const forgotPasswordSchema = z.object({
    email: z.string().trim().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
    const [submitted, setSubmitted] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
    });

    const onSubmit = async (values: ForgotPasswordValues) => {
        try {
            await forgotPassword(values.email.trim());
            setSubmitted(true);
            notify.success("Yêu cầu đã được gửi. Vui lòng kiểm tra email.");
        } catch {
            notify.error("Không thể gửi yêu cầu. Vui lòng thử lại.");
        }
    };

    if (submitted) {
        return (
            <div className="rounded-sm bg-white px-7.5 py-7.5 shadow-md">
                <h1 className="mb-4 text-xl text-gray-800">Kiểm tra email</h1>
                <p className="text-sm leading-relaxed text-gray-600">
                    Nếu email đã đăng ký, bạn sẽ nhận được link đặt lại mật khẩu trong
                    vài phút. Hãy kiểm tra cả hộp thư spam.
                </p>
                <Link
                    href="/login"
                    className="mt-6 inline-block text-sm text-[#ee4d2d] hover:opacity-80"
                >
                    Quay lại đăng nhập
                </Link>
            </div>
        );
    }

    return (
        <div className="rounded-sm bg-white px-7.5 py-7.5 shadow-md">
            <h1 className="mb-2 text-xl text-gray-800">Quên mật khẩu</h1>
            <p className="mb-4 text-sm text-gray-500">
                Nhập email đã đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu.
            </p>

            <div
                role="note"
                className="mb-6 flex gap-2 rounded-sm border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900"
            >
                <Info className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden="true" />
                <p>
                    <span className="font-medium">Lưu ý:</span> Tính năng này chỉ áp dụng cho tài
                    khoản đăng ký bằng email và mật khẩu. Hiện chưa hỗ trợ đặt lại mật khẩu cho
                    tài khoản đăng nhập bằng Google hoặc phương thức khác.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
                <div>
                    <input
                        {...register("email")}
                        type="email"
                        placeholder="Email"
                        autoComplete="email"
                        className="w-full rounded-sm border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#ee4d2d] focus:shadow-[0_0_0_1px_#ee4d2d]"
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-4 w-full rounded-sm bg-[#ee4d2d] py-3 text-sm font-medium uppercase text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSubmitting ? "Đang gửi..." : "Gửi link đặt lại"}
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
