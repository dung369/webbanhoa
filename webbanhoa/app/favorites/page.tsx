"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star, Trash2, ArrowLeft } from "lucide-react";
import CartButton from "@/components/cart-button";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { firestore } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import devAuth, {
  onAuthStateChanged as devOnAuthStateChanged,
} from "@/lib/devAuth";

export default function FavoritesPage() {
  // Favorites state - fetch from Firestore for authenticated users
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let unsub = () => {};
    const fetchFavorites = async () => {
      const user = devAuth.currentUser();
      if (!user) return;
      setLoading(true);
      try {
        if (!firestore) {
          setFavorites([]);
          return;
        }
        const ref = doc(firestore, "favorites", String(user.uid));
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          const ids = data.productIds || [];
          if (ids.length) {
            // batch fetch up to 10 product docs
            const slice = ids.slice(0, 10);
            const q = query(
              collection(firestore, "products"),
              where("__name__", "in", slice)
            );
            const prodSnap = await getDocs(q);
            const prods = prodSnap.docs.map((d: any) => ({
              id: d.id,
              ...(d.data() || {}),
            }));
            setFavorites(prods);
          } else {
            setFavorites([]);
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to load favorites", e);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    // try fetch on mount and when auth state changes (only if auth exists)
    fetchFavorites();
    // prefer devAuth/onAuthStateChanged which wraps firebase or dev fallback
    if (typeof devOnAuthStateChanged === "function") {
      unsub = devOnAuthStateChanged(() => {
        fetchFavorites();
      });
    }

    return () => unsub();
  }, []);

  const removeFavorite = (productId: string) => {
    setFavorites(favorites.filter((product) => product.id !== productId));
  };

  const addToCart = (productId: string) => {
    // Mock add to cart functionality
    console.log(`Added product ${productId} to cart`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50">
      <SiteHeader />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <Link
          href="/"
          className="inline-flex items-center text-rose-600 hover:text-rose-500 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Về trang chủ
        </Link>

        {/* Page Header */}
        <div className="text-center mb-12">
          <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 mb-4">
            Yêu thích
          </Badge>
          <h1 className="text-4xl font-bold text-rose-900 mb-4">
            Sản Phẩm Yêu Thích
          </h1>
          <p className="text-xl text-rose-700 max-w-2xl mx-auto">
            Những bông hoa đẹp nhất mà bạn đã lưu lại để mua sau
          </p>
        </div>

        {/* Favorites Content */}
        {loading ? (
          <div className="text-center py-16">Đang tải...</div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-24 h-24 text-rose-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-rose-900 mb-4">
              Chưa có sản phẩm yêu thích
            </h2>
            <p className="text-rose-700 mb-8 max-w-md mx-auto">
              Hãy khám phá các sản phẩm hoa tươi của chúng tôi và thêm những
              bông hoa yêu thích vào danh sách này
            </p>
            <Link href="/products">
              <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white">
                Khám phá sản phẩm
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg border border-rose-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-rose-900">
                    Tổng cộng: {favorites.length} sản phẩm
                  </h3>
                  <p className="text-rose-600">
                    Tổng giá trị:{" "}
                    {favorites
                      .reduce((sum, product) => sum + product.price, 0)
                      .toLocaleString("vi-VN")}
                    đ
                  </p>
                </div>
                <Button
                  onClick={() =>
                    favorites.forEach((product) => addToCart(product.id))
                  }
                  className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
                >
                  Thêm tất cả vào giỏ
                </Button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((product) => (
                <Card
                  key={product.id}
                  className="group hover:shadow-xl transition-all duration-300 border-rose-100"
                >
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFavorite(product.id)}
                          className="bg-white/90 hover:bg-white text-rose-500 hover:text-rose-600 rounded-full p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {product.originalPrice && (
                        <Badge className="absolute top-3 left-3 bg-rose-500 text-white">
                          -
                          {Math.round(
                            ((product.originalPrice - product.price) /
                              product.originalPrice) *
                              100
                          )}
                          %
                        </Badge>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge
                          variant="outline"
                          className="text-rose-600 border-rose-200"
                        >
                          {product.category}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600">
                            {product.rating}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-semibold text-rose-900 mb-2 line-clamp-2">
                        {product.name}
                      </h3>

                      <p className="text-sm text-rose-700 mb-3 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-lg font-bold text-rose-900">
                            {product.price.toLocaleString("vi-VN")}đ
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through ml-2">
                              {product.originalPrice.toLocaleString("vi-VN")}đ
                            </span>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-200"
                        >
                          Còn {product.inStock}
                        </Badge>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          onClick={() => addToCart(product.id)}
                          className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Thêm vào giỏ
                        </Button>
                        <Link href={`/products/${product.id}`}>
                          <Button
                            variant="outline"
                            className="border-rose-300 text-rose-700 hover:bg-rose-50 bg-transparent"
                          >
                            Xem
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="text-center mt-12">
              <Link href="/products">
                <Button
                  variant="outline"
                  className="border-rose-300 text-rose-700 hover:bg-rose-50 bg-transparent"
                >
                  Tiếp tục mua sắm
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-rose-900 text-white py-16 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <h3 className="text-xl font-bold">Hoa Tươi Việt</h3>
              </div>
              <p className="text-rose-200">
                Chuyên cung cấp hoa tươi cao cấp, nhập khẩu và trong nước. Cam
                kết chất lượng và dịch vụ tốt nhất.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Sản phẩm</h4>
              <ul className="space-y-2 text-rose-200">
                <li>
                  <Link href="/products/roses" className="hover:text-white">
                    Hoa hồng
                  </Link>
                </li>
                <li>
                  <Link href="/products/tulips" className="hover:text-white">
                    Hoa tulip
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products/carnations"
                    className="hover:text-white"
                  >
                    Hoa cẩm chướng
                  </Link>
                </li>
                <li>
                  <Link href="/products/lilies" className="hover:text-white">
                    Hoa ly
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Hỗ trợ</h4>
              <ul className="space-y-2 text-rose-200">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Trung tâm trợ giúp
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-white">
                    Chính sách giao hàng
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="hover:text-white">
                    Đổi trả
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Liên hệ
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Liên hệ</h4>
              <div className="space-y-2 text-rose-200">
                <p>📞 0123 456 789</p>
                <p>📍 123 Đường Hoa, Quận 1, TP.HCM</p>
                <p>✉️ contact@hoatuoiviet.com</p>
              </div>
            </div>
          </div>

          <div className="border-t border-rose-800 mt-12 pt-8 text-center text-rose-200">
            <p>&copy; 2024 Hoa Tươi Việt. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
      {/* Footer (centralized) */}
      {/* @ts-ignore */}
      <SiteFooter />
    </div>
  );
}
