"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { AxiosError } from "axios";

import GoogleLoginButton from "./google-login-button";
import { login } from "@/services/auth/auth.service";
import { getPostLoginRedirect, parseUserResponse } from "@/lib/auth.types";
import { establishSession, hydrateAuthSession } from "@/lib/auth-session";
import { useAuthStore } from "@/lib/auth-store";
import { notify } from "@/lib/toast";

const loginSchema = z.object({
    email: z.string().trim().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
    password: z.string().trim().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginFormInner() {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl");
    const sessionExpired = searchParams.get("session") === "expired";
    const user = useAuthStore((s) => s.user);

    useEffect(() => {
        if (sessionExpired) {
            notify.info("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        }
    }, [sessionExpired]);

    useEffect(() => {
        let cancelled = false;

        const check = async () => {
            if (user) {
                router.replace(getPostLoginRedirect(user, callbackUrl));
                return;
            }
            const sessionUser = await hydrateAuthSession();
            if (!cancelled && sessionUser) {
                router.replace(getPostLoginRedirect(sessionUser, callbackUrl));
            }
        };

        void check();
        return () => {
            cancelled = true;
        };
    }, [user, callbackUrl, router]);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: LoginFormValues) => {
        try {
            const { data } = await login({
                email: values.email.trim(),
                password: values.password,
            });
            const user = parseUserResponse(data);
            if (!user) {
                notify.error("Phản hồi từ server không hợp lệ.");
                return;
            }

            const sessionUser = await establishSession(user);
            const redirectTo = getPostLoginRedirect(sessionUser, callbackUrl);
            router.replace(redirectTo);
            notify.success("Đăng nhập thành công");
        } catch (error) {
            const message =
                error instanceof AxiosError
                    ? (error.response?.data as { message?: string | string[] })
                          ?.message
                    : null;
            const text = Array.isArray(message)
                ? message.join(", ")
                : message || "Đăng nhập thất bại";
            notify.error(text);
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
                            type="email"
                            autoComplete="email"
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
                                autoComplete="current-password"
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
                            <Link href="/forgot-password" className="text-sm text-[#05a] hover:opacity-80">
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
            </form>

            <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-300" />
                <span className="text-xs text-gray-400 uppercase">Hoặc</span>
                <div className="h-px flex-1 bg-gray-300" />
            </div>

            <GoogleLoginButton callbackUrl={callbackUrl} />

            <p className="mt-8 p-2 text-center text-sm text-gray-500">
                Bạn mới biết đến Shop Mini?{" "}
                <Link href="/register" className="text-[#ee4d2d] hover:opacity-80">
                    Đăng ký
                </Link>
            </p>
        </div>
    );
}

export default function LoginForm() {
    return (
        <Suspense
            fallback={
                <div className="rounded-sm bg-white px-7.5 py-7.5 shadow-md">
                    <p className="text-sm text-gray-500">Đang tải...</p>
                </div>
            }
        >
            <LoginFormInner />
        </Suspense>
    );
}
