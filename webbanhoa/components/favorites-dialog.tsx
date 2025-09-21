"use client"

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { useFavorites } from './favorites-provider'
import Link from 'next/link'

export default function FavoritesDialog() {
  const { favorites, toggleFavorite } = useFavorites()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-rose-700 hover:text-rose-500">
          <Heart className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yêu thích của bạn</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {favorites.length === 0 ? (
            <div className="text-center text-rose-600">Chưa có sản phẩm yêu thích</div>
          ) : (
            favorites.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={p.image || '/placeholder.svg'} alt={p.name} className="w-12 h-12 object-cover rounded" />
                  <div>
                    <div className="font-medium text-rose-900">{p.name}</div>
                    <div className="text-sm text-rose-600">{Number(p.price || 0).toLocaleString('vi-VN')}đ</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/products/${p.id}`}>
                    <Button variant="outline" size="sm">Xem</Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => toggleFavorite(p)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))
          )}
        </div>
        <DialogFooter>
          <Link href="/favorites"><Button>Quản lý đầy đủ</Button></Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
