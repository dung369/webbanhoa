"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  CreditCard,
  Calendar,
  Download,
  Filter,
  Plus,
} from "lucide-react";
import { firestore } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function FinancePage() {
  const [dateRange, setDateRange] = useState("30");
  const [searchQuery, setSearchQuery] = useState("");

  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [categoryRevenue, setCategoryRevenue] = useState<any[]>([]);

  useEffect(() => {
    let unsubOrders: any = null;
    let unsubProducts: any = null;
    try {
      if (firestore) {
        const qOrders = query(
          collection(firestore, "orders"),
          orderBy("createdAt", "desc")
        );
        const qProducts = query(
          collection(firestore, "products"),
          orderBy("createdAt", "desc")
        );
        const { onSnapshot: os } = require("firebase/firestore");
        unsubOrders = os(qOrders, (snap: any) => {
          const items = snap.docs.map((d: any) => ({
            id: d.id,
            ...(d.data() || {}),
          }));
          setOrders(items);
        });
        unsubProducts = os(qProducts, (snap: any) => {
          const items = snap.docs.map((d: any) => ({
            id: d.id,
            ...(d.data() || {}),
          }));
          setProducts(items);
        });
      } else {
        // no firestore available - keep empty lists
        setOrders([]);
        setProducts([]);
      }
    } catch (e) {
      // ignore errors and keep empty arrays
      setOrders([]);
      setProducts([]);
    }
    return () => {
      if (unsubOrders) unsubOrders();
      if (unsubProducts) unsubProducts();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived metrics
  const totalRevenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((s, o) => s + (Number(o.total) || 0), 0);
  const totalOrders = orders.filter((o) => o.status === "delivered").length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const pendingRevenue = orders
    .filter((o) =>
      ["pending", "confirmed", "preparing", "shipping"].includes(o.status)
    )
    .reduce((s, o) => s + (Number(o.total) || 0), 0);

  // revenueData: simple monthly buckets from orders.createdAt
  useEffect(() => {
    try {
      const buckets: Record<
        string,
        { month: string; revenue: number; orders: number }
      > = {};
      orders.forEach((o) => {
        const d =
          o.createdAt && o.createdAt.toDate
            ? o.createdAt.toDate()
            : o.createdAt
            ? new Date(o.createdAt)
            : new Date();
        const month = `T${d.getMonth() + 1}`;
        buckets[month] = buckets[month] || { month, revenue: 0, orders: 0 };
        buckets[month].revenue += Number(o.total) || 0;
        buckets[month].orders += 1;
      });
      const arr = Object.values(buckets).slice(0, 6);
      setRevenueData(
        arr.length
          ? arr
          : [
              { month: "T1", revenue: 15000000, orders: 45 },
              { month: "T2", revenue: 18000000, orders: 52 },
              { month: "T3", revenue: 22000000, orders: 68 },
              { month: "T4", revenue: 19000000, orders: 58 },
              { month: "T5", revenue: 25000000, orders: 75 },
              { month: "T6", revenue: 28000000, orders: 82 },
            ]
      );
    } catch (e) {
      // ignore
    }
  }, [orders]);

  // category revenue computed from order items and product categories
  useEffect(() => {
    try {
      const catMap: Record<string, number> = {};
      orders.forEach((o) => {
        const items = Array.isArray(o.items) ? o.items : [];
        items.forEach((it: any) => {
          const pid = it.productId || it.id || "";
          const price = Number(it.price || it.unitPrice || 0);
          const qty = Number(it.quantity || it.qty || 1);
          const prod = products.find((p) => String(p.id) === String(pid));
          const cat = (prod && prod.category) || "Khác";
          catMap[cat] = (catMap[cat] || 0) + price * qty;
        });
      });
      const palette = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#6366f1"];
      const arr = Object.keys(catMap).map((k, i) => ({
        name: k,
        value: catMap[k],
        color: palette[i % palette.length],
      }));
      setCategoryRevenue(
        arr.length
          ? arr
          : [
              { name: "Hoa hồng", value: 8500000, color: "#ef4444" },
              { name: "Hoa tulip", value: 6200000, color: "#f97316" },
              { name: "Hoa lan", value: 4800000, color: "#eab308" },
              { name: "Hoa cẩm chướng", value: 3200000, color: "#22c55e" },
              { name: "Khác", value: 2300000, color: "#6366f1" },
            ]
      );
    } catch (e) {
      // ignore
    }
  }, [orders, products]);

  const transactions = orders.map((order) => ({
    id: order.id,
    type:
      order.status === "delivered"
        ? "income"
        : order.status === "cancelled"
        ? "refund"
        : "pending",
    amount: Number(order.total) || 0,
    description: `Đơn hàng #${order.id}`,
    date:
      order.createdAt && order.createdAt.toDate
        ? order.createdAt.toDate()
        : order.createdAt
        ? new Date(order.createdAt)
        : new Date(),
    status: order.status,
    paymentMethod: order.paymentMethod,
  }));

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.id
        .toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTransactionBadge = (type: string, status: string) => {
    if (type === "income")
      return <Badge className="bg-green-100 text-green-700">Thu nhập</Badge>;
    if (type === "refund")
      return <Badge className="bg-red-100 text-red-700">Hoàn tiền</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-700">Chờ xử lý</Badge>;
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
                  Quản lý tài chính
                </h1>
                <p className="text-sm text-slate-600">
                  Theo dõi doanh thu và chi phí
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 ngày</SelectItem>
                  <SelectItem value="30">30 ngày</SelectItem>
                  <SelectItem value="90">3 tháng</SelectItem>
                  <SelectItem value="365">1 năm</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Xuất báo cáo
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng doanh thu
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalRevenue.toLocaleString("vi-VN")}₫
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
                {/* trend placeholder */}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Đơn hàng hoàn thành
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
                +8% từ tháng trước
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Giá trị đơn hàng TB
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {averageOrderValue.toLocaleString("vi-VN")}₫
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
                +5% từ tháng trước
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Doanh thu chờ
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pendingRevenue.toLocaleString("vi-VN")}₫
              </div>
              <p className="text-xs text-muted-foreground">
                Từ{" "}
                {
                  orders.filter(
                    (o: any) => !["delivered", "cancelled"].includes(o.status)
                  ).length
                }{" "}
                đơn hàng
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="transactions">Giao dịch</TabsTrigger>
            <TabsTrigger value="analytics">Phân tích</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Revenue Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Doanh thu theo tháng</CardTitle>
                  <CardDescription>
                    Biểu đồ doanh thu 6 tháng gần nhất
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis
                        tickFormatter={(value) =>
                          `${(value / 1000000).toFixed(0)}M`
                        }
                      />
                      <Tooltip
                        formatter={(value) => [
                          `${Number(value).toLocaleString("vi-VN")}₫`,
                          "Doanh thu",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#ef4444"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Doanh thu theo danh mục</CardTitle>
                  <CardDescription>
                    Phân bố doanh thu theo loại hoa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryRevenue}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {categoryRevenue.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) =>
                          `${Number(value).toLocaleString("vi-VN")}₫`
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Sản phẩm bán chạy</CardTitle>
                <CardDescription>
                  Top 5 sản phẩm có doanh thu cao nhất
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.slice(0, 5).map((product, index) => (
                    <div
                      key={product.id || index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-rose-600">
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {product.name || `Sản phẩm ${index + 1}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {product.category || "Khác"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {(
                            Number(product.price || 0) *
                            Math.floor(Math.random() * 20 + 5)
                          ).toLocaleString("vi-VN")}
                          ₫
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {Math.floor(Math.random() * 20 + 5)} đã bán
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            {/* Transaction Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Tìm kiếm giao dịch..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Bộ lọc
                  </Button>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm giao dịch
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử giao dịch</CardTitle>
                <CardDescription>
                  Danh sách tất cả giao dịch tài chính
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã giao dịch</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Phương thức</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead className="text-right">Số tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          #{transaction.id}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          {transaction.date.toLocaleDateString("vi-VN")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {transaction.paymentMethod === "COD"
                              ? "Tiền mặt"
                              : "Chuyển khoản"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getTransactionBadge(
                            transaction.type,
                            transaction.status
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              transaction.type === "income"
                                ? "text-green-600"
                                : transaction.type === "refund"
                                ? "text-red-600"
                                : "text-yellow-600"
                            }
                          >
                            {transaction.type === "refund" ? "-" : "+"}
                            {transaction.amount.toLocaleString("vi-VN")}₫
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Số đơn hàng theo tháng</CardTitle>
                  <CardDescription>Biểu đồ số lượng đơn hàng</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tỷ lệ thanh toán</CardTitle>
                  <CardDescription>
                    Phân bố phương thức thanh toán
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Tiền mặt (COD)</span>
                      </div>
                      <span className="font-medium">65%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Chuyển khoản</span>
                      </div>
                      <span className="font-medium">35%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: "65%" }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Financial Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Chỉ số tài chính</CardTitle>
                <CardDescription>
                  Các chỉ số quan trọng về tài chính
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {(
                        (totalRevenue / (totalRevenue + 5000000)) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tỷ suất lợi nhuận
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {((totalRevenue / totalOrders) * 0.15).toLocaleString(
                        "vi-VN"
                      )}
                      ₫
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Chi phí TB/đơn hàng
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {(totalRevenue / 30).toLocaleString("vi-VN")}₫
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Doanh thu TB/ngày
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
