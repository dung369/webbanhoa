"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { firestore } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  TrendingUp,
  Edit,
  Eye,
} from "lucide-react";

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [products, setProducts] = useState<any[]>([]);

  // Subscribe to Firestore products collection in realtime when available
  useEffect(() => {
    if (firestore) {
      try {
        const q = query(
          collection(firestore, "products"),
          orderBy("createdAt", "desc")
        );
        const unsub = onSnapshot(q, (snap) => {
          const items = snap.docs.map((d) => {
            const data: any = d.data();
            // normalize fields from Firestore
            return {
              id: d.id,
              name: data.name,
              description: data.description,
              price: Number(data.price || 0),
              originalPrice: data.originalPrice
                ? Number(data.originalPrice)
                : undefined,
              category: data.category || "Khác",
              origin: data.origin || "",
              images: data.images || [],
              inStock: Number(data.inStock || 0),
              rating: Number(data.rating || 0),
              reviews: Number(data.reviews || 0),
              featured: !!data.featured,
              createdAt:
                data.createdAt && typeof data.createdAt.toDate === "function"
                  ? data.createdAt.toDate()
                  : data.createdAt
                  ? new Date(data.createdAt)
                  : new Date(),
            };
          });
          setProducts(items);
        });
        return () => unsub();
      } catch (e) {
        // if subscription fails, keep empty
        setProducts([]);
      }
    } else {
      setProducts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate inventory stats
  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => p.inStock < 20).length;
  const outOfStockProducts = products.filter((p) => p.inStock === 0).length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.inStock, 0);

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && product.inStock < 20) ||
      (stockFilter === "out" && product.inStock === 0) ||
      (stockFilter === "in" && product.inStock > 0);

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Get unique categories
  const categories = Array.from(
    new Set(products.map((p) => p.category))
  ).filter(Boolean);

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return { label: "Hết hàng", variant: "destructive" as const };
    if (stock < 20) return { label: "Sắp hết", variant: "secondary" as const };
    return { label: "Còn hàng", variant: "default" as const };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý kho hàng
          </h1>
          <p className="text-muted-foreground">
            Theo dõi và quản lý tồn kho sản phẩm
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm sản phẩm
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm sản phẩm mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin sản phẩm mới vào kho
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên sản phẩm</Label>
                  <Input id="name" placeholder="Nhập tên sản phẩm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Danh mục</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Giá bán</Label>
                  <Input id="price" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Số lượng</Label>
                  <Input id="stock" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="origin">Xuất xứ</Label>
                  <Input id="origin" placeholder="Việt Nam" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả chi tiết sản phẩm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>
                Thêm sản phẩm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +2 từ tháng trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sắp hết hàng</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {lowStockProducts}
            </div>
            <p className="text-xs text-muted-foreground">Dưới 20 sản phẩm</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hết hàng</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {outOfStockProducts}
            </div>
            <p className="text-xs text-muted-foreground">Cần nhập hàng ngay</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giá trị kho</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalValue.toLocaleString("vi-VN")}₫
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% từ tháng trước
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách sản phẩm</CardTitle>
          <CardDescription>
            Quản lý tồn kho và thông tin sản phẩm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Tồn kho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="in">Còn hàng</SelectItem>
                  <SelectItem value="low">Sắp hết</SelectItem>
                  <SelectItem value="out">Hết hàng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Xuất xứ</TableHead>
                <TableHead>Giá bán</TableHead>
                <TableHead>Tồn kho</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Giá trị</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.inStock);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {product.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.origin}</TableCell>
                    <TableCell>
                      {product.price.toLocaleString("vi-VN")}₫
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.inStock}
                    </TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.variant}>
                        {stockStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(product.price * product.inStock).toLocaleString(
                        "vi-VN"
                      )}
                      ₫
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Dialog
                          open={isEditDialogOpen}
                          onOpenChange={setIsEditDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
                              <DialogDescription>
                                Cập nhật thông tin sản phẩm
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-name">
                                    Tên sản phẩm
                                  </Label>
                                  <Input
                                    id="edit-name"
                                    defaultValue={selectedProduct?.name}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-category">
                                    Danh mục
                                  </Label>
                                  <Select
                                    defaultValue={selectedProduct?.category}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {categories.map((category) => (
                                        <SelectItem
                                          key={category}
                                          value={category}
                                        >
                                          {category}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-price">Giá bán</Label>
                                  <Input
                                    id="edit-price"
                                    type="number"
                                    defaultValue={selectedProduct?.price}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-stock">Số lượng</Label>
                                  <Input
                                    id="edit-stock"
                                    type="number"
                                    defaultValue={selectedProduct?.inStock}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-origin">Xuất xứ</Label>
                                  <Input
                                    id="edit-origin"
                                    defaultValue={selectedProduct?.origin}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-description">Mô tả</Label>
                                <Textarea
                                  id="edit-description"
                                  defaultValue={selectedProduct?.description}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setIsEditDialogOpen(false)}
                              >
                                Hủy
                              </Button>
                              <Button
                                onClick={() => setIsEditDialogOpen(false)}
                              >
                                Cập nhật
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
