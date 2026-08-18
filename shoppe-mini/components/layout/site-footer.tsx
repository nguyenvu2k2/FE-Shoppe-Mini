import Link from "next/link";

const footerSections = [
    {
        title: "Về Shop Mini",
        links: [
            { label: "Giới thiệu", href: "#" },
            { label: "Tuyển dụng", href: "#" },
            { label: "Điều khoản", href: "#" },
            { label: "Chính sách bảo mật", href: "#" },
        ],
    },
    {
        title: "Hỗ trợ khách hàng",
        links: [
            { label: "Trung tâm hỗ trợ", href: "#" },
            { label: "Hướng dẫn mua hàng", href: "#" },
            { label: "Chính sách đổi trả", href: "#" },
            { label: "Phương thức thanh toán", href: "#" },
        ],
    },
    {
        title: "Mua sắm",
        links: [
            { label: "Trang chủ", href: "/" },
            { label: "Danh mục", href: "/categories" },
            { label: "Sản phẩm", href: "/products" },
            { label: "Giỏ hàng", href: "/cart" },
        ],
    },
];

export default function SiteFooter() {
    return (
        <footer className="mt-auto bg-gradient-to-b from-gray-900 to-[#1a1a1a] text-gray-300">
            <div className="mx-auto max-w-[1200px] px-4 pt-12 pb-8">
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <Link href="/" className="inline-flex items-center gap-2">
                            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ee4d2d] to-[#ff8c5a] text-sm font-black italic text-white">
                                S
                            </span>
                            <span className="text-xl font-bold text-white">
                                shop
                                <span className="text-[#ff8c5a]">mini</span>
                            </span>
                        </Link>
                        <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-400">
                            Nền tảng mua sắm trực tuyến hiện đại — nhanh chóng, tiện lợi và an
                            toàn. Ưu đãi mỗi ngày dành riêng cho bạn.
                        </p>
                    </div>

                    {footerSections.map((section) => (
                        <div key={section.title}>
                            <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
                                {section.title}
                            </h3>
                            <ul className="mt-4 space-y-2.5">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-gray-400 transition hover:text-[#ff8c5a]"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-10 border-t border-white/10 pt-8 text-center">
                    <p className="text-xs text-gray-500">
                        © {new Date().getFullYear()} Shop Mini. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
