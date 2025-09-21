"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Heart as HeartIcon, ShoppingCart, Star, Plus, Minus, Truck, Shield, RotateCcw } from "lucide-react"
import { useFavorites } from '@/components/favorites-provider'
import CartButton from '@/components/cart-button'
import SiteHeader from '@/components/site-header'
import { firestore } from '@/lib/firebase'
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore'
import { addToCart } from '@/lib/cart'

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  const [product, setProduct] = useState<any | null>(null)
  const { toggleFavorite, isFavorite } = useFavorites()
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])

  useEffect(() => {
    let unsub: any = null
    const load = async () => {
      try {
        if (firestore) {
          const ref = doc(firestore, 'products', params.id)
          unsub = onSnapshot(ref, async (snap: any) => {
            if (!snap.exists()) {
              setProduct(null)
              setRelatedProducts([])
              return
            }
            const data = { id: snap.id, ...(snap.data() || {}) }
            setProduct(data)

            // load related products by category if available
            if (data.category) {
              try {
                const q = query(collection(firestore, 'products'), where('category', '==', data.category))
                const docs = await getDocs(q)
                const related: any[] = []
                docs.forEach((d) => {
                  if (d.id !== data.id) related.push({ id: d.id, ...(d.data() || {}) })
                })
                setRelatedProducts(related.slice(0, 6))
              } catch (e) {
                setRelatedProducts([])
              }
            } else {
              setRelatedProducts([])
            }
          })
        }
      } catch (e) {
        console.error('Failed to load product', e)
      }
    }

    load()

    return () => {
      if (unsub) unsub()
    }
  }, [params.id])

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50">
        <SiteHeader />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-rose-900">Sản phẩm không tồn tại</h2>
          <p className="text-rose-600">Sản phẩm có thể đã bị xóa hoặc không tồn tại.</p>
          <div className="mt-6">
            <Link href="/products">
              <Button className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">Quay lại danh sách</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    addToCart({ id: product.id, name: product.name, price: product.price, quantity, image: product.images?.[0] })
    router.push('/cart')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50">
      <SiteHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden border border-rose-100">
              <img
                src={product.images?.[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(product.images || []).slice(0, 4).map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? "border-rose-500" : "border-rose-100"
                  }`}>
                  <img src={image || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge className="bg-rose-100 text-rose-700 mb-3">{product.origin}</Badge>
              <h1 className="text-4xl font-bold text-rose-900 mb-4">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-rose-700 ml-1">{product.rating}</span>
                </div>
                <span className="text-rose-600">({product.reviews} đánh giá)</span>
                <span className="text-rose-500">•</span>
                <span className="text-rose-600">Còn {product.inStock} sản phẩm</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-rose-600">{product.price.toLocaleString("vi-VN")}đ</span>
                {product.originalPrice && (
                  <span className="text-xl text-rose-400 line-through">
                    {product.originalPrice.toLocaleString("vi-VN")}đ
                  </span>
                )}
              </div>
              {product.originalPrice && (
                <p className="text-green-600 font-medium">
                  Tiết kiệm {(((product.originalPrice - product.price) / product.originalPrice) * 100).toFixed(0)}%
                </p>
              )}
            </div>

            <p className="text-rose-700 text-lg leading-relaxed">{product.description}</p>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-rose-900">Số lượng:</span>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="border-rose-300 text-rose-700 hover:bg-rose-50"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-medium text-rose-900">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.inStock, quantity + 1))}
                    className="border-rose-300 text-rose-700 hover:bg-rose-50"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button onClick={handleAddToCart} className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Thêm vào giỏ hàng
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`border-rose-300 ${isFavorite(product.id) ? 'text-rose-600' : 'text-rose-700'} hover:bg-rose-50 bg-transparent`}
                  onClick={() => toggleFavorite({ id: product.id, name: product.name, price: product.price, image: product.images?.[0] })}
                >
                  <HeartIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-rose-100">
              <div className="text-center">
                <Truck className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-rose-900">Giao hàng nhanh</p>
                <p className="text-xs text-rose-600">Trong 2-4 giờ</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-rose-900">Đảm bảo chất lượng</p>
                <p className="text-xs text-rose-600">Hoa tươi 100%</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-rose-900">Đổi trả dễ dàng</p>
                <p className="text-xs text-rose-600">Trong 24 giờ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card className="border-rose-100 mb-16">
          <CardContent className="p-0">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b border-rose-100 bg-transparent p-0">
                <TabsTrigger
                  value="description"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-rose-500 data-[state=active]:bg-transparent"
                >
                  Mô tả sản phẩm
                </TabsTrigger>
                <TabsTrigger
                  value="care"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-rose-500 data-[state=active]:bg-transparent"
                >
                  Hướng dẫn chăm sóc
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-rose-500 data-[state=active]:bg-transparent"
                >
                  Đánh giá ({product.reviews})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="p-6">
                <div className="prose prose-rose max-w-none">
                  <p className="text-rose-700 leading-relaxed">
                    {product.description} Được trồng và chăm sóc tỉ mỉ trong điều kiện khí hậu lý tưởng, mỗi bông hoa
                    đều mang trong mình vẻ đẹp tự nhiên và hương thơm quyến rũ.
                  </p>
                  <h4 className="text-rose-900 font-semibold mt-6 mb-3">Đặc điểm nổi bật:</h4>
                  <ul className="text-rose-700 space-y-2">
                    <li>• Hoa tươi 100%, được cắt trong ngày</li>
                    <li>• Màu sắc tự nhiên, không sử dụng hóa chất</li>
                    <li>• Thân dài, lá xanh tươi mới</li>
                    <li>• Đóng gói cẩn thận, bảo quản trong điều kiện lạnh</li>
                    <li>• Phù hợp làm quà tặng hoặc trang trí</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="care" className="p-6">
                <div className="prose prose-rose max-w-none">
                  <h4 className="text-rose-900 font-semibold mb-3">Hướng dẫn chăm sóc hoa tươi:</h4>
                  <div className="space-y-4 text-rose-700">
                    <div>
                      <h5 className="font-medium text-rose-900 mb-2">1. Chuẩn bị bình hoa:</h5>
                      <p>Rửa sạch bình hoa bằng nước và xà phòng, sau đó rửa lại bằng nước sạch.</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-rose-900 mb-2">2. Cắt thân hoa:</h5>
                      <p>Cắt thân hoa xiên góc 45 độ dưới vòi nước chảy, loại bỏ lá dưới mực nước.</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-rose-900 mb-2">3. Thay nước thường xuyên:</h5>
                      <p>Thay nước mỗi 2-3 ngày, cắt lại thân hoa mỗi lần thay nước.</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-rose-900 mb-2">4. Vị trí đặt hoa:</h5>
                      <p>Đặt ở nơi thoáng mát, tránh ánh nắng trực tiếp và gió lạnh.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-rose-600">{product.rating}</div>
                      <div className="flex items-center justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-rose-300"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-rose-600">{product.reviews} đánh giá</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        name: "Nguyễn Thị Mai",
                        rating: 5,
                        comment: "Hoa rất đẹp và tươi, giao hàng nhanh chóng. Sẽ mua lại!",
                        date: "2024-01-28",
                      },
                      {
                        name: "Trần Văn Nam",
                        rating: 5,
                        comment: "Chất lượng hoa tuyệt vời, đóng gói cẩn thận. Rất hài lòng!",
                        date: "2024-01-25",
                      },
                      {
                        name: "Lê Thị Hoa",
                        rating: 4,
                        comment: "Hoa đẹp, giá hợp lý. Dịch vụ khách hàng tốt.",
                        date: "2024-01-22",
                      },
                    ].map((review, index) => (
                      <div key={index} className="border-b border-rose-100 pb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-rose-900">{review.name}</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-rose-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-rose-500">{review.date}</span>
                        </div>
                        <p className="text-rose-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-rose-900 mb-8 text-center">Sản phẩm liên quan</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedProducts.map((relatedProduct) => (
                <Card
                  key={relatedProduct.id}
                  className="group hover:shadow-xl transition-all duration-300 border-rose-100 overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={relatedProduct.images?.[0] || "/placeholder.svg"}
                      alt={relatedProduct.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3 bg-rose-500 text-white">{relatedProduct.origin}</Badge>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg text-rose-900 mb-2 group-hover:text-rose-600 transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-rose-600">
                        {relatedProduct.price.toLocaleString("vi-VN")}đ
                      </span>
                      <Link href={`/products/${relatedProduct.id}`}>
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
          </div>
        )}
      </div>
    </div>
  )
}
