import LoginForm from "@/components/features/auth/login-form";
import GoogleLoginButton from "@/components/features/auth/google-login-button";

export default function LoginPage() {
    return (
        <div className="max-w-sm mx-auto mt-10 space-y-4">
            <LoginForm />
            <div className="text-center text-sm text-gray-500">hoặc</div>
            <GoogleLoginButton />
        </div>
    );
}