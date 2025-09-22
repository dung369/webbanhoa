"use client";
import Link from "next/link";
import HeaderAuth from "@/components/header-auth";
import CartButton from "@/components/cart-button";
import { Button } from "@/components/ui/button";
import FavoritesDialog from "./favorites-dialog";

export default function SiteHeader() {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-rose-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                Hoa Tươi Việt
              </h1>
              <p className="text-xs text-rose-500">Hoa tươi cao cấp</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-rose-700 hover:text-rose-500 font-medium"
            >
              Trang chủ
            </Link>
            <Link
              href="/products"
              className="text-rose-700 hover:text-rose-500 font-medium"
            >
              Sản phẩm
            </Link>
            <Link
              href="/about"
              className="text-rose-700 hover:text-rose-500 font-medium"
            >
              Về chúng tôi
            </Link>
            <Link
              href="/contact"
              className="text-rose-700 hover:text-rose-500 font-medium"
            >
              Liên hệ
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <FavoritesDialog />
            <CartButton />
            <HeaderAuth />
          </div>
        </div>
      </div>
    </header>
  );
}
