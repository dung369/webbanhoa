"use client"

import React, { useEffect, useRef, useState } from 'react'
import SiteHeader from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import devAuth from '@/lib/devAuth'
import Link from 'next/link'

type Message = {
  id?: string
  message: string
  senderId?: string | null
  recipientId?: string | null
  name?: string | null
  email?: string | null
  role?: string | null
  createdAt?: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<{ id: string; name: string }[]>([])
  const [convNames, setConvNames] = useState<Record<string, { display: string; rawId: string }>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const pollingRef = useRef<number | null>(null)

  // current user (admin or customer)
  const current = typeof devAuth?.currentUser === 'function' ? devAuth.currentUser() : null
  // fallback anonymous id for non-logged-in visitors
  useEffect(() => {
    if (!current) {
      try {
        let anon = localStorage.getItem('wb_messenger_uid')
        if (!anon) {
          anon = 'anon-' + Math.random().toString(36).slice(2, 9)
          localStorage.setItem('wb_messenger_uid', anon)
        }
      } catch (e) {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/feedback')
      if (!res.ok) return
      const data = await res.json()
      const list: Message[] = Array.isArray(data) ? data : []
      // sort by createdAt ascending
      list.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return ta - tb
      })
      setMessages(list)
      // derive conversations and canonical names: unique user ids that are not admin
      const convMap: Record<string, { msgs: Message[] }> = {}
      list.forEach((m) => {
        const otherId = m.senderId && m.role !== 'admin' ? m.senderId : (m.recipientId && m.role === 'admin' ? m.recipientId : m.senderId)
        const id = String(otherId || 'unknown')
        if (id === 'null' || id === 'undefined') return
        convMap[id] = convMap[id] || { msgs: [] }
        convMap[id].msgs.push(m)
      })

      const convs = Object.keys(convMap).map((k) => ({ id: k, name: '' }))
      setConversations(convs)

      // Build canonical display names per conversation: pick most recent message with a non-empty name
      const names: Record<string, { display: string; rawId: string }> = {}
      Object.keys(convMap).forEach((id) => {
        const msgs = convMap[id].msgs.slice().sort((a, b) => {
          const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return tb - ta
        })

        // Helper: treat some short/generic names as placeholders we should ignore
        const isGeneric = (n?: string | null) => {
          if (!n) return true
          const s = String(n).trim()
          if (!s) return true
          const lower = s.toLowerCase()
          if (lower === 'khách' || lower === 'khách hàng' || lower === 'nhân viên' || lower === 'guest') return true
          if (/^dev-?\d+/i.test(s)) return true
          // very short names (1-2 chars) are probably not full names
          if (s.length <= 2) return true
          return false
        }

        // Prefer registered full name from message payloads (firstName + lastName) or a proper name field
        let display = ''
        const latest = msgs[0]

        // 1) Look through messages for structured names (firstName/lastName) or a good 'name' field
        let foundName: string | null = null
        for (const m of msgs) {
          // check structured fields if present
          const anyM: any = m as any
          if (anyM.firstName || anyM.lastName) {
            const f = (anyM.firstName || '').toString().trim()
            const l = (anyM.lastName || '').toString().trim()
            const full = `${f} ${l}`.trim()
            if (full && !isGeneric(full)) { foundName = full; break }
          }
          if (m.name && !isGeneric(m.name)) { foundName = String(m.name).trim(); break }
        }

        // 2) If not found in messages, check current user record if it matches this conversation id
        if (!foundName && current) {
          const curId = String(current.uid || current.id || '')
          if (curId && curId === id) {
            const f = (current.firstName || '')
            const l = (current.lastName || '')
            const full = `${f ? f + ' ' : ''}${l ? l : ''}`.trim()
            if (full) foundName = full
            else if (current.displayName) foundName = current.displayName
          }
        }

        if (foundName) {
          display = foundName
        } else {
          // 3) fallback: see if latest.name exists and is not dev-xx; otherwise dev-xx or short id
          const raw = latest?.name || id
          const devMatch = String(raw).match(/^(dev)-(\d+)/)
          if (!isGeneric(String(raw)) && latest?.name) {
            display = String(latest?.name)
          } else if (devMatch) {
            const prefix = devMatch[1]
            const suffix = devMatch[2]
            display = `Khách hàng ${prefix}-${suffix.slice(0,2)}`
          } else {
            display = `Khách hàng ${String(id).slice(0,6)}`
          }
        }

        names[id] = { display, rawId: id }
      })
      setConvNames(names)
      // if nothing selected, pick first (for admin view) or pick current user
      if (!selected) {
        if (current && String(current.uid || current.id).startsWith('admin')) {
          if (convs.length) setSelected(convs[0].id)
        } else {
          const myId = current ? String(current.uid || current.id) : localStorage.getItem('wb_messenger_uid') || null
          setSelected(myId)
        }
      }
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    // initial fetch
    fetchMessages()
    // polling every 3s
    pollingRef.current = window.setInterval(fetchMessages, 3000)
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sendMessage = async () => {
    const trimmed = text.trim()
    if (!trimmed) return
    setLoading(true)
    try {
      const user = current || { uid: localStorage.getItem('wb_messenger_uid') }
      const payload: Message = {
        message: trimmed,
        senderId: String(user?.uid || user?.id || null),
        recipientId: (current && String(current.uid || current.id).startsWith('admin')) ? null : 'admin',
        name: current ? (current.firstName || current.displayName || '') : 'Khách',
        role: (current && String(current.uid || current.id).startsWith('admin')) ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
      }
      const res = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) {
        setText('')
        // optimistic append
        setMessages((m) => [...m, payload])
        // force fetch soon
        setTimeout(fetchMessages, 500)
        // check for simple chatbot triggers and schedule a bot reply (only for customer messages)
        if (payload.role !== 'admin' && payload.role !== 'bot') scheduleBotReply(payload)
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  // Simple rule-based chatbot with 3 Q&A
  const botRules: Array<{ keywords: string[]; reply: string }> = [
    { keywords: ['giờ', 'mở cửa', 'giờ làm việc'], reply: 'Chúng tôi mở cửa từ 8:00 - 20:00 (Thứ 2 - Thứ 6) và 8:00 - 22:00 (Cuối tuần).' },
    { keywords: ['giao hàng', 'ship', 'giao'], reply: 'Chúng tôi giao hàng trong 2-4 giờ trong nội thành TP.HCM. Đơn hàng trên 500.000đ được miễn phí giao.' },
    { keywords: ['đổi trả', 'bảo hành', 'hoàn tiền'], reply: 'Chúng tôi hỗ trợ đổi trả trong 24h nếu sản phẩm không đạt chất lượng. Vui lòng giữ lại hình ảnh và hóa đơn.' },
  ]

  function scheduleBotReply(userMsg: Message) {
    // only respond to non-admin, non-bot user messages
    if (!userMsg || userMsg.role === 'admin' || userMsg.role === 'bot') return
    try {
      const text = (userMsg.message || '').toLowerCase()
      for (const rule of botRules) {
        if (rule.keywords.some((k) => text.includes(k))) {
          const botReply: Message = {
            message: rule.reply,
            senderId: 'bot',
            recipientId: String(userMsg.senderId || userMsg.recipientId || ''),
            name: 'Hệ thống',
            role: 'bot',
            createdAt: new Date().toISOString(),
          }
          // optimistic append after short delay to mimic typing
          setTimeout(async () => {
            setMessages((m) => [...m, botReply])
            try {
              await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(botReply) })
            } catch (e) {
              // ignore
            }
          }, 800)
          break
        }
      }
    } catch (e) {
      // ignore
    }
  }

  const myId = current ? String(current.uid || current.id) : (typeof window !== 'undefined' ? (localStorage.getItem('wb_messenger_uid') || null) : null)

  const thread = messages.filter((m) => {
    // selected conversation: messages where senderId === selected or recipientId === selected OR if customer view, messages where senderId === myId or recipientId === myId
    if (!selected) return false
    return String(m.senderId || '') === String(selected) || String(m.recipientId || '') === String(selected) || (myId && (String(m.senderId || '') === myId || String(m.recipientId || '') === myId))
  })

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-rose-900">Chat</h2>
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-block">
              <Button variant="outline">Thoát</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Conversations */}
          <div className="lg:col-span-1 border rounded-lg p-3 bg-rose-50">
            <div className="font-medium text-rose-900 mb-3">Cuộc trò chuyện</div>
            <div className="space-y-2 max-h-[60vh] overflow-auto">
              {/* For admin, show all conversations; for customer, show only their own */}
              {current && String(current.uid || current.id).startsWith('admin') ? (
                conversations.length ? conversations.map((c) => (
                  <button key={c.id} onClick={() => setSelected(c.id)} className={`w-full text-left p-2 rounded ${selected === c.id ? 'bg-white shadow' : 'hover:bg-white/60'}`}>
                    <div className="font-semibold text-rose-900">{convNames[c.id]?.display || c.id}</div>
                    <div className="text-xs text-rose-600">{convNames[c.id]?.rawId || c.id}</div>
                  </button>
                )) : <div className="text-sm text-rose-600">Chưa có cuộc trò chuyện</div>
              ) : (
                <div className={`w-full text-left p-2 rounded ${selected ? 'bg-white shadow' : ''}`}>
                  <div className="font-semibold text-rose-900">{current ? (current.firstName || current.displayName || 'Bạn') : 'Bạn'}</div>
                  <div className="text-xs text-rose-600">{myId}</div>
                </div>
              )}
            </div>
          </div>

          {/* Thread area */}
          <div className="lg:col-span-3 border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-rose-900">{(selected && convNames[selected]?.display) || (current ? (current.firstName || current.displayName || 'Bạn') : 'Bạn')}</div>
                <div className="text-xs text-rose-500">{(selected && convNames[selected]?.rawId) || selected}</div>
              </div>
            </div>

            <div className="h-[60vh] overflow-auto space-y-3 p-3 border rounded mb-4 bg-rose-50">
              {thread.length === 0 && <div className="text-sm text-rose-600">Chưa có tin nhắn. Bắt đầu cuộc trò chuyện bằng cách nhập tin nhắn bên dưới.</div>}
              {thread.map((m, i) => {
                const isMe = String(m.senderId || '') === String(myId) || (current && String(current.uid || current.id).startsWith('admin') && m.role === 'admin')
                return (
                  <div key={i} className={`max-w-[80%] ${isMe ? 'ml-auto bg-rose-500 text-white' : 'bg-white text-rose-900'} px-4 py-2 rounded-lg shadow-sm` }>
                    <div className="text-sm">{m.message}</div>
                    <div className={`text-xs mt-1 ${isMe ? 'text-rose-100' : 'text-rose-500'}`}>{
                      // Use canonical name for customer messages
                      (m.role !== 'admin' && m.senderId && convNames[m.senderId]?.display) || (m.name || (m.role === 'admin' ? 'Nhân viên' : 'Khách'))
                    }</div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-3">
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Nhập tin nhắn..." />
              <Button onClick={sendMessage} disabled={loading}>{loading ? 'Đang gửi...' : 'Gửi'}</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
