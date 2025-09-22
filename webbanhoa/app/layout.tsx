import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { FavoritesProvider } from "@/components/favorites-provider";
import AOSProvider from "@/components/aos-provider";
import ConditionalMessenger from "@/components/conditional-messenger";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Hoa Tươi Việt - Hoa cao cấp nhập khẩu",
  description: "Cửa hàng hoa tươi cao cấp với các loại hoa nhập khẩu từ Đà Lạt và quốc tế",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AOSProvider>
          <FavoritesProvider>
            {children}
            {/* Conditional Messenger Button - Hidden in admin pages */}
            <ConditionalMessenger />
          </FavoritesProvider>
        </AOSProvider>
      </body>
    </html>
  );
}
