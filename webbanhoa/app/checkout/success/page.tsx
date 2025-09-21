"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function CheckoutSuccessPage() {
  const search = useSearchParams()
  const id = search?.get('id')
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (!id) return
    try {
      await navigator.clipboard.writeText(id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-rose-50 p-6">
      <div className="max-w-2xl w-full bg-white shadow-lg rounded-2xl p-10 text-center">
        <div className="flex items-center justify-center mb-4">
          {/* small logo - replace with your image if desired */}
          <img src="/images/ảnh cửa hàng hoa.jpg" alt="logo" className="h-14 w-14 rounded-full object-cover border" />
        </div>
        <div className="flex items-center justify-center mb-6">
          <div className="h-20 w-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-4xl font-bold">✓</div>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Đặt hàng thành công</h1>
        <p className="text-slate-600 mb-4">Cảm ơn quý khách đã tin tưởng sản phẩm của chúng tôi. Chúng tôi đã nhận được đơn hàng và sẽ xử lý sớm nhất có thể.</p>

        {id ? (
          <div className="mb-6">
            <div className="text-sm text-slate-500">Mã đơn hàng của bạn</div>
            <div className="mt-2 inline-flex items-center space-x-3 rounded-md border px-4 py-2">
              <div className="font-mono text-sm text-slate-800">{id}</div>
              <Button variant="ghost" size="sm" onClick={copy}>{copied ? 'Đã sao chép' : 'Sao chép'}</Button>
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          <Link href="/products">
            <Button className="w-48 mx-auto bg-gradient-to-r from-rose-500 to-pink-500 text-white">Quay lại trang sản phẩm</Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="w-48 mx-auto">Về trang chủ</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
