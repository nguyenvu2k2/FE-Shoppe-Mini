import Link from "next/link";
import { HelpCircle } from "lucide-react";

import SiteFooter from "@/components/layout/site-footer";

interface AuthLayoutProps {
    title: string;
    children: React.ReactNode;
}

export default function AuthLayout({ title, children }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <header className="border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-md">
                <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#ee4d2d] to-[#ff8c5a] text-sm font-black italic text-white shadow-md shadow-orange-200">
                                S
                            </span>
                            <span className="text-xl font-bold tracking-tight text-gray-900">
                                shoppe
                                <span className="bg-gradient-to-r from-[#ee4d2d] to-[#ff6b4a] bg-clip-text text-transparent">
                                    mini
                                </span>
                            </span>
                        </Link>
                        <div className="hidden h-6 w-px bg-gray-200 sm:block" />
                        <span className="hidden text-lg font-medium text-gray-600 sm:block">
                            {title}
                        </span>
                    </div>
                    <Link
                        href="#"
                        className="flex items-center gap-1.5 rounded-full border border-[#ee4d2d]/20 bg-[#ee4d2d]/5 px-3 py-1.5 text-sm font-medium text-[#ee4d2d] transition hover:bg-[#ee4d2d]/10"
                    >
                        <HelpCircle className="size-4" />
                        <span className="hidden sm:inline">Bạn cần giúp đỡ?</span>
                    </Link>
                </div>
            </header>

            <main className="flex-1 bg-gradient-to-br from-[#ee4d2d] via-[#f05a32] to-[#ff8c5a]">
                <div className="mx-auto flex min-h-[600px] max-w-[1200px] items-center gap-8 px-4 py-10">
                    <div className="hidden flex-1 items-center justify-center lg:flex">
                        <div className="relative flex aspect-[4/3] w-full max-w-[520px] items-center justify-center overflow-hidden rounded-3xl bg-white/10 shadow-2xl shadow-orange-900/20 backdrop-blur-sm ring-1 ring-white/20">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/90 via-orange-400/90 to-red-500/90" />
                            <div className="relative text-center text-white">
                                <p className="text-6xl font-black drop-shadow-lg">8.8</p>
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

            <SiteFooter />
        </div>
    );
}
