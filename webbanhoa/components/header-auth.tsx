"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import devAuth, {
  onAuthStateChanged as devOnAuthStateChanged,
} from "@/lib/devAuth";

export default function HeaderAuth() {
  const [user, setUser] = useState<any>(devAuth.currentUser());

  useEffect(() => {
    if (devOnAuthStateChanged) {
      const unsub = devOnAuthStateChanged((u: any) => setUser(u));
      return () => unsub();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (user) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-rose-700 font-medium">
          Xin chào, {user.displayName || user.email}
        </span>
        <button
          onClick={() => {
            devAuth.signOut();
            setUser(null);
          }}
          className="bg-transparent border border-rose-300 text-rose-700 px-3 py-1 rounded"
        >
          Đăng xuất
        </button>
      </div>
    );
  }

  return (
    <>
      <Link href="/auth?tab=register">
        <Button
          variant="outline"
          className="border-rose-300 text-rose-700 hover:bg-rose-50 bg-transparent"
        >
          Đăng ký
        </Button>
      </Link>
      <Link href="/auth">
        <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white border-0">
          Đăng nhập
        </Button>
      </Link>
    </>
  );
}
