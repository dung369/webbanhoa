"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Phone, Mail, MapPin, Clock, Send, Heart, ShoppingCart } from "lucide-react"
import SiteFooter from '@/components/site-footer'
// messenger moved to dedicated full-page chat at /chat
import CartButton from '@/components/cart-button'
import SiteHeader from '@/components/site-header'
import devAuth, { onAuthStateChanged as devOnAuthStateChanged } from '@/lib/devAuth'

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<any>(devAuth.currentUser())
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [subject, setSubject] = useState('')
  const [messageText, setMessageText] = useState('')
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (typeof devOnAuthStateChanged === 'function') {
      const unsub = devOnAuthStateChanged((u: any) => setUser(u))
      return () => unsub()
    }
    return undefined
  }, [])

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '')
      setLastName(user.lastName || user.displayName || '')
      setEmail(user.email || '')
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setNotice('Bạn cần đăng nhập để gửi phản hồi')
      return
    }
    setIsSubmitting(true)
    setNotice(null)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid || user.id, name: `${firstName} ${lastName}`.trim(), email, message: messageText }),
      })
      if (res.ok) {
        setNotice('Cảm ơn! Phản hồi của bạn đã được gửi.')
        setSubject('')
        setMessageText('')
      } else {
        const payload = await res.json().catch(() => null)
        setNotice('Gửi thất bại: ' + (payload?.error || res.status))
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('feedback submit error', err)
      setNotice('Gửi thất bại: lỗi kết nối')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50">
      <SiteHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 mb-4">Liên hệ</Badge>
          <h1 className="text-4xl font-bold text-rose-900 mb-4">Liên Hệ Với Chúng Tôi</h1>
          <p className="text-xl text-rose-700 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ với chúng tôi qua các kênh dưới đây.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Info Cards */}
          <Card className="border-rose-100 text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-rose-900 mb-2">Điện thoại</h3>
              <p className="text-rose-700 mb-4">Gọi ngay để được tư vấn</p>
              <p className="text-2xl font-bold text-rose-600">0123 456 789</p>
              <p className="text-rose-500">Hotline 24/7</p>
            </CardContent>
          </Card>

          <Card className="border-rose-100 text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-rose-900 mb-2">Email</h3>
              <p className="text-rose-700 mb-4">Gửi email cho chúng tôi</p>
              <p className="text-lg font-medium text-rose-600">contact@hoatuoiviet.com</p>
              <p className="text-rose-500">Phản hồi trong 24h</p>
            </CardContent>
          </Card>

          <Card className="border-rose-100 text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-rose-900 mb-2">Địa chỉ</h3>
              <p className="text-rose-700 mb-4">Ghé thăm cửa hàng của chúng tôi</p>
              <p className="text-rose-600 font-medium">123 Đường Hoa</p>
              <p className="text-rose-600">Quận 1, TP.HCM</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="border-rose-100 shadow-lg relative">
            <CardHeader>
              <CardTitle className="text-rose-900 text-2xl">Gửi tin nhắn cho chúng tôi</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Họ *</Label>
                    <Input
                      id="firstName"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="border-rose-200 focus:border-rose-500 focus:ring-rose-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Tên *</Label>
                    <Input
                      id="lastName"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="border-rose-200 focus:border-rose-500 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-rose-200 focus:border-rose-500 focus:ring-rose-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="border-rose-200 focus:border-rose-500 focus:ring-rose-500" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Chủ đề *</Label>
                  <Input
                    id="subject"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Tư vấn sản phẩm, khiếu nại, góp ý..."
                    className="border-rose-200 focus:border-rose-500 focus:ring-rose-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Tin nhắn *</Label>
                  <Textarea
                    id="message"
                    required
                    rows={5}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Nội dung tin nhắn của bạn..."
                    className="border-rose-200 focus:border-rose-500 focus:ring-rose-500"
                  />
                </div>

                {notice && <div className="text-sm text-rose-700">{notice}</div>}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
                  disabled={isSubmitting}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Đang gửi..." : "Gửi tin nhắn"}
                </Button>
              </form>
            </CardContent>

            {/* Link to full chat page */}
            <div className="absolute left-6 bottom-6">
              <Link href="/chat">
                <Button className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white">
                  Chat với nhân viên
                </Button>
              </Link>
            </div>
          </Card>

          {/* Business Hours & Map */}
          <div className="space-y-8">
            <Card className="border-rose-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-rose-900">
                  <Clock className="w-5 h-5" />
                  <span>Giờ làm việc</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-rose-700">Thứ 2 - Thứ 6:</span>
                  <span className="font-medium text-rose-900">8:00 - 20:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-rose-700">Thứ 7 - Chủ nhật:</span>
                  <span className="font-medium text-rose-900">8:00 - 22:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-rose-700">Ngày lễ:</span>
                  <span className="font-medium text-rose-900">9:00 - 18:00</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-rose-100 shadow-lg">
              <CardHeader>
                <CardTitle className="text-rose-900">Bản đồ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-rose-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-rose-400 mx-auto mb-2" />
                    <p className="text-rose-600">Bản đồ cửa hàng</p>
                    <p className="text-sm text-rose-500">123 Đường Hoa, Quận 1, TP.HCM</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-rose-100 shadow-lg">
              <CardHeader>
                <CardTitle className="text-rose-900">Câu hỏi thường gặp</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-rose-900 mb-1">Thời gian giao hàng?</h4>
                  <p className="text-sm text-rose-700">Giao hàng trong vòng 2-4 giờ tại TP.HCM</p>
                </div>
                <div>
                  <h4 className="font-medium text-rose-900 mb-1">Có giao hàng miễn phí không?</h4>
                  <p className="text-sm text-rose-700">Miễn phí giao hàng cho đơn từ 500.000đ</p>
                </div>
                <div>
                  <h4 className="font-medium text-rose-900 mb-1">Có thể đổi trả không?</h4>
                  <p className="text-sm text-rose-700">Đổi trả trong 24h nếu hoa không tươi</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* messenger moved into the left card */}

      {/* Footer (centralized) */}
      {/* @ts-ignore */}
      <SiteFooter />
    </div>
  )
}
