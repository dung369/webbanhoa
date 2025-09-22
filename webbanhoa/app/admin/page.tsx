"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  MessageSquare,
  Plus,
  LogOut,
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
import AdminChatDrawer from "@/components/admin-chat-drawer";
import { firestore } from "@/lib/firebase";
import { signOut } from "@/lib/devAuth";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState("7d");

  // Live data (fallback to empty arrays / zeroes)
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    let unsubProducts: any = null;
    let unsubOrders: any = null;
    let unsubUsers: any = null;
    let pollHandle: any = null;
    try {
      if (firestore) {
        const qProducts = query(
          collection(firestore, "products"),
          orderBy("createdAt", "desc")
        );
        const qOrders = query(
          collection(firestore, "orders"),
          orderBy("createdAt", "desc")
        );
        const qUsers = query(
          collection(firestore, "users"),
          orderBy("createdAt", "desc")
        );
        unsubProducts = onSnapshot(qProducts, (snap) =>
          setProducts(snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) })))
        );
        unsubOrders = onSnapshot(qOrders, (snap) =>
          setOrders(snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) })))
        );
        unsubUsers = onSnapshot(qUsers, (snap) =>
          setUsers(snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) })))
        );
      }
    } catch (e) {
      // ignore and keep empty arrays
    }
    // if firestore is not configured, poll local APIs every 5s so dashboard stays fresh
    if (!firestore) {
      const loadLocal = async () => {
        try {
          const [resP, resO, resU] = await Promise.all([
            fetch("/api/local-products"),
            fetch("/api/orders"),
            fetch("/api/customers"),
          ]);
          if (resP.ok) {
            const data = await resP.json();
            setProducts(Array.isArray(data) ? data : data.products || []);
          }
          if (resO.ok) {
            const data = await resO.json();
            setOrders(data && data.orders ? data.orders : []);
          }
          if (resU.ok) {
            const data = await resU.json();
            setUsers(data && data.customers ? data.customers : []);
          }
        } catch (e) {
          // ignore
        }
      };
      loadLocal();
      pollHandle = setInterval(loadLocal, 5000);
      // listen for immediate local data change events
      const onLocal = () => loadLocal();
      if (typeof window !== "undefined" && (window as any).addEventListener) {
        window.addEventListener("localDataChanged", onLocal);
      }
      // ensure we remove listener in cleanup
      const cleanupListener = () => {
        if (
          typeof window !== "undefined" &&
          (window as any).removeEventListener
        ) {
          window.removeEventListener("localDataChanged", onLocal);
        }
      };
      // attach cleanup to outer return
      const origReturn = () => {
        if (unsubProducts) unsubProducts();
        if (unsubOrders) unsubOrders();
        if (unsubUsers) unsubUsers();
        if (pollHandle) clearInterval(pollHandle);
        cleanupListener();
      };
      return origReturn;
    }

    return () => {
      if (unsubProducts) unsubProducts();
      if (unsubOrders) unsubOrders();
      if (unsubUsers) unsubUsers();
      if (pollHandle) clearInterval(pollHandle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = {
    totalRevenue: orders
      .filter((o) => o.status === "delivered")
      .reduce((s, o) => s + (Number(o.total) || 0), 0),
    totalOrders: orders.length,
    totalCustomers: users.length,
    totalProducts: products.length,
    revenueChange: 0,
    ordersChange: 0,
    customersChange: 0,
    productsChange: 0,
  };

  const revenueData = (() => {
    try {
      const buckets: Record<string, { name: string; revenue: number }> = {};
      orders.forEach((o) => {
        const d =
          o.createdAt && o.createdAt.toDate
            ? o.createdAt.toDate()
            : o.createdAt
            ? new Date(o.createdAt)
            : new Date();
        const name = `T${d.getMonth() + 1}`;
        buckets[name] = buckets[name] || { name, revenue: 0 };
        buckets[name].revenue += Number(o.total) || 0;
      });
      const arr = Object.values(buckets).slice(0, 7);
      return arr.length ? arr : [];
    } catch (e) {
      return [];
    }
  })();

  const orderStatusData = [
    {
      name: "Đã giao",
      value: orders.filter((o) => o.status === "delivered").length,
      color: "#10b981",
    },
    {
      name: "Đang giao",
      value: orders.filter((o) => o.status === "shipping").length,
      color: "#f59e0b",
    },
    {
      name: "Đã xác nhận",
      value: orders.filter((o) => o.status === "confirmed").length,
      color: "#3b82f6",
    },
    {
      name: "Chờ xác nhận",
      value: orders.filter((o) => o.status === "pending").length,
      color: "#ef4444",
    },
  ];

  const topProducts = (() => {
    try {
      const map: Record<
        string,
        { name: string; revenue: number; sold: number }
      > = {};
      orders.forEach((o) => {
        const items = Array.isArray(o.items) ? o.items : [];
        items.forEach((it: any) => {
          const pid = it.productId || it.id;
          const price = Number(it.price || it.unitPrice || 0);
          const qty = Number(it.quantity || it.qty || 1);
          map[pid] = map[pid] || { name: "", revenue: 0, sold: 0 };
          map[pid].revenue += price * qty;
          map[pid].sold += qty;
        });
      });
      // attach product names
      Object.keys(map).forEach((pid) => {
        const p = products.find((x) => String(x.id) === String(pid));
        map[pid].name = (p && p.name) || `#${pid}`;
      });
      return Object.values(map)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 4);
    } catch (e) {
      return [];
    }
  })();

  const recentOrders = orders
    .slice(0, 3)
    .map((o) => ({
      id: o.id,
      customer: o.customerName || o.customer || o.userId,
      total: o.total,
      status: o.status,
      date:
        o.createdAt && o.createdAt.toDate
          ? o.createdAt.toDate().toISOString().slice(0, 10)
          : o.createdAt,
    }));

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

  // Quick-delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteProducts, setDeleteProducts] = useState<any[]>([]);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<
    "orders" | "customers" | "products"
  >("orders");
  const [filterItems, setFilterItems] = useState<any[]>([]);
  const [filterSelectedId, setFilterSelectedId] = useState<string | null>(null);
  const [filterLoading, setFilterLoading] = useState(false);
  const router = useRouter();

  const loadProductsForDelete = async () => {
    try {
      if (firestore) {
        const q = query(
          collection(firestore, "products"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setDeleteProducts(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }))
        );
      } else {
        const res = await fetch("/api/local-products");
        if (res.ok) {
          const data = await res.json();
          setDeleteProducts(Array.isArray(data) ? data : []);
        } else {
          setDeleteProducts([]);
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("loadProductsForDelete error", e);
      setDeleteProducts([]);
    }
  };

  const loadFilterItems = async (type: "orders" | "customers" | "products") => {
    try {
      if (firestore) {
        if (type === "products") {
          const q = query(
            collection(firestore, "products"),
            orderBy("createdAt", "desc")
          );
          const snap = await getDocs(q);
          setFilterItems(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }))
          );
        } else if (type === "orders") {
          const q = query(
            collection(firestore, "orders"),
            orderBy("createdAt", "desc")
          );
          const snap = await getDocs(q);
          setFilterItems(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }))
          );
        } else if (type === "customers") {
          const q = query(
            collection(firestore, "users"),
            orderBy("createdAt", "desc")
          );
          const snap = await getDocs(q);
          setFilterItems(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }))
          );
        }
      } else {
        if (type === "products") {
          const res = await fetch("/api/local-products");
          if (res.ok) setFilterItems(await res.json());
          else setFilterItems([]);
        } else if (type === "orders") {
          const res = await fetch("/api/orders");
          const payload = await res.json().catch(() => null);
          if (res.ok)
            setFilterItems(payload && payload.orders ? payload.orders : []);
          else setFilterItems([]);
        } else if (type === "customers") {
          const res = await fetch("/api/customers");
          const payload = await res.json().catch(() => null);
          if (res.ok)
            setFilterItems(
              payload && payload.customers ? payload.customers : []
            );
          else setFilterItems([]);
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("loadFilterItems error", e);
      setFilterItems([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-rose-50 font-bold text-lg">H</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-slate-600">
                  Hoa Tươi Việt - Quản lý cửa hàng
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Xem website
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
                onClick={async () => {
                  try {
                    setLogoutLoading(true);
                    await signOut();
                    // redirect to home
                    router.push("/");
                  } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error("signOut error", e);
                  } finally {
                    setLogoutLoading(false);
                  }
                }}
                disabled={logoutLoading}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {logoutLoading ? "Đang đăng xuất..." : "Đăng xuất"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Doanh thu
                  </p>
                  <p className="text-3xl font-bold text-slate-900">
                    {stats.totalRevenue.toLocaleString("vi-VN")}đ
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">
                      +{stats.revenueChange}%
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Đơn hàng</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {stats.totalOrders}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    <span className="text-sm text-red-600">
                      {stats.ordersChange}%
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Khách hàng
                  </p>
                  <p className="text-3xl font-bold text-slate-900">
                    {stats.totalCustomers}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">
                      +{stats.customersChange}%
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Sản phẩm</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {stats.totalProducts}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">
                      +{stats.productsChange}%
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2 border-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-900">
                  Doanh thu 7 ngày qua
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant={timeRange === "7d" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange("7d")}
                    className="text-xs"
                  >
                    7 ngày
                  </Button>
                  <Button
                    variant={timeRange === "30d" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange("30d")}
                    className="text-xs"
                  >
                    30 ngày
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis
                    stroke="#64748b"
                    tickFormatter={(value) =>
                      `${(value / 1000000).toFixed(1)}M`
                    }
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `${value.toLocaleString("vi-VN")}đ`,
                      "Doanh thu",
                    ]}
                    labelStyle={{ color: "#1e293b" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f43f5e"
                    strokeWidth={3}
                    dot={{ fill: "#f43f5e" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">
                Trạng thái đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Tỷ lệ"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {orderStatusData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-slate-700">{item.name}</span>
                    </div>
                    <span className="font-medium text-slate-900">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Products */}
          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-900">
                  Sản phẩm bán chạy
                </CardTitle>
                <Link href="/admin/products">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
                  >
                    Xem tất cả
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-rose-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {product.name}
                        </p>
                        <p className="text-sm text-slate-600">
                          Đã bán: {product.sold}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">
                        {product.revenue.toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-900">
                  Đơn hàng gần đây
                </CardTitle>
                <Link href="/admin/orders">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
                  >
                    Xem tất cả
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-slate-900">#{order.id}</p>
                      <p className="text-sm text-slate-600">{order.customer}</p>
                      <p className="text-xs text-slate-500">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">
                        {order.total.toLocaleString("vi-VN")}đ
                      </p>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-slate-200 mt-8">
          <CardHeader>
            <CardTitle className="text-slate-900">Thao tác nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/admin/products/new">
                <Button className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm sản phẩm
                </Button>
              </Link>
              <Link href="/admin/feedback">
                <Button
                  variant="outline"
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Ghi nhận ý kiến khách hàng
                </Button>
              </Link>
              <div>
                <Link href="/chat">
                  <Button
                    variant="outline"
                    className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat với khách hàng
                  </Button>
                </Link>
              </div>
              <Link href="/admin/orders">
                <Button
                  variant="outline"
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Quản lý đơn hàng
                </Button>
              </Link>
              <Link href="/admin/customers">
                <Button
                  variant="outline"
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Quản lý khách hàng
                </Button>
              </Link>
              <div>
                <Button
                  variant="outline"
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
                  onClick={() => setFilterDialogOpen(true)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Lọc dữ liệu
                </Button>
              </div>
              <div>
                <Link href="/admin">
                  <Button
                    variant="outline"
                    className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Đi tới Dashboard
                  </Button>
                </Link>
              </div>
              <Link href="/admin/reports">
                <Button
                  variant="outline"
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
                >
                  <BarChart className="w-4 h-4 mr-2" />
                  Báo cáo
                </Button>
              </Link>
              <Dialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                  setDeleteDialogOpen(open);
                  if (open) loadProductsForDelete();
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Xóa sản phẩm
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Xóa sản phẩm</DialogTitle>
                    <DialogDescription>
                      Chọn sản phẩm muốn xóa. Nếu Firestore được cấu hình thì sẽ
                      xóa từ Firestore, ngược lại xóa từ local.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 mt-4">
                    <label className="block text-sm text-slate-700">
                      Sản phẩm
                    </label>
                    <select
                      className="w-full border rounded p-2"
                      value={selectedDeleteId || ""}
                      onChange={(e) => setSelectedDeleteId(e.target.value)}
                    >
                      <option value="">-- Chọn sản phẩm --</option>
                      {deleteProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title || p.name || `#${p.id}`}{" "}
                          {p.images && p.images.length
                            ? `— ${String(p.images[0]).split("/").pop()}`
                            : ""}
                        </option>
                      ))}
                    </select>
                    {deleteMessage && (
                      <div className="text-sm text-slate-700">
                        {deleteMessage}
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDeleteDialogOpen(false);
                        setSelectedDeleteId(null);
                        setDeleteMessage(null);
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={async () => {
                        if (!selectedDeleteId)
                          return setDeleteMessage("Vui lòng chọn một sản phẩm");
                        setDeleteLoading(true);
                        try {
                          if (firestore) {
                            await deleteDoc(
                              doc(firestore, "products", selectedDeleteId)
                            );
                            setDeleteMessage("Đã xóa sản phẩm (Firestore)");
                          } else {
                            const prev = deleteProducts;
                            setDeleteProducts(
                              prev.filter((p) => p.id !== selectedDeleteId)
                            );
                            const res = await fetch("/api/local-products", {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: selectedDeleteId }),
                            });
                            const payload = await res.json().catch(() => null);
                            if (res.ok)
                              setDeleteMessage("Đã xóa sản phẩm (local)");
                            else {
                              setDeleteProducts(prev);
                              setDeleteMessage(
                                "Xóa thất bại: " +
                                  (payload?.error || res.status)
                              );
                            }
                          }
                        } catch (e) {
                          // eslint-disable-next-line no-console
                          console.error("delete quick action error", e);
                          setDeleteMessage("Xóa thất bại");
                        } finally {
                          setDeleteLoading(false);
                        }
                      }}
                    >
                      {deleteLoading ? "Đang xóa..." : "Xóa"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {/* Filter / delete data dialog */}
              <Dialog
                open={filterDialogOpen}
                onOpenChange={(open) => {
                  setFilterDialogOpen(open);
                  if (open) loadFilterItems(filterType);
                }}
              >
                <DialogTrigger asChild>
                  <></>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Lọc dữ liệu / Xóa bản ghi</DialogTitle>
                    <DialogDescription>
                      Chọn loại dữ liệu để xóa (dùng cẩn thận). Trong môi trường
                      local sẽ xóa từ file JSON.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 mt-4">
                    <label className="block text-sm text-slate-700">
                      Loại dữ liệu
                    </label>
                    <select
                      className="w-full border rounded p-2"
                      value={filterType}
                      onChange={(e) => {
                        const v = e.target.value as any;
                        setFilterType(v);
                        loadFilterItems(v);
                      }}
                    >
                      <option value="orders">Đơn hàng</option>
                      <option value="customers">Khách hàng</option>
                      <option value="products">Sản phẩm</option>
                    </select>

                    <label className="block text-sm text-slate-700">
                      Bản ghi
                    </label>
                    <select
                      className="w-full border rounded p-2"
                      value={filterSelectedId || ""}
                      onChange={(e) => setFilterSelectedId(e.target.value)}
                    >
                      <option value="">-- Chọn bản ghi --</option>
                      {filterItems.map((it) => (
                        <option key={it.id} value={it.id}>
                          {it.name || it.title || it.email || `#${it.id}`}
                        </option>
                      ))}
                    </select>

                    {deleteMessage && (
                      <div className="text-sm text-slate-700">
                        {deleteMessage}
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFilterDialogOpen(false);
                        setFilterSelectedId(null);
                        setDeleteMessage(null);
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={async () => {
                        if (!filterSelectedId)
                          return setDeleteMessage("Vui lòng chọn một bản ghi");
                        setFilterLoading(true);
                        try {
                          if (firestore) {
                            // Use Firestore deletion where applicable
                            if (filterType === "products")
                              await deleteDoc(
                                doc(firestore, "products", filterSelectedId)
                              );
                            if (filterType === "orders")
                              await deleteDoc(
                                doc(firestore, "orders", filterSelectedId)
                              );
                            if (filterType === "customers")
                              await deleteDoc(
                                doc(firestore, "users", filterSelectedId)
                              );
                            setDeleteMessage("Đã xóa (Firestore)");
                          } else {
                            let res;
                            if (filterType === "products") {
                              res = await fetch("/api/local-products", {
                                method: "DELETE",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: filterSelectedId }),
                              });
                            } else if (filterType === "orders") {
                              res = await fetch("/api/orders", {
                                method: "DELETE",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: filterSelectedId }),
                              });
                            } else if (filterType === "customers") {
                              res = await fetch("/api/customers", {
                                method: "DELETE",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: filterSelectedId }),
                              });
                            }
                            const payload = res
                              ? await res.json().catch(() => null)
                              : null;
                            if (res && res.ok) {
                              setDeleteMessage("Đã xóa (local)");
                              // notify other admin pages to reload immediately
                              if (
                                typeof window !== "undefined" &&
                                (window as any).dispatchEvent
                              ) {
                                window.dispatchEvent(
                                  new Event("localDataChanged")
                                );
                              }
                            } else {
                              setDeleteMessage(
                                "Xóa thất bại: " +
                                  (payload?.error ||
                                    (res && res.status) ||
                                    "unknown")
                              );
                            }
                          }
                        } catch (e) {
                          // eslint-disable-next-line no-console
                          console.error("filter delete error", e);
                          setDeleteMessage("Xóa thất bại");
                        } finally {
                          setFilterLoading(false);
                        }
                      }}
                    >
                      {filterLoading ? "Đang xóa..." : "Xóa"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
