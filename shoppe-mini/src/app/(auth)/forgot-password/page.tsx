import AuthLayout from "@/components/features/auth/auth-layout";
import ForgotPasswordForm from "@/components/features/auth/forgot-password-form";

export default function ForgotPasswordPage() {
    return (
        <AuthLayout title="Quên mật khẩu">
            <ForgotPasswordForm />
        </AuthLayout>
    );
}
