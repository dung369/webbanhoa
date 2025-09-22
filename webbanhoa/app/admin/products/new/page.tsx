"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { firestore, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [files, setFiles] = useState<File[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const firebaseAvailable = !!firestore && !!storage;

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function onFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...list].slice(0, 8));
    e.currentTarget.value = "";
  }

  function removeImage(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function uploadFile(file: File, folder = "products") {
    if (!storage) return Promise.reject(new Error("No storage"));
    const path = `${folder}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const sRef = storageRef(storage, path);
    return new Promise<string>((resolve, reject) => {
      const task = uploadBytesResumable(sRef, file);
      task.on(
        "state_changed",
        (snap) => {
          const pct = Math.round(
            (snap.bytesTransferred / snap.totalBytes) * 100
          );
          setProgressMap((p) => ({ ...p, [file.name]: pct }));
        },
        (err) => reject(err),
        async () => {
          try {
            const url = await getDownloadURL(sRef);
            resolve(url);
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  }

  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") resolve(reader.result);
        else reject(new Error("File read failed"));
      };
      reader.onerror = () => reject(new Error("File read error"));
      reader.readAsDataURL(file);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!title || price === "" || stock === "") {
      setMessage("Vui lòng nhập tên, giá và tồn kho.");
      return;
    }

    setIsSubmitting(true);
    try {
      // If Firebase available, upload files then create Firestore doc
      if (firebaseAvailable) {
        const uploaded: string[] = [];
        for (const f of files) {
          const url = await uploadFile(f);
          uploaded.push(url);
        }

        await addDoc(collection(firestore, "products"), {
          title,
          description,
          price: Number(price),
          inStock: Number(stock),
          images: uploaded,
          createdAt: serverTimestamp(),
        });
        setMessage("Đã lưu sản phẩm lên Firestore");
        router.push("/admin/products");
        return;
      }

      // Fallback: if server API available, POST product + images so everyone sees it
      try {
        // convert images to base64
        const b64s: string[] = [];
        for (const f of files) {
          b64s.push(await fileToDataUrl(f));
        }

        const res = await fetch("/api/local-products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product: { title, description, price, inStock: stock },
            images: b64s,
          }),
        });
        const payload = await (async () => {
          try {
            return await res.json();
          } catch (e) {
            return null;
          }
        })();
        if (res.ok) {
          setMessage(
            "Đã lưu sản phẩm (local server). Sản phẩm sẽ hiển thị cho mọi người."
          );
          try {
            window.localStorage.setItem(
              "wb_products_update",
              Date.now().toString()
            );
          } catch (e) {
            /* ignore */
          }
          router.push("/products");
          return;
        }
        // surface server error
        setMessage(payload?.error || `Lưu thất bại (server ${res.status})`);
        setIsSubmitting(false);
        return;
      } catch (err) {
        // ignore and fallback to localStorage
      }

      // final fallback: save to localStorage so the public products page can show it locally in this browser
      const stored = localStorage.getItem("wb_local_products");
      const arr = stored ? JSON.parse(stored) : [];
      const localImages = files.map((f) => URL.createObjectURL(f));
      const product = {
        id: `local_${Date.now()}`,
        title,
        description,
        price: Number(price),
        inStock: Number(stock),
        images: localImages,
        createdAt: new Date().toISOString(),
      };
      arr.unshift(product);
      localStorage.setItem("wb_local_products", JSON.stringify(arr));
      try {
        window.localStorage.setItem(
          "wb_products_update",
          Date.now().toString()
        );
      } catch (e) {
        /* ignore */
      }
      setMessage(
        "Đã lưu sản phẩm vào bộ nhớ trình duyệt (local). Cấu hình Firestore để mọi người thấy sản phẩm này."
      );
      router.push("/products");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setMessage("Lỗi khi lưu sản phẩm. Xem console để biết thêm.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded p-6">
          <h1 className="text-2xl font-semibold mb-4">Thêm sản phẩm mới</h1>

          {message && (
            <div className="mb-4 p-3 rounded bg-rose-50 text-rose-700">
              {message}
            </div>
          )}

          {/* banner removed per request; we still show messages via the `message` box above */}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Tên</label>
              <input
                className="mt-1 block w-full border rounded px-3 py-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="mt-4">
                <label className="block text-sm font-medium">Mô tả</label>
                <textarea
                  className="mt-1 block w-full border rounded px-3 py-2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-sm font-medium">Giá</label>
                  <input
                    type="number"
                    className="mt-1 block w-full border rounded px-3 py-2"
                    value={price as any}
                    onChange={(e) =>
                      setPrice(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Tồn kho</label>
                  <input
                    type="number"
                    className="mt-1 block w-full border rounded px-3 py-2"
                    value={stock as any}
                    onChange={(e) =>
                      setStock(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    required
                  />
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="mt-2"
                onChange={onFilesSelected}
              />
              <div className="mt-3 grid grid-cols-4 gap-3">
                {files.map((f, i) => (
                  <div key={i} className="relative">
                    <img
                      src={URL.createObjectURL(f)}
                      alt={f.name}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-white rounded-full p-1"
                    >
                      ✕
                    </button>
                    {progressMap[f.name] !== undefined && (
                      <div className="absolute left-0 bottom-0 w-full bg-black/40 text-white text-xs text-center py-0.5">
                        {progressMap[f.name]}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-rose-500 text-white px-4 py-2 rounded"
              >
                {isSubmitting ? "Đang lưu..." : "Lưu"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/products")}
                className="border px-3 py-2 rounded"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
