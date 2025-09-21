"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import { ArrowLeft, Download, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from "lucide-react"
import { firestore } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'

export default function AdminReportsPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [reportType, setReportType] = useState("overview")

  // Live data (firestore) with safe empty fallbacks
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    let unsubOrders: any = null
    let unsubProducts: any = null
    let unsubUsers: any = null
    let pollHandle: any = null
    try {
      if (firestore) {
        const qOrders = query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'))
        const qProducts = query(collection(firestore, 'products'), orderBy('createdAt', 'desc'))
        const qUsers = query(collection(firestore, 'users'), orderBy('createdAt', 'desc'))
        unsubOrders = onSnapshot(qOrders, (snap) => setOrders(snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }))))
        unsubProducts = onSnapshot(qProducts, (snap) => setProducts(snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }))))
        unsubUsers = onSnapshot(qUsers, (snap) => setUsers(snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }))))
      }
    } catch (e) {
      // keep empty arrays
    }
    let onLocal: any = null
    if (!firestore) {
      const loadLocal = async () => {
        try {
          const [resO, resP, resU] = await Promise.all([
            fetch('/api/orders'),
            fetch('/api/local-products'),
            fetch('/api/customers'),
          ])
          if (resO.ok) {
            const data = await resO.json()
            setOrders(data && data.orders ? data.orders : [])
          }
          if (resP.ok) {
            const data = await resP.json()
            setProducts(Array.isArray(data) ? data : (data.products || []))
          }
          if (resU.ok) {
            const data = await resU.json()
            setUsers(data && data.customers ? data.customers : [])
          }
        } catch (e) {
          // ignore
        }
      }
      loadLocal()
      pollHandle = setInterval(loadLocal, 5000)
      onLocal = () => loadLocal()
      if (typeof window !== 'undefined' && (window as any).addEventListener) {
        window.addEventListener('localDataChanged', onLocal)
      }
    }

    return () => {
      if (unsubOrders) unsubOrders()
      if (unsubProducts) unsubProducts()
      if (unsubUsers) unsubUsers()
      if (pollHandle) clearInterval(pollHandle)
      if (onLocal && typeof window !== 'undefined' && (window as any).removeEventListener) {
        try {
          window.removeEventListener('localDataChanged', onLocal)
        } catch (e) {
          // ignore
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Helper to normalize createdAt to Date
  const toDate = (val: any) => (val && typeof val.toDate === 'function' ? val.toDate() : val ? new Date(val) : new Date())

  // Derived metrics
  const now = new Date()
  const daysAgo = (d: number) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - d)

  const totalRevenueThisMonth = orders.reduce((s, o) => {
    const d = toDate(o.createdAt)
    return (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) ? s + (Number(o.total) || 0) : s
  }, 0)

  const totalOrdersThisMonth = orders.filter((o) => {
    const d = toDate(o.createdAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const newCustomersThisMonth = users.filter((u) => {
    const d = toDate(u.createdAt)
    return d >= daysAgo(30)
  }).length

  const productsSoldCount = orders.reduce((s, o) => {
    const items = Array.isArray(o.items) ? o.items : []
    return s + items.reduce((ss: number, it: any) => ss + (Number(it.quantity || it.qty || 1) || 0), 0)
  }, 0)

  const monthlyRevenue = (() => {
    const map: Record<string, { month: string; revenue: number; orders: number; customers: number }> = {}
    orders.forEach((o) => {
      const d = toDate(o.createdAt)
      const key = `T${d.getMonth() + 1}`
      map[key] = map[key] || { month: key, revenue: 0, orders: 0, customers: 0 }
      map[key].revenue += Number(o.total) || 0
      map[key].orders += 1
    })
    return Object.values(map).slice(0, 6)
  })()

  const productCategories = (() => {
    try {
      const catMap: Record<string, { name: string; value: number; revenue: number; color: string }> = {}
      orders.forEach((o) => {
        const items = Array.isArray(o.items) ? o.items : []
        items.forEach((it: any) => {
          const pid = it.productId || it.id
          const prod = products.find((p) => String(p.id) === String(pid))
          const cat = (prod && prod.category) || 'Khác'
          const revenue = (Number(it.price || it.unitPrice || prod?.price || 0) || 0) * (Number(it.quantity || it.qty || 1) || 1)
          catMap[cat] = catMap[cat] || { name: cat, value: 0, revenue: 0, color: '#8884d8' }
          catMap[cat].value += Number(it.quantity || it.qty || 1) || 0
          catMap[cat].revenue += revenue
        })
      })
      const palette = ['#f43f5e','#3b82f6','#10b981','#f59e0b','#8b5cf6']
      return Object.keys(catMap).map((k, i) => ({ ...catMap[k], color: palette[i % palette.length] }))
    } catch (e) {
      return []
    }
  })()

  const dailyStats = (() => {
    const days = [] as any[]
    for (let i = 6; i >= 0; i--) {
      const day = daysAgo(i)
      const key = day.toISOString().slice(0,10)
      const bucket = { day: `T${day.getDate()}`, revenue: 0, orders: 0, visitors: 0 }
      orders.forEach((o) => {
        const d = toDate(o.createdAt)
        if (d.toISOString().slice(0,10) === key) {
          bucket.revenue += Number(o.total) || 0
          bucket.orders += 1
        }
      })
      days.push(bucket)
    }
    return days
  })()

  const topProducts = (() => {
    const map: Record<string, { name: string; sold: number; revenue: number; growth: number }> = {}
    orders.forEach((o) => {
      const items = Array.isArray(o.items) ? o.items : []
      items.forEach((it: any) => {
        const pid = it.productId || it.id
        const prod = products.find((p) => String(p.id) === String(pid))
        const name = prod?.name || `#${pid}`
        const qty = Number(it.quantity || it.qty || 1) || 0
        const price = Number(it.price || it.unitPrice || prod?.price || 0) || 0
        map[pid] = map[pid] || { name, sold: 0, revenue: 0, growth: 0 }
        map[pid].sold += qty
        map[pid].revenue += price * qty
      })
    })
    return Object.values(map).sort((a,b) => b.revenue - a.revenue).slice(0,5).map((p) => ({...p, growth: 0}))
  })()

  const customerSegments = (() => {
    const totalCustomers = users.length
    const newCustomers = users.filter((u) => toDate(u.createdAt) >= daysAgo(30)).length
    const regular = Math.max(0, totalCustomers - newCustomers)
    return [
      { segment: 'Khách hàng mới', count: newCustomers, percentage: totalCustomers ? +(newCustomers/totalCustomers*100).toFixed(1) : 0, avgSpent: 0 },
      { segment: 'Khách hàng thường xuyên', count: regular, percentage: totalCustomers ? +(regular/totalCustomers*100).toFixed(1) : 0, avgSpent: 0 },
    ]
  })()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="flex items-center space-x-2 text-slate-600 hover:text-slate-500">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Quay lại Dashboard</span>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Báo cáo & Thống kê</h1>
                <p className="text-sm text-slate-600">Phân tích dữ liệu kinh doanh chi tiết</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 ngày</SelectItem>
                  <SelectItem value="30d">30 ngày</SelectItem>
                  <SelectItem value="90d">3 tháng</SelectItem>
                  <SelectItem value="1y">1 năm</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Xuất báo cáo
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {(() => {
            const monthNow = now.getMonth()
            const yearNow = now.getFullYear()
            const prevMonth = monthNow - 1
            const prevYear = prevMonth < 0 ? yearNow - 1 : yearNow

            const totalRevenuePrevMonth = orders.reduce((s, o) => {
              const d = toDate(o.createdAt)
              const m = d.getMonth()
              const y = d.getFullYear()
              const isPrev = (m === (prevMonth < 0 ? 11 : prevMonth) && y === prevYear)
              return isPrev ? s + (Number(o.total) || 0) : s
            }, 0)

            const totalOrdersPrevMonth = orders.filter((o) => {
              const d = toDate(o.createdAt)
              const m = d.getMonth()
              const y = d.getFullYear()
              return (m === (prevMonth < 0 ? 11 : prevMonth) && y === prevYear)
            }).length

            const newCustomersPrevMonth = users.filter((u) => {
              const d = toDate(u.createdAt)
              return d.getMonth() === (prevMonth < 0 ? 11 : prevMonth) && d.getFullYear() === prevYear
            }).length

            const productsSoldPrevMonth = orders.reduce((s, o) => {
              const d = toDate(o.createdAt)
              const m = d.getMonth()
              const y = d.getFullYear()
              if (!(m === (prevMonth < 0 ? 11 : prevMonth) && y === prevYear)) return s
              const items = Array.isArray(o.items) ? o.items : []
              return s + items.reduce((ss: number, it: any) => ss + (Number(it.quantity || it.qty || 1) || 0), 0)
            }, 0)

            const pct = (current: number, previous: number) => {
              if (previous === 0) return null
              return +(((current - previous) / Math.max(1, previous)) * 100).toFixed(1)
            }

            const formatMoneyShort = (v: number) => {
              if (!v) return '0'
              if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
              if (v >= 1000) return `${(v / 1000).toFixed(1)}k`
              return v.toLocaleString('vi-VN')
            }

            const revenuePct = pct(totalRevenueThisMonth, totalRevenuePrevMonth)
            const ordersPct = pct(totalOrdersThisMonth, totalOrdersPrevMonth)
            const customersPct = pct(newCustomersThisMonth, newCustomersPrevMonth)
            const productsPct = pct(productsSoldCount, productsSoldPrevMonth)

            const MetricCard = ({ title, value, pctChange, icon, bgClass }: any) => (
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">{title}</p>
                      <p className="text-3xl font-bold text-slate-900">{value}</p>
                      <div className="flex items-center mt-2">
                        {pctChange === null ? (
                          <span className="text-sm text-slate-500">—</span>
                        ) : pctChange >= 0 ? (
                          <>
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600">+{pctChange}%</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                            <span className="text-sm text-red-600">{pctChange}%</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className={`w-12 h-12 ${bgClass} rounded-full flex items-center justify-center`}>
                      {icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )

            return (
              <>
                <MetricCard
                  title="Doanh thu tháng này"
                  value={`${formatMoneyShort(totalRevenueThisMonth)}`}
                  pctChange={revenuePct}
                  icon={<DollarSign className="w-6 h-6 text-green-600" />}
                  bgClass="bg-green-100"
                />

                <MetricCard
                  title="Đơn hàng tháng này"
                  value={totalOrdersThisMonth}
                  pctChange={ordersPct}
                  icon={<ShoppingCart className="w-6 h-6 text-blue-600" />}
                  bgClass="bg-blue-100"
                />

                <MetricCard
                  title="Khách hàng mới"
                  value={newCustomersThisMonth}
                  pctChange={customersPct}
                  icon={<Users className="w-6 h-6 text-purple-600" />}
                  bgClass="bg-purple-100"
                />

                <MetricCard
                  title="Sản phẩm bán ra"
                  value={productsSoldCount}
                  pctChange={productsPct}
                  icon={<Package className="w-6 h-6 text-orange-600" />}
                  bgClass="bg-orange-100"
                />
              </>
            )
          })()}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Revenue Trend */}
          <Card className="lg:col-span-2 border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Xu hướng doanh thu 6 tháng</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip
                    formatter={(value: number) => [`${value.toLocaleString("vi-VN")}đ`, "Doanh thu"]}
                    labelStyle={{ color: "#1e293b" }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Product Categories */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Danh mục sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={productCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {productCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Tỷ lệ"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {productCategories.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                      <span className="text-slate-700">{item.name}</span>
                    </div>
                    <span className="font-medium text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Performance */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Hiệu suất 7 ngày qua</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      if (name === "revenue") return [`${value.toLocaleString("vi-VN")}đ`, "Doanh thu"]
                      if (name === "orders") return [value, "Đơn hàng"]
                      return [value, "Lượt truy cập"]
                    }}
                    labelStyle={{ color: "#1e293b" }}
                  />
                  <Bar dataKey="orders" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Sản phẩm bán chạy nhất</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-rose-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{product.name}</p>
                        <p className="text-sm text-slate-600">Đã bán: {product.sold}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{product.revenue.toLocaleString("vi-VN")}đ</p>
                      <div className="flex items-center">
                        {product.growth > 0 ? (
                          <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                        )}
                        <span className={`text-xs ${product.growth > 0 ? "text-green-600" : "text-red-600"}`}>
                          {product.growth > 0 ? "+" : ""}
                          {product.growth}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Segments */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Phân khúc khách hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {customerSegments.map((segment, index) => (
                <div key={index} className="text-center p-6 bg-slate-50 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2">{segment.segment}</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{segment.count}</p>
                      <p className="text-sm text-slate-600">khách hàng ({segment.percentage}%)</p>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-rose-600">{segment.avgSpent.toLocaleString("vi-VN")}đ</p>
                      <p className="text-sm text-slate-600">Chi tiêu trung bình</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
