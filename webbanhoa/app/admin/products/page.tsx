"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { firestore } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
} from "firebase/firestore";

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [products, setProducts] = useState<any[]>([]);
  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.category))).filter(Boolean),
  ];

  useEffect(() => {
    if (firestore) {
      try {
        const q = query(
          collection(firestore, "products"),
          orderBy("createdAt", "desc")
        );
        const unsub = onSnapshot(q, (snap) => {
          const items = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() || {}),
          }));
          setProducts(items);
        });
        return () => unsub();
      } catch (e) {
        setProducts([]);
      }
    } else {
      setProducts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = (product.name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (a.price || 0) - (b.price || 0);
      case "price-high":
        return (b.price || 0) - (a.price || 0);
      case "stock-low":
        return (a.inStock || 0) - (b.inStock || 0);
      case "stock-high":
        return (b.inStock || 0) - (a.inStock || 0);
      case "name":
        return (a.name || "").localeCompare(b.name || "");
      default:
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-500"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Quay lại Dashboard</span>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Quản lý sản phẩm
                </h1>
                <p className="text-sm text-slate-600">
                  Quản lý kho hoa và sản phẩm
                </p>
              </div>
            </div>

            <Link href="/admin/products/new">
              <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Thêm sản phẩm
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Filters */}
        <Card className="border-slate-200 mb-6">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-rose-500 focus:ring-rose-500"
                />
              </div>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="border-slate-300 focus:border-rose-500 focus:ring-rose-500">
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.slice(1).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="border-slate-300 focus:border-rose-500 focus:ring-rose-500">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="name">Tên A-Z</SelectItem>
                  <SelectItem value="price-low">Giá thấp đến cao</SelectItem>
                  <SelectItem value="price-high">Giá cao đến thấp</SelectItem>
                  <SelectItem value="stock-low">Tồn kho thấp</SelectItem>
                  <SelectItem value="stock-high">Tồn kho cao</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
              >
                <Filter className="w-4 h-4 mr-2" />
                Bộ lọc nâng cao
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900">
                Danh sách sản phẩm ({sortedProducts.length})
              </CardTitle>
              <div className="text-sm text-slate-600">
                Tổng giá trị kho:{" "}
                {sortedProducts
                  .reduce((sum, p) => sum + p.price * p.inStock, 0)
                  .toLocaleString("vi-VN")}
                đ
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Hình</TableHead>
                    <TableHead>Tên sản phẩm</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Xuất xứ</TableHead>
                    <TableHead>Giá bán</TableHead>
                    <TableHead>Tồn kho</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Đánh giá</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">
                            {product.name}
                          </p>
                          <p className="text-sm text-slate-600 line-clamp-1">
                            {product.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-700"
                        >
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-rose-200 text-rose-700"
                        >
                          {product.origin}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">
                            {product.price.toLocaleString("vi-VN")}đ
                          </p>
                          {product.originalPrice && (
                            <p className="text-sm text-slate-500 line-through">
                              {product.originalPrice.toLocaleString("vi-VN")}đ
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`font-medium ${
                              product.inStock < 10
                                ? "text-red-600"
                                : "text-slate-900"
                            }`}
                          >
                            {product.inStock}
                          </span>
                          {product.inStock < 10 && (
                            <Badge className="bg-red-100 text-red-700 text-xs">
                              Sắp hết
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            product.featured
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-700"
                          }
                        >
                          {product.featured ? "Nổi bật" : "Thường"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm font-medium text-slate-900">
                            {product.rating}
                          </span>
                          <span className="text-sm text-slate-500">
                            ({product.reviews})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/products/${product.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-600 hover:text-slate-900"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Dialog
                            open={
                              isDeleteOpen && deleteTarget?.id === product.id
                            }
                            onOpenChange={(open) => {
                              if (!open) {
                                setDeleteTarget(null);
                                setIsDeleteOpen(false);
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-900"
                                onClick={() => {
                                  setDeleteTarget(product);
                                  setIsDeleteOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>

                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Xác nhận xóa</DialogTitle>
                                <DialogDescription>
                                  Bạn có chắc muốn xóa sản phẩm "{product.name}
                                  "? Hành động này không thể hoàn tác.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setIsDeleteOpen(false);
                                    setDeleteTarget(null);
                                  }}
                                >
                                  Hủy
                                </Button>
                                <Button
                                  onClick={async () => {
                                    if (!deleteTarget) return;
                                    try {
                                      if (firestore) {
                                        await deleteDoc(
                                          doc(
                                            firestore,
                                            "products",
                                            deleteTarget.id
                                          )
                                        );
                                        setMessage(
                                          "Đã xóa sản phẩm (Firestore)"
                                        );
                                      } else {
                                        const prevProducts = products;
                                        setProducts(
                                          prevProducts.filter(
                                            (p) => p.id !== deleteTarget.id
                                          )
                                        );
                                        try {
                                          const res = await fetch(
                                            "/api/local-products",
                                            {
                                              method: "DELETE",
                                              headers: {
                                                "Content-Type":
                                                  "application/json",
                                              },
                                              body: JSON.stringify({
                                                id: deleteTarget.id,
                                              }),
                                            }
                                          );
                                          const payload = await res
                                            .json()
                                            .catch(() => null);
                                          if (res.ok)
                                            setMessage(
                                              "Đã xóa sản phẩm (local)"
                                            );
                                          if (res.ok) {
                                            try {
                                              window.localStorage.setItem(
                                                "wb_products_update",
                                                Date.now().toString()
                                              );
                                            } catch (e) {
                                              /* ignore */
                                            }
                                          } else {
                                            setProducts(prevProducts);
                                            setMessage(
                                              "Xóa thất bại: " +
                                                (payload?.error || res.status)
                                            );
                                          }
                                        } catch (err) {
                                          // rollback
                                          // eslint-disable-next-line no-console
                                          console.error(
                                            "local delete error",
                                            err
                                          );
                                          setProducts(prevProducts);
                                          setMessage(
                                            "Xóa thất bại: không thể kết nối đến server local"
                                          );
                                        }
                                      }
                                    } catch (e) {
                                      // eslint-disable-next-line no-console
                                      console.error("delete error", e);
                                      setMessage("Xóa thất bại");
                                    } finally {
                                      setIsDeleteOpen(false);
                                      setDeleteTarget(null);
                                    }
                                  }}
                                >
                                  Xóa
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {sortedProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-slate-600">
                  Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
