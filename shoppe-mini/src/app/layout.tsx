import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "antd/dist/reset.css";
import "@/app/globals.css";
import { cn } from "@/lib/utils";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";
import AuthProvider from "./(auth)/providers/authProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Shop Mini",
    template: "%s · Shop Mini",
  },
  description:
    "Shop Mini — mua sắm trực tuyến nhanh, gọn, giá tốt mỗi ngày.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body className="flex min-h-full flex-col">
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
        >
          <AuthProvider>
            <AntdRegistry>{children}</AntdRegistry>
          </AuthProvider>
        </GoogleOAuthProvider>

        <Toaster
          position="top-center"
          richColors
          closeButton
          duration={2500}
          toastOptions={{
            className: "text-sm",
          }}
        />
      </body>
    </html>
  );
}
