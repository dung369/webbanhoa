"use client";

import React, { useEffect, useRef, useState } from "react";
import SiteHeader from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import devAuth from "@/lib/devAuth";
import Link from "next/link";
import { 
  MessageSquare, 
  ArrowLeft, 
  Users, 
  User, 
  Check, 
  Smile, 
  Loader2, 
  Send 
} from "lucide-react";

type Message = {
  id?: string;
  message: string;
  senderId?: string | null;
  recipientId?: string | null;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  createdAt?: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<
    { id: string; name: string }[]
  >([]);
  const [convNames, setConvNames] = useState<
    Record<string, { display: string; rawId: string }>
  >({});
  const [selected, setSelected] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const pollingRef = useRef<number | null>(null);

  // current user (admin or customer)
  const current =
    typeof devAuth?.currentUser === "function" ? devAuth.currentUser() : null;
  // fallback anonymous id for non-logged-in visitors
  useEffect(() => {
    if (!current) {
      try {
        let anon = localStorage.getItem("wb_messenger_uid");
        if (!anon) {
          anon = "anon-" + Math.random().toString(36).slice(2, 9);
          localStorage.setItem("wb_messenger_uid", anon);
        }
      } catch (e) {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/feedback");
      if (!res.ok) return;
      const data = await res.json();
      const list: Message[] = Array.isArray(data) ? data : [];
      // sort by createdAt ascending
      list.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return ta - tb;
      });
      setMessages(list);
      // derive conversations and canonical names: unique user ids that are not admin
      const convMap: Record<string, { msgs: Message[] }> = {};
      list.forEach((m) => {
        const otherId =
          m.senderId && m.role !== "admin"
            ? m.senderId
            : m.recipientId && m.role === "admin"
            ? m.recipientId
            : m.senderId;
        const id = String(otherId || "unknown");
        if (id === "null" || id === "undefined") return;
        convMap[id] = convMap[id] || { msgs: [] };
        convMap[id].msgs.push(m);
      });

      const convs = Object.keys(convMap).map((k) => ({ id: k, name: "" }));
      setConversations(convs);

      // Build canonical display names per conversation: pick most recent message with a non-empty name
      const names: Record<string, { display: string; rawId: string }> = {};
      Object.keys(convMap).forEach((id) => {
        const msgs = convMap[id].msgs.slice().sort((a, b) => {
          const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tb - ta;
        });

        // Helper: treat some short/generic names as placeholders we should ignore
        const isGeneric = (n?: string | null) => {
          if (!n) return true;
          const s = String(n).trim();
          if (!s) return true;
          const lower = s.toLowerCase();
          if (
            lower === "khách" ||
            lower === "khách hàng" ||
            lower === "nhân viên" ||
            lower === "guest"
          )
            return true;
          if (/^dev-?\d+/i.test(s)) return true;
          // very short names (1-2 chars) are probably not full names
          if (s.length <= 2) return true;
          return false;
        };

        // Prefer registered full name from message payloads (firstName + lastName) or a proper name field
        let display = "";
        const latest = msgs[0];

        // 1) Look through messages for structured names (firstName/lastName) or a good 'name' field
        let foundName: string | null = null;
        for (const m of msgs) {
          // check structured fields if present
          const anyM: any = m as any;
          if (anyM.firstName || anyM.lastName) {
            const f = (anyM.firstName || "").toString().trim();
            const l = (anyM.lastName || "").toString().trim();
            const full = `${f} ${l}`.trim();
            if (full && !isGeneric(full)) {
              foundName = full;
              break;
            }
          }
          if (m.name && !isGeneric(m.name)) {
            foundName = String(m.name).trim();
            break;
          }
        }

        // 2) If not found in messages, check current user record if it matches this conversation id
        if (!foundName && current) {
          const curId = String(current.uid || current.id || "");
          if (curId && curId === id) {
            const f = current.firstName || "";
            const l = current.lastName || "";
            const full = `${f ? f + " " : ""}${l ? l : ""}`.trim();
            if (full) foundName = full;
            else if (current.displayName) foundName = current.displayName;
          }
        }

        if (foundName) {
          display = foundName;
        } else {
          // 3) fallback: see if latest.name exists and is not dev-xx; otherwise dev-xx or short id
          const raw = latest?.name || id;
          const devMatch = String(raw).match(/^(dev)-(\d+)/);
          if (!isGeneric(String(raw)) && latest?.name) {
            display = String(latest?.name);
          } else if (devMatch) {
            const prefix = devMatch[1];
            const suffix = devMatch[2];
            display = `Khách hàng ${prefix}-${suffix.slice(0, 2)}`;
          } else {
            display = `Khách hàng ${String(id).slice(0, 6)}`;
          }
        }

        names[id] = { display, rawId: id };
      });
      setConvNames(names);
      // if nothing selected, pick first (for admin view) or pick current user
      if (!selected) {
        if (current && String(current.uid || current.id).startsWith("admin")) {
          if (convs.length) setSelected(convs[0].id);
        } else {
          const myId = current
            ? String(current.uid || current.id)
            : localStorage.getItem("wb_messenger_uid") || null;
          setSelected(myId);
        }
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    // initial fetch
    fetchMessages();
    // polling every 3s
    pollingRef.current = window.setInterval(fetchMessages, 3000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const user = current || { uid: localStorage.getItem("wb_messenger_uid") };
      const payload: Message = {
        message: trimmed,
        senderId: String(user?.uid || user?.id || null),
        recipientId:
          current && String(current.uid || current.id).startsWith("admin")
            ? null
            : "admin",
        name: current
          ? current.firstName || current.displayName || ""
          : "Khách",
        role:
          current && String(current.uid || current.id).startsWith("admin")
            ? "admin"
            : "user",
        createdAt: new Date().toISOString(),
      };
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setText("");
        // optimistic append
        setMessages((m) => [...m, payload]);
        // force fetch soon
        setTimeout(fetchMessages, 500);
        // check for simple chatbot triggers and schedule a bot reply (only for customer messages)
        if (payload.role !== "admin" && payload.role !== "bot")
          scheduleBotReply(payload);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // Chatbot với các câu hỏi thường gặp
  const botRules: Array<{ keywords: string[]; reply: string }> = [
    {
      keywords: ["thời gian giao hàng", "giao hàng bao lâu", "giao trong bao lâu", "giao hàng mất bao lâu", "ship bao lâu"],
      reply: "Chúng tôi giao hàng trong vòng 2-4 tiếng tại nội thành và 1-2 ngày cho các tỉnh khác.",
    },
    {
      keywords: ["đặt hoa theo yêu cầu", "thiết kế riêng", "đặt riêng", "theo yêu cầu", "custom"],
      reply: "Có, chúng tôi nhận thiết kế hoa theo yêu cầu. Vui lòng liên hệ trước 24h để chuẩn bị.",
    },
    {
      keywords: ["đổi trả", "chính sách đổi trả", "trả hàng", "hoàn tiền", "đổi hàng"],
      reply: "Chúng tôi hỗ trợ đổi trả trong vòng 24h nếu sản phẩm không đúng yêu cầu.",
    },
    {
      keywords: ["giao hàng miễn phí", "free ship", "miễn phí giao", "phí giao hàng"],
      reply: "Miễn phí giao hàng cho đơn hàng từ 500,000đ trong nội thành TP.HCM.",
    },
    {
      keywords: ["hoa theo dịp", "sinh nhật", "20/10", "valentine", "8/3", "ngày lễ", "dịp đặc biệt"],
      reply: "Bạn có thể chọn mục Hoa theo dịp trong menu, chatbot sẽ gợi ý những mẫu phù hợp.",
    },
    {
      keywords: ["thanh toán online", "thanh toán", "payment", "momo", "zalopay", "vnpay", "chuyển khoản"],
      reply: "Có, chúng tôi hỗ trợ thanh toán qua chuyển khoản ngân hàng, ví điện tử (Momo, ZaloPay, VNPay)...",
    },
    {
      keywords: ["theo dõi đơn hàng", "tracking", "trạng thái đơn", "mã đơn hàng", "kiểm tra đơn"],
      reply: "Bạn chỉ cần nhập mã đơn hàng, chatbot sẽ cung cấp tình trạng giao hàng hiện tại.",
    },
    {
      keywords: ["giờ", "mở cửa", "giờ làm việc", "mở bao giờ"],
      reply: "Chúng tôi mở cửa từ 8:00 - 20:00 (Thứ 2 - Thứ 6) và 8:00 - 22:00 (Cuối tuần).",
    },
  ];

  function scheduleBotReply(userMsg: Message) {
    // only respond to non-admin, non-bot user messages
    if (!userMsg || userMsg.role === "admin" || userMsg.role === "bot") return;
    try {
      const text = (userMsg.message || "").toLowerCase();
      for (const rule of botRules) {
        if (rule.keywords.some((k) => text.includes(k))) {
          const botReply: Message = {
            message: rule.reply,
            senderId: "bot",
            recipientId: String(userMsg.senderId || userMsg.recipientId || ""),
            name: "Hệ thống",
            role: "bot",
            createdAt: new Date().toISOString(),
          };
          // optimistic append after short delay to mimic typing
          setTimeout(async () => {
            setMessages((m) => [...m, botReply]);
            try {
              await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(botReply),
              });
            } catch (e) {
              // ignore
            }
          }, 800);
          break;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  const myId = current
    ? String(current.uid || current.id)
    : typeof window !== "undefined"
    ? localStorage.getItem("wb_messenger_uid") || null
    : null;

  const thread = messages.filter((m) => {
    // selected conversation: messages where senderId === selected or recipientId === selected OR if customer view, messages where senderId === myId or recipientId === myId
    if (!selected) return false;
    return (
      String(m.senderId || "") === String(selected) ||
      String(m.recipientId || "") === String(selected) ||
      (myId &&
        (String(m.senderId || "") === myId ||
          String(m.recipientId || "") === myId))
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white">
      <SiteHeader />

      <div className="container mx-auto px-4 py-6">
        {/* Header với animation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                Chat với Hoa Tươi Việt
              </h2>
              <p className="text-rose-500">Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
            </div>
          </div>
          <Link href="/" className="inline-block">
            <Button variant="outline" className="border-rose-300 text-rose-600 hover:bg-rose-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Về trang chủ
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Conversations Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm border border-rose-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-rose-500" />
                <h3 className="font-semibold text-rose-900">Cuộc trò chuyện</h3>
              </div>
              <div className="space-y-3 max-h-[60vh] overflow-auto">
                {/* For admin, show all conversations; for customer, show only their own */}
                {current &&
                String(current.uid || current.id).startsWith("admin") ? (
                  conversations.length ? (
                    conversations.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelected(c.id)}
                        className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                          selected === c.id
                            ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md"
                            : "hover:bg-rose-50 border border-rose-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            selected === c.id ? "bg-white/20" : "bg-rose-100"
                          }`}>
                            <User className={`w-5 h-5 ${
                              selected === c.id ? "text-white" : "text-rose-500"
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {convNames[c.id]?.display || c.id}
                            </div>
                            <div className={`text-xs truncate ${
                              selected === c.id ? "text-white/70" : "text-rose-500"
                            }`}>
                              {convNames[c.id]?.rawId || c.id}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center p-8">
                      <MessageSquare className="w-12 h-12 text-rose-300 mx-auto mb-3" />
                      <p className="text-sm text-rose-500">Chưa có cuộc trò chuyện</p>
                    </div>
                  )
                ) : (
                  <div className={`w-full text-left p-3 rounded-xl ${
                    selected ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md" : "border border-rose-100"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        selected ? "bg-white/20" : "bg-rose-100"
                      }`}>
                        <User className={`w-5 h-5 ${
                          selected ? "text-white" : "text-rose-500"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">
                          {current
                            ? current.firstName || current.displayName || "Bạn"
                            : "Bạn"}
                        </div>
                        <div className={`text-xs ${
                          selected ? "text-white/70" : "text-rose-500"
                        }`}>{myId}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm border border-rose-200 rounded-2xl shadow-lg overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg">
                      {(selected && convNames[selected]?.display) ||
                        (current
                          ? current.firstName || current.displayName || "Bạn"
                          : "Bạn")}
                    </h3>
                    <p className="text-white/70 text-sm">
                      {(selected && convNames[selected]?.rawId) || selected}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Đang hoạt động</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="h-[60vh] overflow-auto p-6 space-y-4 bg-gradient-to-b from-white to-rose-50/30">
                {thread.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-rose-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-rose-600 mb-2">
                      Chưa có tin nhắn
                    </h3>
                    <p className="text-rose-500">
                      Bắt đầu cuộc trò chuyện bằng cách nhập tin nhắn bên dưới
                    </p>
                  </div>
                )}
                {thread.map((m, i) => {
                  const isMe =
                    String(m.senderId || "") === String(myId) ||
                    (current &&
                      String(current.uid || current.id).startsWith("admin") &&
                      m.role === "admin");
                  return (
                    <div
                      key={i}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[80%] ${
                        isMe
                          ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white"
                          : "bg-white text-rose-900 border border-rose-100"
                      } px-4 py-3 rounded-2xl shadow-sm relative`}>
                        <div className="text-sm leading-relaxed">{m.message}</div>
                        <div className={`text-xs mt-2 flex items-center gap-2 ${
                          isMe ? "text-white/70" : "text-rose-500"
                        }`}>
                          <User className="w-3 h-3" />
                          <span>
                            {
                              // Use canonical name for customer messages
                              (m.role !== "admin" &&
                                m.senderId &&
                                convNames[m.senderId]?.display) ||
                                m.name ||
                                (m.role === "admin" ? "Nhân viên" : "Khách")
                            }
                          </span>
                          {isMe && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Input */}
              <div className="p-6 bg-white border-t border-rose-100">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Nhập tin nhắn..."
                      className="pr-12 border-rose-200 focus:border-rose-400 focus:ring-rose-200 rounded-xl"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-rose-500 hover:text-rose-600"
                    >
                      <Smile className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button 
                    onClick={sendMessage} 
                    disabled={loading || !text.trim()}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-6 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
