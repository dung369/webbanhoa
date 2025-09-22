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
  Mail,
  Phone,
  Filter,
  Download,
  UserPlus,
} from "lucide-react";
import { firestore } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export default function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    let unsub: any = null;
    const loadLocal = async () => {
      try {
        const res = await fetch("/api/customers");
        const data = await res.json();
        if (data && data.customers) setCustomers(data.customers);
      } catch (e) {
        setCustomers([]);
      }
    };
    let onLocal: any = null;
    if (!firestore) {
      loadLocal();
      onLocal = () => loadLocal();
      if (typeof window !== "undefined" && (window as any).addEventListener) {
        window.addEventListener("localDataChanged", onLocal);
      }
      const poll = setInterval(() => loadLocal(), 5000);
      return () => {
        clearInterval(poll);
        if (
          onLocal &&
          typeof window !== "undefined" &&
          (window as any).removeEventListener
        ) {
          try {
            window.removeEventListener("localDataChanged", onLocal);
          } catch (e) {
            // ignore
          }
        }
      };
    } else {
      const q = query(
        collection(firestore, "users"),
        orderBy("createdAt", "desc")
      );
      unsub = onSnapshot(q, (snap: any) => {
        const items = snap.docs.map((d: any) => ({
          id: d.id,
          ...(d.data() || {}),
        }));
        setCustomers(items);
      });
    }
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const name = (
      customer.name || `${customer.firstName || ""} ${customer.lastName || ""}`
    ).toLowerCase();
    const email = (customer.email || "").toLowerCase();
    const phone = customer.phone || "";
    const matchesSearch =
      name.includes(searchQuery.toLowerCase()) ||
      email.includes(searchQuery.toLowerCase()) ||
      phone.includes(searchQuery);
    return matchesSearch;
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return (a.name || "").localeCompare(b.name || "");
      case "spent-high":
        return (b.totalSpent || 0) - (a.totalSpent || 0);
      case "spent-low":
        return (a.totalSpent || 0) - (b.totalSpent || 0);
      case "orders-high":
        return (b.totalOrders || 0) - (a.totalOrders || 0);
      case "orders-low":
        return (a.totalOrders || 0) - (b.totalOrders || 0);
      default:
        return (
          new Date(b.joinDate || b.createdAt || 0).getTime() -
          new Date(a.joinDate || a.createdAt || 0).getTime()
        );
    }
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: "Hoạt động", className: "bg-green-100 text-green-700" },
      vip: { label: "VIP", className: "bg-purple-100 text-purple-700" },
      inactive: {
        label: "Không hoạt động",
        className: "bg-gray-100 text-gray-700",
      },
    };
    const statusInfo =
      statusMap[status as keyof typeof statusMap] || statusMap.active;
    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
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
                  Quản lý khách hàng
                </h1>
                <p className="text-sm text-slate-600">
                  Theo dõi và quản lý thông tin khách hàng
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                Xuất danh sách
              </Button>
              <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Thêm khách hàng
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-slate-200">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">
                {customers.length}
              </p>
              <p className="text-sm text-slate-600">Tổng khách hàng</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {customers.filter((c) => c.status === "active").length}
              </p>
              <p className="text-sm text-slate-600">Đang hoạt động</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">
                {customers.filter((c) => c.status === "vip").length}
              </p>
              <p className="text-sm text-slate-600">Khách VIP</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-rose-600">
                {(
                  customers.reduce((sum, c) => sum + c.totalSpent, 0) / 1000000
                ).toFixed(1)}
                M
              </p>
              <p className="text-sm text-slate-600">Tổng chi tiêu</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-slate-200 mb-6">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm khách hàng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-rose-500 focus:ring-rose-500"
                />
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="border-slate-300 focus:border-rose-500 focus:ring-rose-500">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="name">Tên A-Z</SelectItem>
                  <SelectItem value="spent-high">Chi tiêu cao</SelectItem>
                  <SelectItem value="spent-low">Chi tiêu thấp</SelectItem>
                  <SelectItem value="orders-high">Đơn hàng nhiều</SelectItem>
                  <SelectItem value="orders-low">Đơn hàng ít</SelectItem>
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

        {/* Customers Table */}
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900">
                Danh sách khách hàng ({sortedCustomers.length})
              </CardTitle>
              <div className="text-sm text-slate-600">
                Trung bình chi tiêu:{" "}
                {customers.length > 0
                  ? (
                      customers.reduce((sum, c) => sum + c.totalSpent, 0) /
                      customers.length
                    ).toLocaleString("vi-VN")
                  : 0}
                đ
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Liên hệ</TableHead>
                    <TableHead>Địa chỉ</TableHead>
                    <TableHead>Ngày tham gia</TableHead>
                    <TableHead>Đơn hàng</TableHead>
                    <TableHead>Tổng chi tiêu</TableHead>
                    <TableHead>Đơn gần nhất</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">
                            {customer.name}
                          </p>
                          <p className="text-sm text-slate-600">
                            ID: {customer.id}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-slate-900">
                            {customer.phone}
                          </p>
                          <p className="text-sm text-slate-600">
                            {customer.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-900 line-clamp-2">
                          {customer.address}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-900">
                          {customer.joinDate}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-slate-900">
                          {customer.totalOrders}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-slate-900">
                          {customer.totalSpent.toLocaleString("vi-VN")}đ
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-900">
                          {customer.lastOrder || "Chưa có"}
                        </p>
                      </TableCell>
                      <TableCell>{getStatusBadge(customer.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-600 hover:text-slate-900"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-900"
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-purple-600 hover:text-purple-900"
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {sortedCustomers.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Không tìm thấy khách hàng
                </h3>
                <p className="text-slate-600">Thử thay đổi từ khóa tìm kiếm</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
