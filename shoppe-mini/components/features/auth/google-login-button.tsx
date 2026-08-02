import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { api } from "../../../lib/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function GoogleLoginButton() {
    const router = useRouter();

    const handleSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            // credentialResponse.credential là Google ID Token (JWT do Google ký)
            const { data } = await api.post("/auth/google", {
                idToken: credentialResponse.credential,
            });

            // Backend verify token với Google, trả về accessToken/refreshToken như login thường
            Cookies.set("access_token", data.accessToken, { expires: 1 });
            Cookies.set("refresh_token", data.refreshToken, { expires: 7 });

            router.push("/");
        } catch (error) {
            console.error("Google login thất bại:", error);
        }
    };

    return (
        <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => console.error("Google login lỗi")}
            useOneTap
        />
    );
}