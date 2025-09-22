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
  Eye,
  Edit,
  Truck,
  Filter,
  Download,
} from "lucide-react";
import { firestore } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    let unsub: any = null;
    const loadLocal = async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (data && data.orders) {
          const items = data.orders.map((d: any) => ({
            id: d.id,
            customer: d.fullname || "",
            email: d.email || "",
            phone: d.phone || "",
            total: Number(d.total || 0),
            status: d.status || "pending",
            paymentMethod: d.paymentMethod || "COD",
            date: d.createdAt
              ? new Date(d.createdAt).toISOString().split("T")[0]
              : "",
            items: Array.isArray(d.items) ? d.items.length : d.itemsCount || 0,
            address: d.address ? d.address.formatted || "" : "",
          }));
          setOrders(items);
        }
      } catch (e) {
        setOrders([]);
      }
    };

    if (firestore) {
      try {
        const q = query(
          collection(firestore, "orders"),
          orderBy("createdAt", "desc")
        );
        unsub = onSnapshot(q, (snap) => {
          const items = snap.docs.map((d) => {
            const data: any = d.data();
            const user = data.user || data.userId;
            return {
              id: d.id,
              customer:
                data.customerName ||
                (user
                  ? `${user.firstName || ""} ${user.lastName || ""}`
                  : "Unknown"),
              email: data.email || (user && user.email) || "unknown@email.com",
              phone: data.phone || (user && user.phone) || "N/A",
              total: Number(data.total || 0),
              status: data.status || "pending",
              paymentMethod: data.paymentMethod || "COD",
              date:
                data.createdAt && typeof data.createdAt.toDate === "function"
                  ? data.createdAt.toDate().toISOString().split("T")[0]
                  : data.createdAt
                  ? new Date(data.createdAt).toISOString().split("T")[0]
                  : "",
              items: Array.isArray(data.items)
                ? data.items.length
                : data.itemsCount || 0,
              address: data.shippingAddress
                ? `${data.shippingAddress.address}, ${data.shippingAddress.ward}, ${data.shippingAddress.district}, ${data.shippingAddress.city}`
                : "",
            };
          });
          setOrders(items);
        });
        return () => unsub && unsub();
      } catch (e) {
        loadLocal();
      }
    } else {
      loadLocal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markDelivered = async (orderId: string) => {
    try {
      await fetch("/api/orders", {
        method: "PUT",
        body: JSON.stringify({ id: orderId, status: "delivered" }),
        headers: { "Content-Type": "application/json" },
      });
      // refresh local list
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data && data.orders) {
        const items = data.orders.map((d: any) => ({
          id: d.id,
          customer: d.fullname || "",
          email: d.email || "",
          phone: d.phone || "",
          total: Number(d.total || 0),
          status: d.status || "pending",
          paymentMethod: d.paymentMethod || "COD",
          date: d.createdAt
            ? new Date(d.createdAt).toISOString().split("T")[0]
            : "",
          items: Array.isArray(d.items) ? d.items.length : d.itemsCount || 0,
          address: d.address ? d.address.formatted || "" : "",
        }));
        setOrders(items);
        // notify other admin pages (dashboard/reports/customers) that local data changed
        try {
          if (typeof window !== "undefined" && (window as any).dispatchEvent) {
            window.dispatchEvent(new Event("localDataChanged"));
          }
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      console.error("mark delivered error", e);
    }
  };

  const statuses = [
    "all",
    "pending",
    "confirmed",
    "shipping",
    "delivered",
    "cancelled",
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case "total-high":
        return b.total - a.total;
      case "total-low":
        return a.total - b.total;
      case "customer":
        return a.customer.localeCompare(b.customer);
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: {
        label: "Chờ xác nhận",
        className: "bg-yellow-100 text-yellow-700",
      },
      confirmed: {
        label: "Đã xác nhận",
        className: "bg-blue-100 text-blue-700",
      },
      shipping: {
        label: "Đang giao",
        className: "bg-purple-100 text-purple-700",
      },
      delivered: { label: "Đã giao", className: "bg-green-100 text-green-700" },
      cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-700" },
    };
    const statusInfo =
      statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
  };

  const getPaymentBadge = (method: string) => {
    return (
      <Badge variant="outline" className="border-slate-300 text-slate-700">
        {method === "COD" ? "Tiền mặt" : "Chuyển khoản"}
      </Badge>
    );
  };

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
                  Quản lý đơn hàng
                </h1>
                <p className="text-sm text-slate-600">
                  Theo dõi và xử lý đơn hàng
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
            >
              <Download className="w-4 h-4 mr-2" />
              Xuất báo cáo
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="border-slate-200">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">
                {orders.length}
              </p>
              <p className="text-sm text-slate-600">Tổng đơn hàng</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {orders.filter((o) => o.status === "pending").length}
              </p>
              <p className="text-sm text-slate-600">Chờ xác nhận</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {orders.filter((o) => o.status === "confirmed").length}
              </p>
              <p className="text-sm text-slate-600">Đã xác nhận</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">
                {orders.filter((o) => o.status === "shipping").length}
              </p>
              <p className="text-sm text-slate-600">Đang giao</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {orders.filter((o) => o.status === "delivered").length}
              </p>
              <p className="text-sm text-slate-600">Đã giao</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-slate-200 mb-6">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm đơn hàng, khách hàng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-rose-500 focus:ring-rose-500"
                />
              </div>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="border-slate-300 focus:border-rose-500 focus:ring-rose-500">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Chờ xác nhận</SelectItem>
                  <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="shipping">Đang giao</SelectItem>
                  <SelectItem value="delivered">Đã giao</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="border-slate-300 focus:border-rose-500 focus:ring-rose-500">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="customer">Tên khách hàng</SelectItem>
                  <SelectItem value="total-high">Giá trị cao</SelectItem>
                  <SelectItem value="total-low">Giá trị thấp</SelectItem>
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

        {/* Orders Table */}
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900">
                Danh sách đơn hàng ({sortedOrders.length})
              </CardTitle>
              <div className="text-sm text-slate-600">
                Tổng giá trị:{" "}
                {sortedOrders
                  .reduce((sum, order) => sum + order.total, 0)
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
                    <TableHead>Mã đơn hàng</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Liên hệ</TableHead>
                    <TableHead>Ngày đặt</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Thanh toán</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">
                            #{order.id}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">
                            {order.customer}
                          </p>
                          <p className="text-sm text-slate-600 line-clamp-1">
                            {order.address}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-slate-900">
                            {order.phone}
                          </p>
                          <p className="text-sm text-slate-600">
                            {order.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-900">{order.date}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-900">
                          {order.items} sản phẩm
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-slate-900">
                          {order.total.toLocaleString("vi-VN")}đ
                        </p>
                      </TableCell>
                      <TableCell>
                        {getPaymentBadge(order.paymentMethod)}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-600 hover:text-slate-900"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          {order.status === "confirmed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-900"
                            >
                              <Truck className="w-4 h-4" />
                            </Button>
                          )}
                          {order.status !== "delivered" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-800 hover:text-green-900"
                              onClick={() => markDelivered(order.id)}
                            >
                              Đã giao & trả tiền
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {sortedOrders.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Không tìm thấy đơn hàng
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
