"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/site-header";
import { firestore } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      if (firestore) {
        const q = query(
          collection(firestore, "feedback"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setItems(
          snap.docs.map((d: any) => ({ id: d.id, ...(d.data() || {}) }))
        );
      } else {
        const res = await fetch("/api/feedback")
          .then((r) => r.json())
          .catch(() => []);
        setItems(Array.isArray(res) ? res : []);
      }
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      if (firestore) {
        await deleteDoc(doc(firestore, "feedback", id));
        setItems(items.filter((i) => i.id !== id));
      } else {
        const res = await fetch("/api/feedback", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (res.ok) {
          setItems(items.filter((i) => i.id !== id));
        }
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <SiteHeader />
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Ghi nhận ý kiến khách hàng</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Đang tải...</div>
            ) : (
              <div className="space-y-4">
                {items.length === 0 ? (
                  <div>Chưa có phản hồi</div>
                ) : (
                  items.map((it) => (
                    <div key={it.id} className="border rounded p-4 bg-white">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">
                            {it.name || it.email || "Khách"}
                          </div>
                          <div className="text-sm text-slate-600">
                            {it.email}
                          </div>
                          {it.phone && (
                            <div className="text-sm text-slate-600">
                              {it.phone}
                            </div>
                          )}
                          {it.subject && (
                            <div className="text-sm text-slate-700 font-medium">
                              Chủ đề: {it.subject}
                            </div>
                          )}
                          <div className="text-xs text-slate-500">
                            {it.createdAt}
                          </div>
                        </div>
                        <div className="space-x-2">
                          <Button
                            variant="ghost"
                            onClick={() => handleDelete(it.id)}
                          >
                            Xóa
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 text-slate-700 whitespace-pre-line">{it.message}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
