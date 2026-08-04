import AuthLayout from "@/components/features/auth/auth-layout";
import RegisterForm from "@/components/features/auth/register/register-form";

export default function RegisterPage() {
    return (
        <AuthLayout title="Đăng ký">
            <RegisterForm />
        </AuthLayout>
    );
}
