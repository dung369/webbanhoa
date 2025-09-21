"use client";

import { useEffect, useState, useCallback } from "react";
import { firestore } from "@/lib/firebase";
import devAuth, {
  onAuthStateChanged as devOnAuthStateChanged,
} from "@/lib/devAuth";
import { User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export interface CartItem {
  productId: string;
  name?: string;
  price: number;
  quantity: number;
  image?: string;
  origin?: string;
}

const LOCAL_KEY = "hoatuoiviet_cart_v1";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  // listen for auth changes and load user's cart from Firestore (if configured)
  useEffect(() => {
    if (!devOnAuthStateChanged) {
      return;
    }

    const unsub = devOnAuthStateChanged(async (u: any) => {
      setUser(u);
      if (u && u.uid && firestore && getDoc) {
        try {
          const docRef = doc(firestore, "carts", u.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            setItems(data.items || []);
            // also sync to localStorage
            localStorage.setItem(LOCAL_KEY, JSON.stringify(data.items || []));
          }
        } catch (e) {
          console.error("Failed to load cart from Firestore", e);
        }
      }
    });
    return () => unsub();
  }, []);

  // persist to localStorage and to Firestore (if logged in)
  const persist = useCallback(async (nextItems: CartItem[]) => {
    setItems(nextItems);
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(nextItems));
    } catch (e) {
      // ignore
    }

    const currentUser = devAuth.currentUser();
    if (currentUser && currentUser.uid && firestore) {
      try {
        const docRef = doc(firestore, "carts", currentUser.uid);
        await setDoc(
          docRef,
          { items: nextItems, updatedAt: new Date() },
          { merge: true }
        );
      } catch (e) {
        console.error("Failed to persist cart to Firestore", e);
      }
    }
  }, []);

  const addItem = useCallback(
    (item: CartItem) => {
      setItems((prev) => {
        const idx = prev.findIndex((p) => p.productId === item.productId);
        let next;
        if (idx >= 0) {
          next = prev.map((p) =>
            p.productId === item.productId
              ? { ...p, quantity: p.quantity + item.quantity }
              : p
          );
        } else {
          next = [...prev, item];
        }
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      setItems((prev) => {
        let next = prev
          .map((p) => (p.productId === productId ? { ...p, quantity } : p))
          .filter((p) => p.quantity > 0);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const removeItem = useCallback(
    (productId: string) => {
      setItems((prev) => {
        const next = prev.filter((p) => p.productId !== productId);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const clear = useCallback(() => {
    persist([]);
  }, [persist]);

  return {
    items,
    user,
    addItem,
    updateQuantity,
    removeItem,
    clear,
  };
}

export default useCart;
