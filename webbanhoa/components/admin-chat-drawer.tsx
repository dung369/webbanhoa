"use client"

import React, { useEffect, useState } from 'react'
// lightweight drawer: using fixed panel markup to avoid dependency on a Drawer component
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { MessageSquare, X } from 'lucide-react'

export default function AdminChatDrawer({ open, onOpenChange }: { open?: boolean; onOpenChange?: (v: boolean) => void }) {
  const [conversations, setConversations] = useState<any[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const listRef = React.useRef<HTMLDivElement | null>(null)

  async function load() {
    try {
      const res = await fetch('/api/feedback')
      if (!res.ok) return
      const arr = await res.json()
      // group by senderId (or email/name if missing)
      const map: Record<string, any[]> = {}
      arr.forEach((r: any) => {
        const key = r.senderId || r.email || r.name || r.id
        map[key] = map[key] || []
        map[key].push(r)
      })
      const conv = Object.keys(map).map((k) => ({ id: k, items: map[k] }))
      setConversations(conv)
      if (!selected && conv.length) setSelected(conv[0].id)
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 3000)
    return () => clearInterval(t)
  }, [])

  const selectedConv = conversations.find((c) => c.id === selected)

  async function sendReply() {
    if (!message.trim() || !selectedConv) return
    setIsSending(true)
    try {
      const payload = {
        message: message.trim(),
        recipientId: selectedConv.id,
        role: 'admin'
      }
      const res = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) {
        setMessage('')
        await load()
        // scroll to bottom
        setTimeout(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight }, 50)
      }
    } catch (e) {
      // ignore
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <div className="w-96 bg-white border rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-rose-600" /><div className="font-semibold">Chat với khách</div></div>
          <button onClick={() => onOpenChange?.(false)} className="text-slate-500"><X className="w-4 h-4"/></button>
        </div>
        <div className="flex">
          <div className="w-40 border-r max-h-80 overflow-auto">
            {conversations.map((c) => (
              <div key={c.id} className={`p-3 cursor-pointer ${c.id === selected ? 'bg-rose-50' : 'hover:bg-slate-50'}`} onClick={() => setSelected(c.id)}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 text-sm">{(c.items[0]?.name||'K').split(' ').map((s:any)=>s[0]).slice(0,2).join('').toUpperCase()}</div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{c.items[0]?.name || c.items[0]?.email || c.id}</div>
                    <div className="text-xs text-slate-500">{c.items[c.items.length-1]?.createdAt?.slice(0,19).replace('T',' ')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1 p-3 max-h-80 overflow-auto flex flex-col">
            <div ref={listRef} className="flex-1 overflow-auto space-y-2">
              {selectedConv ? (
                selectedConv.items.map((m: any, i: number) => (
                  <div key={i} className={`p-2 rounded ${m.role === 'admin' ? 'bg-rose-100 text-rose-900 self-end ml-auto' : 'bg-slate-100 text-slate-800'}`}>
                    <div className="text-xs font-medium">{m.name || m.email || (m.senderId || m.id)}</div>
                    <div className="mt-1 text-sm">{m.message}</div>
                    <div className="text-xs text-slate-400 mt-1">{m.createdAt}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500">Chưa có cuộc hội thoại</div>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <input value={message} onChange={(e) => setMessage(e.target.value)} className="flex-1 border rounded p-2" placeholder="Gửi trả lời..." />
              <Button onClick={sendReply} disabled={isSending}>{isSending ? 'Đang gửi...' : 'Gửi'}</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
