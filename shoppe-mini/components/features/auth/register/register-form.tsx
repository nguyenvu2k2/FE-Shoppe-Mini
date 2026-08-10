"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import GoogleLoginButton from "../google-login-button";
import { registerAuthService } from "@/services/auth/auth.service";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { notify } from "@/lib/toast";

const registerSchema = z
    .object({
        fullName: z.string().trim().min(1, "Vui lòng nhập họ và tên"),
        email: z.string().trim().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
        password: z.string().trim().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
        confirmPassword: z.string().trim().min(1, "Vui lòng nhập lại mật khẩu"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Mật khẩu và xác nhận mật khẩu không khớp",
    });

type RegisterFormValues = z.infer<typeof registerSchema>;
export default function RegisterForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (values: RegisterFormValues) => {
        try {
            const formData = {
                fullName: values.fullName.trim(),
                email: values.email.trim(),
                password: values.password.trim(),
                role: "customer",
            };
            const response = await registerAuthService(formData);
            if (response.status === 201) {
                router.push("/login");
                notify.success("Đăng ký thành công");
            }
        } catch (error) {
            notify.error("Đăng ký thất bại");
        }
    };

    return (
        <div className="rounded-sm bg-white px-[30px] py-[30px] shadow-md">
            <h1 className="mb-6 text-xl text-gray-800">Đăng ký</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
                <div className="flex flex-col gap-3">
                    <div>
                        <input
                            {...register("fullName")}
                            type="text"
                            placeholder="Họ và tên"
                            className="w-full rounded-sm border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#ee4d2d] focus:shadow-[0_0_0_1px_#ee4d2d]"
                        />
                        {errors.fullName && (
                            <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>
                        )}
                    </div>

                    <div>
                        <input
                            {...register("email")}
                            type="text"
                            placeholder="Email"
                            className="w-full rounded-sm border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#ee4d2d] focus:shadow-[0_0_0_1px_#ee4d2d]"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <div className="relative">
                            <input
                                {...register("password")}
                                type={showPassword ? "text" : "password"}
                                placeholder="Mật khẩu"
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
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                        )}
                    </div>

                    <div>
                        <div className="relative">
                            <input
                                {...register("confirmPassword")}
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Nhập lại mật khẩu"
                                className="w-full rounded-sm border border-gray-300 px-3 py-2.5 pr-10 text-sm outline-none focus:border-[#ee4d2d] focus:shadow-[0_0_0_1px_#ee4d2d]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                            >
                                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-4 flex w-full justify-center rounded-sm bg-[#ee4d2d] py-3 text-sm font-medium uppercase text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
                    </button>
                </div>
            </form>

            <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-300" />
                <span className="text-xs text-gray-400 uppercase">Hoặc</span>
                <div className="h-px flex-1 bg-gray-300" />
            </div>

            <GoogleLoginButton />

            <p className="p-2 mt-8 text-center text-sm text-gray-500">
                Bạn đã có tài khoản?{" "}
                <Link href="/login" className="text-[#ee4d2d] hover:opacity-80">
                    Đăng nhập
                </Link>
            </p>
        </div>
    );
}
