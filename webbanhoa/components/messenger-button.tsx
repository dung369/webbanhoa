"use client"

import React, { useState, useEffect } from "react"
import devAuth from '@/lib/devAuth'
import { MessageSquare, X } from "lucide-react"

type Props = {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export default function MessengerButton({ className, size = 'md', label }: Props) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('wb_messenger_history')
      if (raw) setHistory(JSON.parse(raw))
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('wb_messenger_history', JSON.stringify(history))
    } catch (e) {
      // ignore
    }
  }, [history])

  async function sendMessage() {
    if (!message.trim()) return
    const text = message.trim()
    setMessage("")
    setIsSending(true)
    try {
      // attach user info when available so admin can identify sender
      const user = (typeof devAuth?.currentUser === 'function') ? devAuth.currentUser() : null
      const payload = {
        message: text,
        userId: user?.uid || user?.id || null,
        name: (user && (user.firstName || user.displayName || user.lastName)) ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.displayName || null : null,
        email: user?.email || null,
      }

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        // append for display
        setHistory((h) => [...h, text])
        return
      }
    } catch (e) {
      // ignore - fallback below
    } finally {
      setIsSending(false)
    }

    // fallback: persist locally
    try {
      const next = [...history, text]
      setHistory(next)
    } catch (e) {
      // ignore
    }
  }

  // larger sizes for 'lg' (increased slightly)
  const sizeClasses = size === 'lg' ? 'w-36 h-36' : size === 'sm' ? 'w-12 h-12' : 'w-28 h-28'
  const iconSize = size === 'lg' ? 'w-16 h-16' : size === 'sm' ? 'w-4 h-4' : 'w-12 h-12'

  return (
    <div className={`inline-flex items-center gap-4 ${className || ''}`}>
      <div className="relative">
        {/* Floating round button */}
        <button
          aria-label={open ? 'Đóng chat' : 'Mở chat'}
          onClick={() => setOpen((s) => !s)}
          className={`${sizeClasses} rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-transform`}
        >
          {open ? <X className={iconSize} /> : <MessageSquare className={iconSize} />}
        </button>

        {/* Chat drawer (appears to the right of the button) */}
        {open && (
          <div className="absolute left-full ml-3 top-0 w-[340px] max-w-full bg-white border rounded-lg shadow-lg z-50">
            <div className="p-3 border-b">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-rose-900">Chat với nhân viên</div>
                <button onClick={() => setOpen(false)} className="text-rose-500 hover:text-rose-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-3 h-40 overflow-auto space-y-2">
              {history.length === 0 && (
                <div className="text-sm text-rose-600">Chào bạn! Gửi tin nhắn để bắt đầu cuộc trò chuyện.</div>
              )}
              {history.map((m, i) => (
                <div key={i} className="bg-rose-50 text-rose-900 px-3 py-2 rounded-md text-sm">
                  {m}
                </div>
              ))}
            </div>

            <div className="p-3 border-t">
              <div className="flex gap-2">
                <input
                  className="flex-1 border rounded-md px-3 py-2 text-sm"
                  placeholder="Nhập tin nhắn..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage() } }}
                />
                <button
                  onClick={sendMessage}
                  className="inline-flex items-center gap-2 bg-rose-500 text-white px-3 py-2 rounded-md text-sm hover:bg-rose-600"
                >
                  Gửi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Label placed horizontally to the right of the button; prevent wrapping */}
      {label && (
        <div className="text-rose-900 font-semibold text-xl md:text-2xl select-none whitespace-nowrap ml-3">{label}</div>
      )}
    </div>
  )
}
