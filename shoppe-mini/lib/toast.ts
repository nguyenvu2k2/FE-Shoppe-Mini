import { toast } from "sonner";

export const notify = {
    loginSuccess: () =>
        toast.success("Đăng nhập thành công"),

    registerSuccess: () =>
        toast.success("Đăng ký thành công"),

    logoutSuccess: () =>
        toast.success("Đăng xuất thành công"),

    serverError: () =>
        toast.error("Có lỗi xảy ra, vui lòng thử lại."),
};