import Link from "next/link";

interface AuthLayoutProps {
    title: string;
    children: React.ReactNode;
}

export default function AuthLayout({ title, children }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="bg-white shadow-sm">
                <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="text-2xl font-bold italic text-[#ee4d2d]"
                        >
                            shoppe-mini
                        </Link>
                        <div className="h-6 w-px bg-gray-300" />
                        <span className="text-xl text-gray-700">{title}</span>
                    </div>
                    <Link
                        href="#"
                        className="text-sm text-[#ee4d2d] hover:opacity-80"
                    >
                        Bạn cần giúp đỡ?
                    </Link>
                </div>
            </header>

            <main className="flex-1 bg-[#ee4d2d]">
                <div className="mx-auto flex min-h-[600px] max-w-[1200px] items-center gap-8 px-4 py-10">
                    <div className="hidden flex-1 items-center justify-center lg:flex">
                        <div className="relative flex aspect-[4/3] w-full max-w-[520px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 shadow-lg">
                            <div className="text-center text-white">
                                <p className="text-5xl font-black drop-shadow-lg">8.8</p>
                                <p className="mt-2 text-3xl font-bold">SIÊU SALE</p>
                                <p className="mt-4 text-lg opacity-90">
                                    Voucher &amp; Freeship
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mx-auto w-full shrink-0 lg:mx-0 lg:w-[400px]">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
