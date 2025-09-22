"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { readCart, clearCart, totalPrice } from "@/lib/cart";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const MapAddressPicker = dynamic(
  () => import("@/components/map-address-picker"),
  { ssr: false }
);
import devAuth from "@/lib/devAuth";

export default function CheckoutPage() {
  const [items, setItems] = useState<any[]>([]);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(
      typeof devAuth?.currentUser === "function" ? devAuth.currentUser() : null
    );
  }, []);

  useEffect(() => {
    setItems(readCart());
  }, []);

  const total = totalPrice();
  const [pickedAddress, setPickedAddress] = React.useState<any | null>(null);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [orderId, setOrderId] = React.useState<string | null>(null);

  const [fullname, setFullname] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");

  // require map-picked address only
  const canSubmit = Boolean(
    user && fullname.trim() && phone.trim() && (pickedAddress?.formatted || "")
  );

  const placeOrder = async (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    if (!user) {
      // require login
      router.push("/auth");
      return;
    }
    if (
      !fullname.trim() ||
      !phone.trim() ||
      !(pickedAddress?.formatted || "")
    ) {
      // basic client validation
      alert(
        "Vui lòng điền Họ tên, Số điện thoại và địa chỉ trước khi đặt hàng."
      );
      return;
    }

    const payload: any = {
      fullname,
      phone,
      email,
      userId: user?.uid || null,
      items: items || [],
      total: total,
      address: {
        formatted: pickedAddress?.formatted || "",
        lat: pickedAddress?.lat || null,
        lng: pickedAddress?.lng || null,
        components: pickedAddress?.components || null,
      },
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "order failed");
      // capture order id returned by the API
      if (data?.id) setOrderId(data.id);
    } catch (err) {
      console.error("order submit failed", err);
      alert("Không thể đặt hàng lúc này. Vui lòng thử lại sau.");
      return;
    }

    // show success notification briefly, then clear cart and go to success
    setShowSuccess(true);
    setTimeout(() => {
      clearCart();
      const target = orderId
        ? `/checkout/success?id=${orderId}`
        : "/checkout/success";
      router.push(target);
    }, 1200);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Thanh toán</h1>

      {items.length === 0 ? (
        <div className="p-8 text-center">
          <p className="mb-4">Giỏ hàng trống</p>
          <Link href="/products">
            <Button>Quay về sản phẩm</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={placeOrder} className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Họ và tên</label>
              <input
                required
                className="w-full border p-3 rounded"
                name="fullname"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">
                  Số điện thoại
                </label>
                <input
                  required
                  name="phone"
                  className="w-full border p-3 rounded"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  name="email"
                  className="w-full border p-3 rounded"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Địa chỉ</label>
              <MapAddressPicker
                onChange={(addr: any) => {
                  setPickedAddress(addr);
                }}
              />
              {/* hidden inputs so server-side/form handlers can read values if needed */}
              <input
                type="hidden"
                name="address"
                value={pickedAddress?.formatted || ""}
              />
              <input
                type="hidden"
                name="address_lat"
                value={pickedAddress?.lat || ""}
              />
              <input
                type="hidden"
                name="address_lng"
                value={pickedAddress?.lng || ""}
              />
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow">
            <h3 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h3>
            <div className="space-y-3 mb-4">
              {items.map((it) => (
                <div key={it.id} className="flex justify-between">
                  <div>
                    {it.name} x{it.quantity}
                  </div>
                  <div>{(it.price * it.quantity).toLocaleString("vi-VN")}đ</div>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-bold mb-4">
              <span>Tổng</span>
              <span>{total.toLocaleString("vi-VN")}đ</span>
            </div>

            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white"
              >
                Đặt hàng
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.back()}
              >
                Quay lại giỏ hàng
              </Button>
            </div>
          </div>
        </form>
      )}
      {showSuccess ? (
        <div className="fixed right-6 bottom-6 bg-white border rounded px-4 py-3 shadow-lg">
          <div className="font-medium">Đặt hàng thành công</div>
          <div className="text-sm text-slate-600">
            Cám ơn bạn, đơn hàng đã được gửi.
          </div>
        </div>
      ) : null}
    </div>
  );
}
