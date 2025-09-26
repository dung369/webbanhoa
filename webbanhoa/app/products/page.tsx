"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Heart as HeartIcon,
  ShoppingCart,
  Star,
  Search,
  Filter,
} from "lucide-react";
import { useFavorites } from "@/components/favorites-provider";
import CartButton from "@/components/cart-button";
import AnimatedHeader from "@/components/animated-header";
import PageTransition from "@/components/page-transition";
import AdvancedAnimation from "@/components/advanced-animation";
import InteractiveEffect from "@/components/interactive-effect";
import ParticleBackground from "@/components/particle-background";
import SiteFooter from "@/components/site-footer";
import { firestore } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { mockProducts } from "@/lib/mock-data";
import { addToCart } from "@/lib/cart";

function normalizeProduct(p: any) {
  return {
    id: p.id || p._id || p.productId || String(p.name || p.title || ""),
    name: p.name || p.title || p.productName || "",
    description: p.description || p.desc || "",
    price: Number(p.price || p.amount || 0),
    originalPrice: p.originalPrice || p.listPrice || null,
    category: p.category || "all",
    origin: p.origin || p.store || "",
    images: Array.isArray(p.images)
      ? p.images
      : p.image
      ? [p.image]
      : p.images && typeof p.images === "string"
      ? [p.images]
      : [],
    inStock: Number(p.inStock || p.stock || 0),
    rating: Number(p.rating || 4.5),
    reviews: Number(p.reviews || 0),
    featured: Boolean(p.featured),
    createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
  };
}

export default function ProductsPage() {
  const router = useRouter();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadProducts = () => {
      try {
        const q = query(collection(firestore, "products"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const firestoreProducts = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          
          const allProducts = [...firestoreProducts, ...mockProducts].map(normalizeProduct);
          setProducts(allProducts);
          setIsLoading(false);
        });
        return unsubscribe;
      } catch (error) {
        console.error("Error loading products:", error);
        setProducts(mockProducts.map(normalizeProduct));
        setIsLoading(false);
      }
    };

    const unsubscribe = loadProducts();
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProducts = filteredProducts.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50">
          <AnimatedHeader />
          <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <AdvancedAnimation key={i} animation="fadeIn" delay={i * 0.1}>
                  <div className="bg-white rounded-lg p-4 animate-pulse">
                    <div className="h-64 bg-rose-200 rounded mb-4"></div>
                    <div className="h-4 bg-rose-200 rounded mb-2"></div>
                    <div className="h-3 bg-rose-200 rounded w-3/4"></div>
                  </div>
                </AdvancedAnimation>
              ))}
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 relative overflow-hidden">
        <ParticleBackground />
        <AnimatedHeader />

        <div className="container mx-auto px-4 py-8 relative z-10">
          <AdvancedAnimation animation="magicAppear" delay={0.2}>
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                Bộ Sưu Tập Hoa Tươi
              </h1>
              <p className="text-xl text-rose-700">
                Khám phá hàng trăm loại hoa tươi cao cấp từ khắp nơi trên thế giới
              </p>
            </div>
          </AdvancedAnimation>

          <AdvancedAnimation animation="slideUp" delay={0.4}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-3 md:space-y-0 bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-rose-100">
              <div className="flex items-center space-x-3 w-full md:w-1/2">
                <InteractiveEffect effect="ripple">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-rose-500" />
                    <Input
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-rose-200 focus:border-rose-400 focus:ring-rose-400"
                    />
                  </div>
                </InteractiveEffect>
              </div>
              
              <InteractiveEffect effect="sparkle">
                <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  Bộ lọc
                </Button>
              </InteractiveEffect>
            </div>
          </AdvancedAnimation>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sortedProducts.map((product, index) => (
              <AdvancedAnimation
                key={product.id}
                animation={
                  index % 6 === 0 ? "slideUp" :
                  index % 6 === 1 ? "bounceIn" :
                  index % 6 === 2 ? "flipIn" :
                  index % 6 === 3 ? "elasticScale" :
                  index % 6 === 4 ? "morphIn" :
                  "liquidWave"
                }
                delay={0.1 * (index % 12)}
              >
                <InteractiveEffect 
                  effect={
                    index % 5 === 0 ? "fireworks" :
                    index % 5 === 1 ? "confetti" :
                    index % 5 === 2 ? "sparkle" :
                    index % 5 === 3 ? "explosion" :
                    "ripple"
                  }
                >
                  <Card className="group hover:shadow-2xl transition-all duration-500 border-rose-100 overflow-hidden transform hover:-translate-y-3 bg-gradient-to-br from-white via-rose-50/30 to-pink-50/30 card-hover">
                    <div className="relative overflow-hidden">
                      <img
                        src={product.images?.[0] || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-125 transition-transform duration-700"
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-rose-900/20 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <AdvancedAnimation animation="glowPulse" repeat={true}>
                          <span className="text-yellow-400">✨</span>
                        </AdvancedAnimation>
                      </div>
                      
                      {product.featured && (
                        <Badge className="absolute top-3 left-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white transform group-hover:scale-105 transition-all duration-300">
                          Nổi bật
                        </Badge>
                      )}
                      
                      <InteractiveEffect effect="ripple">
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`absolute top-3 right-3 bg-white/80 backdrop-blur-sm hover:bg-white transform group-hover:scale-125 transition-all duration-300 ${
                            isFavorite(product.id) ? "text-rose-600" : "text-rose-400"
                          }`}
                          onClick={() =>
                            toggleFavorite({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              images: product.images || []
                            })
                          }
                        >
                          <HeartIcon className="w-4 h-4" />
                        </Button>
                      </InteractiveEffect>
                    </div>

                    <CardContent className="p-6 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-rose-100/50 to-pink-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-lg"></div>
                      
                      <div className="relative z-10">
                        <h3 className="font-bold text-lg text-rose-900 mb-2 group-hover:text-rose-600 transition-colors duration-300">
                          {product.name}
                        </h3>

                        <div className="flex items-start justify-between gap-3 mb-3">
                          <p className={`text-sm text-rose-600 ${expandedId === product.id ? "" : "line-clamp-2"}`}>
                            {product.description}
                          </p>
                          <InteractiveEffect effect="ripple">
                            <button
                              type="button"
                              onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
                              className="text-rose-400 hover:text-rose-600 ml-2 transform hover:scale-125 transition-all duration-300"
                            >
                              ⋯
                            </button>
                          </InteractiveEffect>
                        </div>

                        <div className="flex items-center space-x-2 mb-3">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }, (_, i) => (
                              <AdvancedAnimation key={i} animation="sparkleEntry" delay={0.05 * i}>
                                <Star className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                              </AdvancedAnimation>
                            ))}
                            <span className="text-sm font-medium text-rose-700 ml-1">
                              {product.rating}
                            </span>
                          </div>
                          <span className="text-sm text-rose-500">
                            ({product.reviews} đánh giá)
                          </span>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl font-bold text-rose-600">
                                {`${Number(product.price || 0).toLocaleString("vi-VN")}đ`}
                              </span>
                              {product.originalPrice && (
                                <span className="text-sm text-rose-400 line-through">
                                  {Number(product.originalPrice).toLocaleString("vi-VN")}đ
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-rose-500">
                              Còn {product.inStock ?? 0} sản phẩm
                            </p>
                          </div>
                        </div>

                        <InteractiveEffect effect="ripple">
                          <Button
                            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white transform hover:scale-105 transition-all duration-300"
                            onClick={() => {
                              addToCart({
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                image: product.images?.[0] || "",
                                quantity: 1,
                              });
                              router.push("/cart");
                            }}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Thêm vào giỏ
                          </Button>
                        </InteractiveEffect>
                      </div>
                    </CardContent>
                  </Card>
                </InteractiveEffect>
              </AdvancedAnimation>
            ))}
          </div>

          {sortedProducts.length === 0 && (
            <AdvancedAnimation animation="fadeIn" delay={0.5}>
              <div className="text-center py-16">
                <InteractiveEffect effect="ripple">
                  <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 transform hover:scale-110 transition-transform duration-300">
                    <Search className="w-12 h-12 text-rose-400" />
                  </div>
                </InteractiveEffect>
                <h3 className="text-xl font-semibold text-rose-900 mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-rose-600">
                  Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
                </p>
              </div>
            </AdvancedAnimation>
          )}
        </div>
        {/* Footer */}
        {/* @ts-ignore */}
        <SiteFooter />
      </div>
    </PageTransition>
  );
}