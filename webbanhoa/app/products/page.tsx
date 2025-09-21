"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Heart as HeartIcon, ShoppingCart, Star, Search, Filter } from "lucide-react"
import { useFavorites } from '@/components/favorites-provider'
import CartButton from '@/components/cart-button'
import SiteHeader from '@/components/site-header'
import { firestore } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { mockProducts } from '@/lib/mock-data'
import { addToCart } from '@/lib/cart'

function normalizeProduct(p: any) {
  // Accept different shapes from Firestore, local API, or mock data
  return {
    id: p.id || p._id || p.productId || String(p.name || p.title || '')
    , name: p.name || p.title || p.productName || ''
    , description: p.description || p.desc || ''
    , price: Number(p.price || p.amount || 0)
    , originalPrice: p.originalPrice || p.listPrice || null
    , category: p.category || 'all'
    , origin: p.origin || p.store || ''
    , images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : (p.images && typeof p.images === 'string' ? [p.images] : []))
    , inStock: Number(p.inStock || p.stock || 0)
    , rating: Number(p.rating || 4.5)
    , reviews: Number(p.reviews || 0)
    , featured: Boolean(p.featured)
    , createdAt: p.createdAt ? new Date(p.createdAt) : new Date()
  }
}

export default function ProductsPage() {
  const router = useRouter()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  const [products, setProducts] = useState<any[]>([])
  const { toggleFavorite, isFavorite } = useFavorites()

  useEffect(() => {
    let unsub: any = null
    try {
      if (firestore) {
        const q = query(collection(firestore, 'products'), orderBy('createdAt', 'desc'))
        unsub = onSnapshot(q, (snap: any) => {
          const items = snap.docs.map((d: any) => ({ id: d.id, ...(d.data() || {}) }))
          // if Firestore has no items yet, fall back to mock data for public listing
          const raw = items.length ? items : mockProducts
          setProducts(raw.map(normalizeProduct))
        })
      } else {
        // try local products (server-side) then fall back to images directory then mock data
        const fetchLocal = async () => {
          try {
            const tryLocal = await fetch('/api/local-products').then((r) => r.json()).catch(() => null)
            if (Array.isArray(tryLocal) && tryLocal.length) {
              setProducts(tryLocal.map(normalizeProduct))
              return
            }

            const tryImages = await fetch('/api/images-products').then((r) => r.json()).catch(() => null)
            if (Array.isArray(tryImages) && tryImages.length) {
              setProducts(tryImages.map(normalizeProduct))
              return
            }

            setProducts(mockProducts.map(normalizeProduct))
          } catch (e) {
            setProducts(mockProducts.map(normalizeProduct))
          }
        }

        fetchLocal()

        // listen for localStorage events triggered by admin actions (local fallback)
        const onStorage = (ev: StorageEvent) => {
          if (ev.key === 'wb_products_update') {
            fetchLocal()
          }
        }
        if (typeof window !== 'undefined') window.addEventListener('storage', onStorage)
      }
    } catch (e) {
      setProducts(mockProducts)
    }
    return () => { if (unsub) unsub(); if (typeof window !== 'undefined') window.removeEventListener('storage', () => {}) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchesSearch = String(product?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "rating":
        return b.rating - a.rating
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default:
        return b.featured ? 1 : -1
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50">
      <SiteHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-3 md:space-y-0">
          <div className="flex items-center space-x-3 w-full md:w-1/2">
            <Input placeholder="Tìm kiếm sản phẩm..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          {/* Removed category and sort selects per request */}
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {sortedProducts.map((product) => (
            <Card
              key={product.id}
              className="group hover:shadow-xl transition-all duration-300 border-rose-100 overflow-hidden"
            >
              <div className="relative">
                <img
                  src={product.images?.[0] || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.featured && <Badge className="absolute top-3 left-3 bg-rose-500 text-white">Nổi bật</Badge>}
                <Button
                  size="sm"
                  variant="ghost"
                  className={`absolute top-3 right-3 bg-white/80 hover:bg-white ${isFavorite(product.id) ? 'text-rose-600' : 'text-rose-400'}`}
                  onClick={() => toggleFavorite({ id: product.id, name: product.name, price: product.price, image: product.images?.[0] })}
                >
                  <HeartIcon className="w-4 h-4" />
                </Button>
                <Badge className="absolute bottom-3 left-3 bg-white/90 text-rose-700">{product.origin}</Badge>
              </div>

              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-rose-900 mb-2 group-hover:text-rose-600 transition-colors">
                  {product.name}
                </h3>

                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className={`text-sm text-rose-600 ${expandedId === product.id ? '' : 'line-clamp-2'}`}>{product.description}</p>
                  <button type="button" aria-label="Xem thêm" onClick={() => setExpandedId(expandedId === product.id ? null : product.id)} className="text-rose-400 hover:text-rose-600 ml-2">⋯</button>
                </div>

                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-rose-700 ml-1">{product.rating}</span>
                  </div>
                  <span className="text-sm text-rose-500">({product.reviews} đánh giá)</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-rose-600">{Number(product.price || 0).toLocaleString("vi-VN")}đ</span>
                      {product.originalPrice && (
                        <span className="text-sm text-rose-400 line-through">
                          {Number(product.originalPrice).toLocaleString("vi-VN")}đ
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-rose-500">Còn {product.inStock ?? 0} sản phẩm</p>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
                  onClick={() => {
                    try {
                      addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: product.images?.[0] || '',
                          quantity: 1,
                        })
                    } catch (err) {
                      console.error('addToCart error', err)
                    }
                    router.push('/cart')
                  }}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Thêm vào giỏ
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {sortedProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-rose-400" />
            </div>
            <h3 className="text-xl font-semibold text-rose-900 mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-rose-600">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
          </div>
        )}
      </div>
    </div>
  )
}
