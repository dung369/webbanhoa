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
  size = "sm",
  label,
}: Props) {
  // Circle button size
  const sizeClasses =
    size === "lg"
      ? "w-28 h-28" // 112px -> 112px previously, reduce lg a bit
      : size === "sm"
      ? "w-11 h-11" // 44px for the compact default (slightly larger than before)
      : "w-14 h-14"; // md ~ 56px (a bit larger than sm, but not too big)

  // Icon size
  const iconSize =
    size === "lg" ? "w-10 h-10" : size === "sm" ? "w-5 h-5" : "w-6 h-6";

  // Gap between icon circle and optional label
  const gapClasses = size === "lg" ? "gap-4" : size === "sm" ? "gap-2" : "gap-3";

  // Label text sizing
  const labelText =
    size === "lg" ? "text-lg md:text-xl" : size === "sm" ? "text-sm md:text-base" : "text-base";

  return (
    <div className={`inline-flex items-center ${gapClasses} ${className || ""}`}>
      <div className="relative">
        <Link
          href="/chat"
          aria-label="Mở trang chat với cửa hàng"
          className={`${sizeClasses} rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-xl hover:scale-105 transition-transform`}
        >
          <MessageSquare className={iconSize} />
        </Link>
      </div>

      {label && (
        <div className={`text-rose-900 font-semibold ${labelText} select-none whitespace-nowrap ml-2 md:ml-3`}>
          {label}
        </div>
      )}
    </div>
  );
}
