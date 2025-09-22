"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Edit,
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
  doc,
  getDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const [orderStatus, setOrderStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifMessage, setNotifMessage] = useState("");

  const [order, setOrder] = useState<any | null>(null);
  const [customer, setCustomer] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);

  const orderId = params.id;

  const toDate = (val: any) => {
    if (!val) return new Date();
    if (val && typeof val.toDate === "function") return val.toDate();
    if (val instanceof Date) return val;
    try {
      return new Date(val);
    } catch (e) {
      return new Date();
    }
  };

  useEffect(() => {
    let unsub: any = null;
    const setup = async () => {
      try {
        if (firestore && orderId) {
          const ref = doc(firestore, "orders", orderId);
          unsub = onSnapshot(ref, async (snap) => {
            if (!snap.exists()) {
              setOrder(null);
              setCustomer(null);
              setProducts([]);
              return;
            }
            const o: any = { id: snap.id, ...(snap.data() || {}) };
            setOrder(o);

            // fetch customer if available
            if (o.userId) {
              try {
                const uRef = doc(firestore, "users", o.userId);
                const uSnap = await getDoc(uRef);
                setCustomer(
                  uSnap.exists()
                    ? { id: uSnap.id, ...(uSnap.data() || {}) }
                    : null
                );
              } catch (e) {
                setCustomer(null);
              }
            } else {
              setCustomer(null);
            }

            // resolve product documents for items
            const itemIds = Array.isArray(o.items)
              ? o.items.map((it: any) => it.productId).filter(Boolean)
              : [];
            if (itemIds.length) {
              try {
                const chunk = itemIds.slice(0, 10);
                const q = query(
                  collection(firestore, "products"),
                  where("__name__", "in", chunk)
                );
                const snapProds = await getDocs(q);
                const map: Record<string, any> = {};
                snapProds.forEach(
                  (d: any) => (map[d.id] = { id: d.id, ...(d.data() || {}) })
                );
                const resolved = (o.items || []).map(
                  (it: any) => map[it.productId] || null
                );
                setProducts(resolved);
              } catch (e) {
                setProducts([]);
              }
            } else {
              setProducts([]);
            }
          });
        } else {
          // no firestore configured: show empty
          setOrder(null);
          setCustomer(null);
          setProducts([]);
        }
      } catch (e) {
        setOrder(null);
        setCustomer(null);
        setProducts([]);
      }
    };
    setup();
    return () => {
      if (unsub) unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Không tìm thấy đơn hàng
            </h2>
            <p className="text-muted-foreground mb-4">
              Đơn hàng #{params.id} không tồn tại hoặc Firestore chưa được cấu
              hình
            </p>
            <Link href="/admin/orders">
              <Button>Quay lại danh sách</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: {
        label: "Chờ xác nhận",
        variant: "secondary" as const,
        icon: Clock,
      },
      confirmed: {
        label: "Đã xác nhận",
        variant: "default" as const,
        icon: CheckCircle,
      },
      preparing: {
        label: "Đang chuẩn bị",
        variant: "secondary" as const,
        icon: Package,
      },
      shipping: {
        label: "Đang giao",
        variant: "default" as const,
        icon: Truck,
      },
      delivered: {
        label: "Đã giao",
        variant: "default" as const,
        icon: CheckCircle,
      },
      cancelled: {
        label: "Đã hủy",
        variant: "destructive" as const,
        icon: XCircle,
      },
    };
    const statusInfo =
      statusMap[status as keyof typeof statusMap] || statusMap.pending;
    const Icon = statusInfo.icon;
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  const orderItems = useMemo(() => {
    if (!order) return [];
    return (order.items || []).map((item: any, idx: number) => {
      const product =
        products.find((p) => String(p?.id) === String(item.productId)) || null;
      return { ...item, product };
    });
  }, [order, products]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Dialog open={notifOpen} onOpenChange={setNotifOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thông báo</DialogTitle>
            <DialogDescription>{notifMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setNotifOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/orders"
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-500"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Quay lại</span>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Chi tiết đơn hàng #{order.id}
                </h1>
                <p className="text-sm text-slate-600">
                  Đặt ngày {order.createdAt.toLocaleDateString("vi-VN")} •{" "}
                  {getStatusBadge(order.status)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? "Hủy chỉnh sửa" : "Chỉnh sửa"}
              </Button>
              <Button>In đơn hàng</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Sản phẩm đã đặt
                </CardTitle>
                <CardDescription>
                  {orderItems.length} sản phẩm • Tổng:{" "}
                  {Number(order.total || 0).toLocaleString("vi-VN")}₫
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderItems.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 border rounded-lg"
                    >
                      <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {item.product?.name ||
                            item.name ||
                            "Sản phẩm không tồn tại"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {item.product?.category || ""} •{" "}
                          {item.product?.origin || ""}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm">
                            Số lượng: {item.quantity || item.qty || 1}
                          </span>
                          <span className="font-medium">
                            {Number(
                              item.price || item.unitPrice || 0
                            ).toLocaleString("vi-VN")}
                            ₫
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tạm tính:</span>
                    <span>
                      {Number(order.total || 0).toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Phí vận chuyển:</span>
                    <span>Miễn phí</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Tổng cộng:</span>
                    <span>
                      {Number(order.total || 0).toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isEditing && (
              <Card>
                <CardHeader>
                  <CardTitle>Cập nhật đơn hàng</CardTitle>
                  <CardDescription>
                    Thay đổi trạng thái và thêm ghi chú
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Trạng thái đơn hàng</Label>
                    <Select
                      value={orderStatus || order.status}
                      onValueChange={setOrderStatus}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Chờ xác nhận</SelectItem>
                        <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                        <SelectItem value="preparing">Đang chuẩn bị</SelectItem>
                        <SelectItem value="shipping">Đang giao</SelectItem>
                        <SelectItem value="delivered">Đã giao</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Ghi chú</Label>
                    <Textarea
                      id="notes"
                      placeholder="Thêm ghi chú về đơn hàng..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={async () => {
                      if (!firestore) {
                        setNotifMessage("Firestore chưa được cấu hình.");
                        setNotifOpen(true);
                        return;
                      }
                      try {
                        const ref = doc(firestore, "orders", orderId);
                        const updates: any = {};
                        if (orderStatus) updates.status = orderStatus;
                        // if admin marks delivered, also mark paid and record deliveredAt
                        if (orderStatus === "delivered") {
                          updates.paid = true;
                          updates.deliveredAt = new Date().toISOString();
                        }
                        if (notes) updates.notes = notes;
                        await updateDoc(ref, updates);
                        setIsEditing(false);
                        setNotifMessage("Cập nhật đơn hàng thành công");
                        setNotifOpen(true);
                      } catch (e) {
                        // eslint-disable-next-line no-console
                        console.error(e);
                        setNotifMessage("Cập nhật thất bại");
                        setNotifOpen(true);
                      }
                    }}
                  >
                    Cập nhật đơn hàng
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Customer & Shipping Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Thông tin khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">
                    {(customer &&
                      (customer.firstName || customer.lastName
                        ? `${customer.firstName || ""} ${
                            customer.lastName || ""
                          }`
                        : customer.displayName)) ||
                      order.customerName ||
                      order.customer ||
                      "Khách vãng lai"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(customer && customer.email) || order.email || ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(customer && customer.phone) || order.phone || ""}
                  </p>
                </div>
                <Separator />
                <div className="text-sm">
                  <p>
                    Khách hàng từ:{" "}
                    {customer && customer.createdAt
                      ? toDate(customer.createdAt).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </p>
                  <p>
                    Loại tài khoản:{" "}
                    {customer && customer.role
                      ? customer.role === "customer"
                        ? "Khách hàng"
                        : "Admin"
                      : "Khách"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Địa chỉ giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">
                    {order.shippingAddress?.fullName ||
                      order.shippingAddress?.name ||
                      ""}
                  </p>
                  <p className="text-sm">
                    {order.shippingAddress?.phone || order.phone || ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.shippingAddress
                      ? `${order.shippingAddress.address}, ${
                          order.shippingAddress.ward || ""
                        }, ${order.shippingAddress.district || ""}, ${
                          order.shippingAddress.city || ""
                        }`
                      : ""}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Phương thức:</span>
                    <Badge variant="outline">
                      {order.paymentMethod === "COD"
                        ? "Tiền mặt"
                        : "Chuyển khoản"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Trạng thái:</span>
                    <Badge
                      variant={
                        order.paymentMethod === "COD" ? "secondary" : "default"
                      }
                    >
                      {order.paymentMethod === "COD"
                        ? "Chưa thanh toán"
                        : "Đã thanh toán"}
                    </Badge>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Tổng tiền:</span>
                    <span>
                      {Number(order.total || 0).toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {order.deliveryDate && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Giao hàng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Ngày giao dự kiến:</span>
                      <span className="text-sm font-medium">
                        {toDate(order.deliveryDate).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Phí vận chuyển:</span>
                      <span className="text-sm">Miễn phí</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
