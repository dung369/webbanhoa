"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Phone } from "lucide-react";

type Product = {
  id: string;
  title?: string;
  name?: string;
};

async function fetchProducts(): Promise<Product[]> {
  try {
    // try local-products API first
    const res1 = await fetch("/api/local-products");
    if (res1.ok) return await res1.json();
  } catch (e) {}
  try {
    const res2 = await fetch("/api/images-products");
    if (res2.ok) return await res2.json();
  } catch (e) {}
  // fallback: empty list
  return [];
}

export default function SiteFooter() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const p = await fetchProducts();
      if (!mounted) return;
      setProducts(p || []);
    }
    load();

    function onStorage(e: StorageEvent) {
      if (e.key === "wb_products_update") load();
    }
    window.addEventListener("storage", onStorage);
    return () => {
      mounted = false;
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const items = products
    .slice(0, 6)
    .map((p) => ({ id: p.id, label: p.title || p.name || "Sản phẩm" }));

  return (
    <footer className="bg-rose-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <h3 className="text-xl font-bold">Hoa Tươi Việt</h3>
            </div>
            <p className="text-rose-200">
              Chuyên cung cấp hoa tươi cao cấp, nhập khẩu và trong nước. Cam kết
              chất lượng và dịch vụ tốt nhất.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Sản phẩm</h4>
            <ul className="space-y-2 text-rose-200">
              {items.length === 0 && <li>Không có sản phẩm</li>}
              {items.map((it) => (
                <li key={it.id}>
                  <Link
                    href={`/products/${it.id}`}
                    className="hover:text-white"
                  >
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Liên hệ</h4>
            <div className="space-y-2 text-rose-200">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>0123 456 789</span>
              </div>
              <p>123 Đường Hoa, Quận 1, TP.HCM</p>
              <p>contact@hoatuoiviet.com</p>
            </div>
          </div>
        </div>

        <div className="border-t border-rose-800 mt-12 pt-8 text-center text-rose-200">
          <p>&copy; 2024 Hoa Tươi Việt. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
