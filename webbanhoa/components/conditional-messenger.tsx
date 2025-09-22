"use client";

import { usePathname } from "next/navigation";
import MessengerButton from "./messenger-button";

export default function ConditionalMessenger() {
  const pathname = usePathname();
  
  // Ẩn messenger button trong trang admin
  const isAdminPage = pathname?.startsWith("/admin");
  
  if (isAdminPage) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <MessengerButton size="md" label="Chat với cửa hàng" />
    </div>
  );
}