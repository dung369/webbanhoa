"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import {
  readCart,
  clearCart,
  CartItem as LibCartItem,
  removeItem,
  updateQuantity,
  totalPrice,
  totalCount,
} from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const [items, setItems] = useState<LibCartItem[]>([]);
  const router = useRouter();

  const reload = () => setItems(readCart());

  useEffect(() => {
    reload();
    function onStorage(e: StorageEvent) {
      if (
        e.key &&
        (e.key.startsWith("wb_cart_v1") || e.key === "wb_cart_v1_last_update")
      )
        reload();
    }
    window.addEventListener("storage", onStorage);
    const t = setInterval(reload, 1000);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(t);
    };
  }, []);

  const handleRemove = (id: string) => {
    removeItem(id);
    reload();
  };
  const handleChangeQty = (id: string, qty: number) => {
    updateQuantity(id, qty);
    reload();
  };

  const goCheckout = () => {
    router.push("/checkout");
  };

  const total = totalPrice();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50">
      <SiteHeader />

      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">
          Giỏ hàng ({totalCount()} sản phẩm)
        </h1>

        {items.length === 0 ? (
          <div className="p-8 text-center">
            <p className="mb-4">Giỏ hàng trống</p>
            <Link href="/products">
              <Button>Quay về sản phẩm</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {items.map((it) => (
                <Card
                  key={it.id}
                  className="flex items-center p-0 overflow-hidden"
                >
                  <img
                    src={it.image || "/placeholder.svg"}
                    alt={it.name}
                    className="w-32 h-28 object-cover"
                  />
                  <CardContent className="flex-1 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{it.name}</h3>
                      <p className="text-sm text-slate-600">
                        {it.price.toLocaleString("vi-VN")}đ
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleChangeQty(it.id, Math.max(1, it.quantity - 1))
                        }
                      >
                        -
                      </Button>
                      <span className="px-3">{it.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleChangeQty(it.id, it.quantity + 1)}
                      >
                        +
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-rose-600"
                        onClick={() => handleRemove(it.id)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="p-6 bg-white rounded-2xl shadow">
              <h3 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h3>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span>Tạm tính</span>
                  <span>{total.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Phí vận chuyển</span>
                  <span>Miễn phí</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng</span>
                  <span>{total.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white"
                  onClick={goCheckout}
                >
                  Tiến hành thanh toán
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    clearCart();
                    reload();
                  }}
                >
                  Xóa giỏ
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
