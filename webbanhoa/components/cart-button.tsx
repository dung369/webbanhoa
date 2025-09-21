"use client"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { readCart } from '@/lib/cart'
import { useRouter } from 'next/navigation'

export default function CartButton() {
  const [count, setCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    function update() {
      try {
        const items = readCart()
        const total = items.reduce((s, i) => s + (i.quantity || 0), 0)
        setCount(total)
      } catch (e) {
        setCount(0)
      }
    }

    update()

    // listen for storage events so multiple tabs update badge
    function onStorage(e: StorageEvent) {
      if (e.key === 'wb_cart_v1') update()
    }
    window.addEventListener('storage', onStorage)

    // also poll every 1s as a fallback for client-side writes that don't trigger storage
    const t = setInterval(update, 1000)

    return () => {
      window.removeEventListener('storage', onStorage)
      clearInterval(t)
    }
  }, [])

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-rose-700 hover:text-rose-500 relative"
      onClick={() => router.push('/cart')}
    >
      <ShoppingCart className="w-5 h-5" />
      <span className="ml-1 bg-rose-500 text-white rounded-full text-xs px-2 py-0.5">{count}</span>
    </Button>
  )
}
