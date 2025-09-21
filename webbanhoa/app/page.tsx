import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star, Truck, Shield, Phone } from "lucide-react";
import dynamic from 'next/dynamic'
import HeaderAuth from '@/components/header-auth'
import CartButton from '@/components/cart-button'
const AddToCart = dynamic(() => import('@/components/add-to-cart'), { ssr: false })
import SiteFooter from '@/components/site-footer'

export default function HomePage() {
  const featuredFlowers = [
    {
      id: 1,
      name: "Hoa Hồng Đỏ Ecuador",
      price: 450000,
      originalPrice: 500000,
      image: "/images/Hoa Hồng Đỏ Ecuador.jpg",
      rating: 4.9,
      reviews: 127,
      badge: "Bán chạy",
    },
    {
      id: 2,
      name: "Hoa Tulip Hà Lan",
      price: 320000,
      originalPrice: 380000,
      image: "/images/Hoa Tulip Hà Lan.jpg",
      rating: 4.8,
      reviews: 89,
      badge: "Nhập khẩu",
    },
    {
      id: 3,
      name: "Hoa Cẩm Chướng Đà Lạt",
      price: 180000,
      originalPrice: 220000,
      image: "/images/Hoa Cẩm Chướng Đà Lạt.jpg",
      rating: 4.7,
      reviews: 156,
      badge: "Đà Lạt",
    },
    {
      id: 4,
      name: "Hoa Ly Trắng",
      price: 280000,
      originalPrice: 320000,
      image: "/images/Hoa Ly Trắng.jpg",
      rating: 4.9,
      reviews: 203,
      badge: "Cao cấp",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-rose-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  Hoa Tươi Việt
                </h1>
                <p className="text-xs text-rose-500">Hoa tươi cao cấp</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className="text-rose-700 hover:text-rose-500 font-medium"
              >
                Trang chủ
              </Link>
              <Link
                href="/products"
                className="text-rose-700 hover:text-rose-500 font-medium"
              >
                Sản phẩm
              </Link>
              <Link
                href="/about"
                className="text-rose-700 hover:text-rose-500 font-medium"
              >
                Về chúng tôi
              </Link>
              <Link
                href="/contact"
                className="text-rose-700 hover:text-rose-500 font-medium"
              >
                Liên hệ
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-rose-700 hover:text-rose-500"
              >
                <Heart className="w-5 h-5" />
              </Button>
              {/* cart button with dynamic count */}
              <div>
                {/* @ts-ignore */}
                {/* client component */}
                <CartButton />
              </div>
              {/* show user name when signed in */}
              <HeaderAuth />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200">
                  🌹 Hoa tươi nhập khẩu cao cấp
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-rose-900 leading-tight">
                  Hoa Tươi
                  <span className="block bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                    Đẹp Nhất
                  </span>
                  Cho Bạn
                </h1>
                <p className="text-xl text-rose-700 leading-relaxed">
                  Khám phá bộ sưu tập hoa tươi cao cấp từ Đà Lạt và nhập khẩu.
                  Giao hàng nhanh chóng, chất lượng đảm bảo.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-4 text-lg"
                >
                  Mua ngay
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-rose-300 text-rose-700 hover:bg-rose-50 px-8 py-4 text-lg bg-transparent"
                >
                  Xem bộ sưu tập
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="flex items-center space-x-2">
                  <Truck className="w-6 h-6 text-rose-500" />
                  <span className="text-rose-700 font-medium">
                    Giao hàng miễn phí
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-6 h-6 text-rose-500" />
                  <span className="text-rose-700 font-medium">
                    Đảm bảo chất lượng
                  </span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <img
                  src="/images/ảnh cửa hàng hoa.jpg"
                  alt="Hoa tươi cao cấp"
                  className="w-full h-auto rounded-3xl shadow-2xl"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-full h-full bg-gradient-to-br from-rose-200 to-pink-200 rounded-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 mb-4">
              Sản phẩm nổi bật
            </Badge>
            <h2 className="text-4xl font-bold text-rose-900 mb-4">
              Hoa Tươi Bán Chạy Nhất
            </h2>
            <p className="text-xl text-rose-700 max-w-2xl mx-auto">
              Những bông hoa được yêu thích nhất, được chọn lọc kỹ càng từ các
              vườn hoa uy tín
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredFlowers.map((flower) => (
              <Card
                key={flower.id}
                className="group hover:shadow-xl transition-all duration-300 border-rose-100 overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={flower.image || "/placeholder.svg"}
                    alt={flower.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 left-3 bg-rose-500 text-white">
                    {flower.badge}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-3 right-3 bg-white/80 hover:bg-white text-rose-600"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>

                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-rose-900 mb-2 group-hover:text-rose-600 transition-colors">
                    {flower.name}
                  </h3>

                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-rose-700 ml-1">
                        {flower.rating}
                      </span>
                    </div>
                    <span className="text-sm text-rose-500">
                      ({flower.reviews} đánh giá)
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-rose-600">
                          {flower.price.toLocaleString("vi-VN")}đ
                        </span>
                        <span className="text-sm text-rose-400 line-through">
                          {flower.originalPrice.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </div>
                  </div>

                  <AddToCart productId={String(flower.id)} name={flower.name} price={flower.price} image={flower.image} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer (centralized) */}
      {/* @ts-ignore */}
      <SiteFooter />
    </div>
  );
}
