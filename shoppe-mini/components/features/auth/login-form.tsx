"use client";

import Link from "next/link";
import { Eye, EyeOff, Info } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import GoogleLoginButton from "./google-login-button";
import { getProfile, login } from "@/services/auth/auth.service";
import { saveTokens } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
import { useAuthStore } from "@/src/app/(store)/auth/auth..store";

const loginSchema = z.object({
    email: z.string().trim().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
    password: z.string().trim().min(1, "Vui lòng nhập mật khẩu"),
    role: z.enum(["customer", "seller"]),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { setUser } = useAuthStore.getState();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            role: "customer",
        },
    });

    const onSubmit = async (values: LoginFormValues) => {
        try {
            const response = await login(values);
            const isSuccess = response.status === 200 || response.status === 201;

            if (isSuccess) {
                saveTokens(response.data.accessToken, response.data.refreshToken);
            }
            const profile = await getProfile();
            if (profile.status === 200 || profile.status === 201) {
                console.log("Profile data:", profile.data);
                setUser(profile.data);
            }

            router.replace("/shop");
            notify.loginSuccess();
        } catch (error) {
            console.error("Login error:", error);
            notify.serverError();
        }
    };

    return (
        <div className="rounded-sm bg-white px-7.5 py-7.5 shadow-md">
            <h1 className="mb-6 text-xl text-gray-800">Đăng nhập</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
                <div className="flex flex-col gap-3">
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
                        <div className="mt-1 text-right">
                            <Link href="#" className="text-sm text-[#05a] hover:opacity-80">
                                Quên mật khẩu?
                            </Link>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-4 w-full rounded-sm bg-[#ee4d2d] py-3 text-sm font-medium uppercase text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
                </button>

                <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                    <input
                        type="checkbox"
                        {...register("role")}
                        value="customer"
                        className="size-4 accent-[#ee4d2d]"
                    />
                    Duy trì đăng nhập
                    <Info className="size-3.5 text-gray-400" />
                </label>
            </form>

            <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-300" />
                <span className="text-xs text-gray-400 uppercase">Hoặc</span>
                <div className="h-px flex-1 bg-gray-300" />
            </div>

            <GoogleLoginButton />

            <p className="p-2 mt-8 text-center text-sm text-gray-500">
                Bạn mới biết đến Shoppe?{" "}
                <Link href="/register" className="text-[#ee4d2d] hover:opacity-80">
                    Đăng ký
                </Link>
            </p>
        </div>
    );
}
