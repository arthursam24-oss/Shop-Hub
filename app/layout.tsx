import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Header from "@/components/layout/Header";
import AuthProvider from "@/components/layout/AuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShopHub — Multi-vendor Marketplace",
  description: "Shop the best deals across electronics, fashion, home and groceries.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#f1f1f2] text-gray-900">
        <AuthProvider>
          <Header />
          <main className="min-h-[70vh]">{children}</main>
          <footer className="mt-10 bg-[#2d2d2d] px-6 py-8 text-sm text-gray-300">
            <div className="mx-auto flex max-w-[1380px] flex-col justify-between gap-4 sm:flex-row">
              <span className="text-lg font-black text-white">SHOPHUB</span>
              <span>© 2026 ShopHub Marketplace</span>
            </div>
          </footer>
        </AuthProvider>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
