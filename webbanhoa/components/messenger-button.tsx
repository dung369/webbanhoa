"use client";

import React from "react";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

type Props = {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
};

export default function MessengerButton({
  className,
  size = "md",
  label,
}: Props) {
  const sizeClasses =
    size === "lg" ? "w-36 h-36" : size === "sm" ? "w-12 h-12" : "w-28 h-28";
  const iconSize =
    size === "lg" ? "w-16 h-16" : size === "sm" ? "w-4 h-4" : "w-12 h-12";

  return (
    <div className={`inline-flex items-center gap-4 ${className || ""}`}>
      <div className="relative">
        <Link
          href="/chat"
          aria-label="Mở trang chat với cửa hàng"
          className={`${sizeClasses} rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-transform`}
        >
          <MessageSquare className={iconSize} />
        </Link>
      </div>

      {label && (
        <div className="text-rose-900 font-semibold text-xl md:text-2xl select-none whitespace-nowrap ml-3">
          {label}
        </div>
      )}
    </div>
  );
}
