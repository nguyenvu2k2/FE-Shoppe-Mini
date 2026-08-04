import AuthLayout from "@/components/features/auth/auth-layout";
import LoginForm from "@/components/features/auth/login-form";

export default function LoginPage() {
    return (
        <AuthLayout title="Đăng nhập">
            <LoginForm />
        </AuthLayout>
    );
}
