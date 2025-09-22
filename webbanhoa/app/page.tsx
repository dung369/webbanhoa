import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star, Truck, Shield, Phone } from "lucide-react";
import dynamic from "next/dynamic";
import AnimatedHeader from "@/components/animated-header";
import CartButton from "@/components/cart-button";
import AnimatedWrapper from "@/components/animated-wrapper";
import AdvancedAnimation from "@/components/advanced-animation";
import InteractiveEffect from "@/components/interactive-effect";
import FloatingPetals from "@/components/floating-petals";
import ParticleBackground from "@/components/particle-background";
const AddToCart = dynamic(() => import("@/components/add-to-cart"), {
  ssr: false,
});
import SiteFooter from "@/components/site-footer";

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
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 relative overflow-hidden">
      {/* Multi-layer Background Effects */}
      <ParticleBackground />
      <FloatingPetals />

      {/* Animated Header */}
      <AnimatedHeader />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 relative z-10">
              <div className="space-y-4">
                <AdvancedAnimation animation="magicAppear" delay={0.2}>
                  <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200">
                    🌹 Hoa tươi nhập khẩu cao cấp
                  </Badge>
                </AdvancedAnimation>

                <AdvancedAnimation animation="spiralIn" delay={0.4}>
                  <h1 className="text-5xl lg:text-6xl font-bold text-rose-900 leading-tight">
                    <span className="block">Hoa Tươi</span>
                    <span className="block bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                      Đẹp Nhất
                    </span>
                    Cho Bạn
                  </h1>
                </AdvancedAnimation>

                <AdvancedAnimation animation="liquidWave" delay={0.6}>
                  <p className="text-xl text-rose-700 leading-relaxed">
                    Khám phá bộ sưu tập hoa tươi cao cấp từ Đà Lạt và nhập khẩu.
                    Giao hàng nhanh chóng, chất lượng đảm bảo.
                  </p>
                </AdvancedAnimation>
              </div>

              <AdvancedAnimation animation="elasticScale" delay={0.8}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <InteractiveEffect effect="sparkle">
                    <Link href="/products">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-4 text-lg transform hover:scale-105 transition-all duration-300 relative overflow-hidden w-full sm:w-auto"
                      >
                        <span className="relative z-10">Xem bộ sưu tập</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
                      </Button>
                    </Link>
                  </InteractiveEffect>
                </div>
              </AdvancedAnimation>

              <AdvancedAnimation animation="floatingBounce" delay={1.0}>
                <div className="flex items-center space-x-8 pt-4">
                  <InteractiveEffect effect="ripple">
                    <div className="flex items-center space-x-2 cursor-pointer">
                      <Truck className="w-6 h-6 text-rose-500" />
                      <span className="text-rose-700 font-medium">
                        Giao hàng miễn phí
                      </span>
                    </div>
                  </InteractiveEffect>
                  <InteractiveEffect effect="ripple">
                    <div className="flex items-center space-x-2 cursor-pointer">
                      <Shield className="w-6 h-6 text-rose-500" />
                      <span className="text-rose-700 font-medium">
                        Đảm bảo chất lượng
                      </span>
                    </div>
                  </InteractiveEffect>
                </div>
              </AdvancedAnimation>
            </div>

            <AdvancedAnimation animation="morphIn" delay={0.5}>
              <div className="relative">
                <div className="relative z-10">
                  <img
                    src="/images/ảnh cửa hàng hoa.jpg"
                    alt="Hoa tươi cao cấp"
                    className="w-full h-auto rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
                  />
                  {/* Magical glow effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 opacity-0 hover:opacity-20 transition-opacity duration-500"></div>
                </div>
                <div className="absolute -top-4 -right-4 w-full h-full bg-gradient-to-br from-rose-200 to-pink-200 rounded-3xl -z-10 animate-pulse"></div>

                {/* Floating elements around image */}
                <AdvancedAnimation
                  animation="glowPulse"
                  delay={2}
                  repeat={true}
                >
                  <div className="absolute top-4 right-4 text-2xl">🌸</div>
                </AdvancedAnimation>
                <AdvancedAnimation
                  animation="glowPulse"
                  delay={2.5}
                  repeat={true}
                >
                  <div className="absolute bottom-4 left-4 text-2xl">🌺</div>
                </AdvancedAnimation>
                <AdvancedAnimation
                  animation="glowPulse"
                  delay={3}
                  repeat={true}
                >
                  <div className="absolute top-1/2 -left-4 text-2xl">🌷</div>
                </AdvancedAnimation>
              </div>
            </AdvancedAnimation>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white/50 relative">
        {/* Section Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-rose-50/50 via-transparent to-pink-50/50"></div>

        <div className="container mx-auto px-4 relative z-10">
          <AdvancedAnimation animation="magicAppear" delay={0.2}>
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
          </AdvancedAnimation>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredFlowers.map((flower, index) => (
              <AdvancedAnimation
                key={flower.id}
                animation={
                  index % 4 === 0
                    ? "spiralIn"
                    : index % 4 === 1
                    ? "bounceIn"
                    : index % 4 === 2
                    ? "flipIn"
                    : "elasticScale"
                }
                delay={0.1 * index}
              >
                <InteractiveEffect
                  effect={
                    index % 4 === 0
                      ? "fireworks"
                      : index % 4 === 1
                      ? "confetti"
                      : index % 4 === 2
                      ? "sparkle"
                      : "explosion"
                  }
                >
                  <Card className="group hover:shadow-2xl transition-all duration-500 border-rose-100 overflow-hidden transform hover:-translate-y-4 hover:rotate-1 card-hover bg-gradient-to-br from-white via-rose-50/30 to-pink-50/30">
                    <div className="relative overflow-hidden">
                      <img
                        src={flower.image || "/placeholder.svg"}
                        alt={flower.name}
                        className="w-full h-64 object-cover group-hover:scale-125 transition-transform duration-700"
                      />

                      {/* Magical overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-rose-900/20 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      {/* Sparkle effects */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <AdvancedAnimation animation="glowPulse" repeat={true}>
                          <span className="text-yellow-400">✨</span>
                        </AdvancedAnimation>
                      </div>

                      <Badge className="absolute top-3 left-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                        {flower.badge}
                      </Badge>

                      <InteractiveEffect effect="ripple">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-3 right-3 bg-white/80 hover:bg-white text-rose-600 transform group-hover:scale-125 transition-all duration-300 backdrop-blur-sm"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                      </InteractiveEffect>
                    </div>

                    <CardContent className="p-6 relative">
                      {/* Background glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-rose-100/50 to-pink-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-lg"></div>

                      <div className="relative z-10">
                        <h3 className="font-bold text-lg text-rose-900 mb-2 group-hover:text-rose-600 transition-colors duration-300">
                          {flower.name}
                        </h3>

                        <div className="flex items-center space-x-2 mb-3">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }, (_, i) => (
                              <AdvancedAnimation
                                key={i}
                                animation="sparkleEntry"
                                delay={0.1 * i}
                              >
                                <Star
                                  className={`w-4 h-4 ${
                                    i < Math.floor(flower.rating)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  } transition-colors duration-300`}
                                />
                              </AdvancedAnimation>
                            ))}
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
                                {`${flower.price.toLocaleString("vi-VN")}đ`}
                              </span>
                              <span className="text-sm text-rose-400 line-through">
                                {flower.originalPrice.toLocaleString("vi-VN")}đ
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="transform group-hover:scale-105 transition-transform duration-300">
                          <InteractiveEffect effect="ripple">
                            <AddToCart
                              productId={String(flower.id)}
                              name={flower.name}
                              price={flower.price}
                              image={flower.image}
                            />
                          </InteractiveEffect>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </InteractiveEffect>
              </AdvancedAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Special Features Section */}
      <section className="py-20 bg-gradient-to-br from-rose-100 via-pink-100 to-purple-100 relative overflow-hidden">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0">
          <AdvancedAnimation animation="glowPulse" repeat={true}>
            <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-rose-300 to-pink-300 rounded-full opacity-20 animate-pulse"></div>
          </AdvancedAnimation>
          <AdvancedAnimation animation="glowPulse" delay={1} repeat={true}>
            <div className="absolute top-1/2 right-10 w-24 h-24 bg-gradient-to-br from-purple-300 to-blue-300 rounded-full opacity-20 animate-pulse"></div>
          </AdvancedAnimation>
          <AdvancedAnimation animation="glowPulse" delay={2} repeat={true}>
            <div className="absolute bottom-10 left-1/3 w-28 h-28 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full opacity-20 animate-pulse"></div>
          </AdvancedAnimation>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <AdvancedAnimation animation="spiralIn" delay={0.3}>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-rose-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Tại Sao Chọn Chúng Tôi?
              </h2>
            </div>
          </AdvancedAnimation>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🌸",
                title: "Chất Lượng Cao Cấp",
                desc: "Hoa tươi nhập khẩu trực tiếp từ các vườn hoa uy tín nhất thế giới",
                animation: "bounceIn",
              },
              {
                icon: "🚚",
                title: "Giao Hàng Nhanh Chóng",
                desc: "Giao hàng trong 2 giờ tại nội thành, đảm bảo hoa luôn tươi mới",
                animation: "flipIn",
              },
              {
                icon: "💝",
                title: "Dịch Vụ Tận Tâm",
                desc: "Đội ngũ tư vấn chuyên nghiệp, hỗ trợ 24/7 cho mọi nhu cầu",
                animation: "elasticScale",
              },
            ].map((feature, index) => (
              <AdvancedAnimation
                key={index}
                animation={feature.animation as any}
                delay={0.2 * index}
              >
                <InteractiveEffect effect="sparkle">
                  <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:rotate-1">
                    <AdvancedAnimation
                      animation="glowPulse"
                      delay={1 + index * 0.5}
                      repeat={true}
                    >
                      <div className="text-6xl mb-6 inline-block">
                        {feature.icon}
                      </div>
                    </AdvancedAnimation>

                    <h3 className="text-2xl font-bold text-rose-900 mb-4">
                      {feature.title}
                    </h3>

                    <p className="text-rose-700 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </InteractiveEffect>
              </AdvancedAnimation>
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
