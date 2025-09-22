"use client";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

const CART_KEY = "wb_cart_v1";

export function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    // also write a timestamp to trigger storage listeners in other tabs
    try {
      localStorage.setItem(CART_KEY + ":updated", String(Date.now()));
    } catch (e) {}
  } catch (e) {
    // ignore
  }
}

export function addToCart(item: CartItem) {
  const items = readCart();
  const idx = items.findIndex((i) => i.id === item.id);
  if (idx === -1) {
    items.push(item);
  } else {
    items[idx].quantity += item.quantity;
  }
  writeCart(items);
}

export function removeItem(id: string) {
  const items = readCart().filter((i) => i.id !== id);
  writeCart(items);
}

export function updateQuantity(id: string, quantity: number) {
  const items = readCart();
  const idx = items.findIndex((i) => i.id === id);
  if (idx !== -1) {
    items[idx].quantity = Math.max(0, quantity);
    if (items[idx].quantity === 0) items.splice(idx, 1);
    writeCart(items);
  }
}

export function totalCount() {
  return readCart().reduce((s, i) => s + (i.quantity || 0), 0);
}

export function totalPrice() {
  return readCart().reduce((s, i) => s + (i.quantity || 0) * i.price, 0);
}

export function clearCart() {
  writeCart([]);
}

export default {
  readCart,
  writeCart,
  addToCart,
  clearCart,
};
