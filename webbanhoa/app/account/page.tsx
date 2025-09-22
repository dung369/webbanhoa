"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Bell,
} from "lucide-react";
import SiteHeader from "@/components/site-header";

export default function AccountPage() {
  const [isEditing, setIsEditing] = useState(false);

  const user = {
    firstName: "Nguyễn",
    lastName: "Văn A",
    email: "nguyenvana@email.com",
    phone: "0123456789",
    address: "123 Đường ABC, Phường 1, Quận 1, TP.HCM",
  };

  const orders = [
    {
      id: "DH001",
      date: "2024-01-30",
      status: "delivered",
      total: 1220000,
      items: 3,
    },
    {
      id: "DH002",
      date: "2024-01-28",
      status: "shipping",
      total: 850000,
      items: 2,
    },
    {
      id: "DH003",
      date: "2024-01-25",
      status: "confirmed",
      total: 450000,
      items: 1,
    },
  ];

  const favorites = [
    {
      id: "1",
      name: "Hoa Hồng Đỏ Ecuador",
      price: 450000,
      image: "/images/Hoa Hồng Đỏ Ecuador.jpg",
    },
    {
      id: "2",
      name: "Hoa Tulip Hà Lan",
      price: 320000,
      image: "/images/Hoa Tulip Hà Lan.jpg",
    },
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50">
      <SiteHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-rose-900 mb-2">
            Tài Khoản Của Tôi
          </h1>
          <p className="text-rose-700">Quản lý thông tin cá nhân và đơn hàng</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-rose-500 data-[state=active]:text-white"
            >
              <User className="w-4 h-4 mr-2" />
              Hồ sơ
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-rose-500 data-[state=active]:text-white"
            >
              <Package className="w-4 h-4 mr-2" />
              Đơn hàng
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="data-[state=active]:bg-rose-500 data-[state=active]:text-white"
            >
              <Heart className="w-4 h-4 mr-2" />
              Yêu thích
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-rose-500 data-[state=active]:text-white"
            >
              <Bell className="w-4 h-4 mr-2" />
              Cài đặt
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="border-rose-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-rose-900">
                    Thông tin cá nhân
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    className="border-rose-300 text-rose-700 hover:bg-rose-50 bg-transparent"
                  >
                    {isEditing ? "Hủy" : "Chỉnh sửa"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Họ</Label>
                    <Input
                      id="firstName"
                      defaultValue={user.firstName}
                      disabled={!isEditing}
                      className="border-rose-200 focus:border-rose-500 focus:ring-rose-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Tên</Label>
                    <Input
                      id="lastName"
                      defaultValue={user.lastName}
                      disabled={!isEditing}
                      className="border-rose-200 focus:border-rose-500 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user.email}
                    disabled={!isEditing}
                    className="border-rose-200 focus:border-rose-500 focus:ring-rose-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    defaultValue={user.phone}
                    disabled={!isEditing}
                    className="border-rose-200 focus:border-rose-500 focus:ring-rose-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Input
                    id="address"
                    defaultValue={user.address}
                    disabled={!isEditing}
                    className="border-rose-200 focus:border-rose-500 focus:ring-rose-500"
                  />
                </div>

                {isEditing && (
                  <div className="flex space-x-4">
                    <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white">
                      Lưu thay đổi
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="border-rose-300 text-rose-700 hover:bg-rose-50 bg-transparent"
                    >
                      Hủy
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="border-rose-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-rose-900">
                          Đơn hàng #{order.id}
                        </h3>
                        <p className="text-sm text-rose-600">
                          Ngày đặt: {order.date}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-rose-700">
                        <p>{order.items} sản phẩm</p>
                        <p className="font-medium text-lg text-rose-600">
                          {order.total.toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-rose-300 text-rose-700 hover:bg-rose-50 bg-transparent"
                        >
                          Xem chi tiết
                        </Button>
                        {order.status === "delivered" && (
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
                          >
                            Mua lại
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((item) => (
                <Card key={item.id} className="border-rose-100 overflow-hidden">
                  <div className="relative">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white text-rose-600"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-rose-900 mb-2">
                      {item.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-rose-600">
                        {item.price.toLocaleString("vi-VN")}đ
                      </span>
                      <Link href={`/products/${item.id}`}>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
                        >
                          Xem chi tiết
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <Card className="border-rose-100">
                <CardHeader>
                  <CardTitle className="text-rose-900">Thông báo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-rose-900">
                        Email thông báo đơn hàng
                      </p>
                      <p className="text-sm text-rose-600">
                        Nhận thông báo về trạng thái đơn hàng
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-rose-300 text-rose-500 focus:ring-rose-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-rose-900">
                        Email khuyến mãi
                      </p>
                      <p className="text-sm text-rose-600">
                        Nhận thông tin về ưu đãi và sản phẩm mới
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-rose-300 text-rose-500 focus:ring-rose-500"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-rose-100">
                <CardHeader>
                  <CardTitle className="text-rose-900">Bảo mật</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-rose-300 text-rose-700 hover:bg-rose-50 bg-transparent"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Đổi mật khẩu
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-rose-300 text-rose-700 hover:bg-rose-50 bg-transparent"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Quản lý địa chỉ
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
