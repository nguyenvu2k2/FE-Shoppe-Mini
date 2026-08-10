import { Suspense } from "react";

import AuthLayout from "@/components/features/auth/auth-layout";
import ResetPasswordForm from "@/components/features/auth/reset-password-form";

function ResetPasswordFallback() {
    return (
        <div className="rounded-sm bg-white px-7.5 py-7.5 shadow-md">
            <p className="text-sm text-gray-500">Đang tải...</p>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <AuthLayout title="Đặt lại mật khẩu">
            <Suspense fallback={<ResetPasswordFallback />}>
                <ResetPasswordForm />
            </Suspense>
        </AuthLayout>
    );
}
