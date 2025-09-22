"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { addToCart } from "@/lib/cart";

interface Props {
  productId: string;
  name?: string;
  price: number;
  image?: string;
}

export default function AddToCart({ productId, name, price, image }: Props) {
  const onAdd = () => {
    try {
      addToCart({ id: productId, name: name || "", price, quantity: 1, image });
      try {
        localStorage.setItem("wb_cart_v1_last_update", String(Date.now()));
      } catch (e) {}
      // after adding, navigate to cart so user sees the added item
      if (typeof window !== "undefined") {
        window.location.href = "/cart";
      }
    } catch (e) {
      console.error("addToCart error", e);
    }
  };

  return (
    <Button
      onClick={onAdd}
      className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white border-0"
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      Thêm vào giỏ
    </Button>
  );
}
