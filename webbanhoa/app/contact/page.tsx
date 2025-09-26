"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  Heart,
  ShoppingCart,
  MessageCircle,
  Globe,
  Facebook,
  Instagram,
  Youtube,
  Zap,
  Star,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import SiteFooter from "@/components/site-footer";
import CartButton from "@/components/cart-button";
import AnimatedHeader from "@/components/animated-header";
import PageTransition from "@/components/page-transition";
import AdvancedAnimation from "@/components/advanced-animation";
import InteractiveEffect from "@/components/interactive-effect";
import AnimatedText from "@/components/animated-text";
import ParticleBackground from "@/components/particle-background";
import devAuth, {
  onAuthStateChanged as devOnAuthStateChanged,
} from "@/lib/devAuth";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(devAuth.currentUser());
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [activeContact, setActiveContact] = useState<number | null>(null);

  useEffect(() => {
    if (typeof devOnAuthStateChanged === "function") {
      const unsub = devOnAuthStateChanged((u: any) => setUser(u));
      return () => unsub();
    }
    return undefined;
  }, []);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !messageText.trim()
    ) {
      setNotice("Vui lòng điền đầy đủ thông tin!");
      setTimeout(() => setNotice(null), 3000);
      return;
    }

    setIsSubmitting(true);

    try {
      // Gửi dữ liệu sang API feedback để lưu cho admin xem
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          email,
          phone,
          subject,
          message: messageText,
          role: "customer",
        }),
      });

      if (!res.ok) throw new Error("Failed to send");

      setNotice("Cảm ơn bạn! Chúng tôi sẽ phản hồi trong vòng 24h.");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessageText("");

      setTimeout(() => setNotice(null), 5000);
    } catch (error) {
      setNotice("Có lỗi xảy ra. Vui lòng thử lại sau!");
      setTimeout(() => setNotice(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: Phone,
      title: "Điện thoại",
      info: "0123 456 789",
      description: "Gọi ngay để được tư vấn miễn phí",
      color: "from-green-500 to-emerald-500",
      action: "tel:0123456789"
    },
    {
      icon: Mail,
      title: "Email",
      info: "contact@hoatuoiviet.com",
      description: "Gửi email cho chúng tôi bất cứ lúc nào",
      color: "from-blue-500 to-cyan-500",
      action: "mailto:contact@hoatuoiviet.com"
    },
    {
      icon: MapPin,
      title: "Địa chỉ",
      info: "123 Đường Hoa, Quận 1, TP.HCM",
      description: "Ghé thăm showroom của chúng tôi",
      color: "from-purple-500 to-pink-500",
      action: "https://maps.google.com"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      info: "Hỗ trợ trực tuyến",
      description: "Chat với chuyên viên tư vấn",
      color: "from-orange-500 to-red-500",
      action: "/chat"
    }
  ];

  const workingHours = [
    { day: "Thứ 2 - Thứ 6", time: "8:00 - 22:00", isOpen: true },
    { day: "Thứ 7 - Chủ nhật", time: "9:00 - 21:00", isOpen: true },
    { day: "Ngày lễ", time: "10:00 - 18:00", isOpen: false },
  ];

  const socialLinks = [
    { icon: Facebook, name: "Facebook", url: "#", color: "from-blue-600 to-blue-700" },
    { icon: Instagram, name: "Instagram", url: "#", color: "from-pink-500 to-purple-600" },
    { icon: Youtube, name: "YouTube", url: "#", color: "from-red-500 to-red-600" },
    { icon: Globe, name: "Website", url: "#", color: "from-gray-500 to-gray-600" },
  ];

  const faqs = [
    {
      question: "Thời gian giao hàng là bao lâu?",
      answer: "Chúng tôi giao hàng trong vòng 2-4 tiếng tại nội thành và 1-2 ngày cho các tỉnh khác."
    },
    {
      question: "Có thể đặt hoa theo yêu cầu riêng không?",
      answer: "Có, chúng tôi nhận thiết kế hoa theo yêu cầu. Vui lòng liên hệ trước 24h."
    },
    {
      question: "Chính sách đổi trả như thế nào?",
      answer: "Chúng tôi hỗ trợ đổi trả trong vòng 24h nếu sản phẩm không đúng yêu cầu."
    },
    {
      question: "Có giao hàng miễn phí không?",
      answer: "Miễn phí giao hàng cho đơn hàng từ 500,000đ trong nội thành TP.HCM."
    }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 relative overflow-hidden">
        <ParticleBackground />
        <AnimatedHeader />

        {/* Hero Section */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-4">
            <AdvancedAnimation animation="slideUp" delay={0.2}>
              <div className="text-center mb-16">
                <InteractiveEffect effect="sparkle">
                  <Badge className="bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 hover:from-rose-200 hover:to-pink-200 mb-4 transform hover:scale-110 transition-all duration-300">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Liên hệ
                  </Badge>
                </InteractiveEffect>
                
                <h1 className="text-6xl font-bold text-rose-900 mb-6">
                  Kết Nối Với
                  <AdvancedAnimation animation="glowPulse" repeat={true}>
                    <span className="block bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                      Chúng Tôi
                    </span>
                  </AdvancedAnimation>
                </h1>
                
                <AdvancedAnimation animation="slideUp" delay={1.5}>
                  <p className="text-xl text-rose-700 max-w-3xl mx-auto leading-relaxed">
                    Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ để được tư vấn miễn phí về các sản phẩm hoa tươi đẹp nhất!
                  </p>
                </AdvancedAnimation>
              </div>
            </AdvancedAnimation>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-20 bg-white/60 backdrop-blur-md relative z-10">
          <div className="container mx-auto px-4">
            <AdvancedAnimation animation="magicAppear" delay={0.3}>
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-rose-900 mb-4">
                  Các Cách Liên Hệ
                </h2>
                <p className="text-lg text-rose-700">
                  Chọn cách liên hệ thuận tiện nhất cho bạn
                </p>
              </div>
            </AdvancedAnimation>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {contactMethods.map((method, index) => (
                <AdvancedAnimation
                  key={index}
                  animation={
                    index % 4 === 0 ? "bounceIn" :
                    index % 4 === 1 ? "flipIn" :
                    index % 4 === 2 ? "elasticScale" :
                    "morphIn"
                  }
                  delay={0.15 * index}
                >
                  <InteractiveEffect effect={
                    index % 4 === 0 ? "fireworks" :
                    index % 4 === 1 ? "confetti" :
                    index % 4 === 2 ? "sparkle" :
                    "explosion"
                  }>
                    <Card 
                      className="text-center p-6 border-rose-100 hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-6 hover:rotate-3 bg-gradient-to-br from-white via-rose-50/30 to-pink-50/30 cursor-pointer group"
                      onMouseEnter={() => setActiveContact(index)}
                      onMouseLeave={() => setActiveContact(null)}
                      onClick={() => {
                        if (method.action.startsWith('http') || method.action.startsWith('/')) {
                          window.open(method.action, '_blank');
                        } else if (method.action.startsWith('tel:') || method.action.startsWith('mailto:')) {
                          window.location.href = method.action;
                        }
                      }}
                    >
                      <CardContent className="p-0 relative">
                        <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-lg"
                             style={{background: `linear-gradient(135deg, ${method.color.split(' ')[1]}, ${method.color.split(' ')[3]})`}}></div>
                        
                        <AdvancedAnimation animation="glowPulse" repeat={true}>
                          <method.icon className={`w-12 h-12 bg-gradient-to-r ${method.color} bg-clip-text text-transparent mx-auto mb-4 transform group-hover:scale-125 transition-transform duration-500`} />
                        </AdvancedAnimation>
                        
                        <h3 className="text-xl font-bold text-rose-900 mb-2 group-hover:text-rose-600 transition-colors duration-300">
                          {method.title}
                        </h3>
                        
                        <p className="text-lg font-semibold text-rose-700 mb-2">
                          {method.info}
                        </p>
                        
                        <p className="text-sm text-rose-600">
                          {method.description}
                        </p>
                        
                        <AdvancedAnimation animation="sparkleEntry" delay={1.1 + index * 0.1}>
                          <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Zap className="w-4 h-4 text-yellow-500 mx-auto animate-pulse" />
                          </div>
                        </AdvancedAnimation>
                      </CardContent>
                    </Card>
                  </InteractiveEffect>
                </AdvancedAnimation>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-3 gap-12">
                
                {/* Form */}
                <AdvancedAnimation animation="slideLeft" delay={0.3}>
                  <div className="lg:col-span-2">
                    <Card className="bg-white/90 backdrop-blur-md border-rose-100 shadow-2xl">
                      <CardHeader>
                        <CardTitle className="text-3xl font-bold text-rose-900">
                          Gửi Tin Nhắn
                        </CardTitle>
                        <p className="text-rose-700">
                          Điền thông tin bên dưới và chúng tôi sẽ liên hệ lại sớm nhất có thể
                        </p>
                      </CardHeader>
                      
                      <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            <AdvancedAnimation animation="slideUp" delay={0.1}>
                              <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-rose-800 font-medium">
                                  Họ *
                                </Label>
                                <InteractiveEffect effect="ripple">
                                  <Input
                                    id="firstName"
                                    type="text"
                                    placeholder="Nhập họ của bạn"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="border-rose-200 focus:border-rose-400 focus:ring-rose-400 transform focus:scale-105 transition-all duration-300"
                                    required
                                  />
                                </InteractiveEffect>
                              </div>
                            </AdvancedAnimation>

                            <AdvancedAnimation animation="slideUp" delay={0.15}>
                              <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-rose-800 font-medium">
                                  Tên *
                                </Label>
                                <InteractiveEffect effect="ripple">
                                  <Input
                                    id="lastName"
                                    type="text"
                                    placeholder="Nhập tên của bạn"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="border-rose-200 focus:border-rose-400 focus:ring-rose-400 transform focus:scale-105 transition-all duration-300"
                                    required
                                  />
                                </InteractiveEffect>
                              </div>
                            </AdvancedAnimation>
                          </div>

                          <div className="grid md:grid-cols-2 gap-6">
                            <AdvancedAnimation animation="slideUp" delay={0.2}>
                              <div className="space-y-2">
                                <Label htmlFor="email" className="text-rose-800 font-medium">
                                  Email *
                                </Label>
                                <InteractiveEffect effect="ripple">
                                  <Input
                                    id="email"
                                    type="email"
                                    placeholder="example@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="border-rose-200 focus:border-rose-400 focus:ring-rose-400 transform focus:scale-105 transition-all duration-300"
                                    required
                                  />
                                </InteractiveEffect>
                              </div>
                            </AdvancedAnimation>

                            <AdvancedAnimation animation="slideUp" delay={0.25}>
                              <div className="space-y-2">
                                <Label htmlFor="phone" className="text-rose-800 font-medium">
                                  Số điện thoại
                                </Label>
                                <InteractiveEffect effect="ripple">
                                  <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="0123 456 789"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="border-rose-200 focus:border-rose-400 focus:ring-rose-400 transform focus:scale-105 transition-all duration-300"
                                  />
                                </InteractiveEffect>
                              </div>
                            </AdvancedAnimation>
                          </div>

                          <AdvancedAnimation animation="slideUp" delay={0.3}>
                            <div className="space-y-2">
                              <Label htmlFor="subject" className="text-rose-800 font-medium">
                                Chủ đề
                              </Label>
                              <InteractiveEffect effect="ripple">
                                <Input
                                  id="subject"
                                  type="text"
                                  placeholder="Chủ đề tin nhắn"
                                  value={subject}
                                  onChange={(e) => setSubject(e.target.value)}
                                  className="border-rose-200 focus:border-rose-400 focus:ring-rose-400 transform focus:scale-105 transition-all duration-300"
                                />
                              </InteractiveEffect>
                            </div>
                          </AdvancedAnimation>

                          <AdvancedAnimation animation="slideUp" delay={0.35}>
                            <div className="space-y-2">
                              <Label htmlFor="message" className="text-rose-800 font-medium">
                                Tin nhắn *
                              </Label>
                              <InteractiveEffect effect="ripple">
                                <Textarea
                                  id="message"
                                  placeholder="Nhập tin nhắn của bạn..."
                                  rows={6}
                                  value={messageText}
                                  onChange={(e) => setMessageText(e.target.value)}
                                  className="border-rose-200 focus:border-rose-400 focus:ring-rose-400 transform focus:scale-105 transition-all duration-300 resize-none"
                                  required
                                />
                              </InteractiveEffect>
                            </div>
                          </AdvancedAnimation>

                          {notice && (
                            <AdvancedAnimation animation="bounceIn">
                              <div className={`p-4 rounded-lg flex items-center space-x-2 ${
                                notice.includes("Cảm ơn") 
                                  ? "bg-green-50 border border-green-200 text-green-800" 
                                  : "bg-red-50 border border-red-200 text-red-800"
                              }`}>
                                {notice.includes("Cảm ơn") ? (
                                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                ) : (
                                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                )}
                                {notice}
                              </div>
                            </AdvancedAnimation>
                          )}

                          <AdvancedAnimation animation="elasticScale" delay={0.4}>
                            <InteractiveEffect effect="confetti">
                              <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white py-6 text-lg font-semibold transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isSubmitting ? (
                                  <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                                    Đang gửi...
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center">
                                    <Send className="w-5 h-5 mr-3" />
                                    Gửi Tin Nhắn
                                  </div>
                                )}
                              </Button>
                            </InteractiveEffect>
                          </AdvancedAnimation>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                </AdvancedAnimation>

                {/* Info column aligned with form (stacked on the right at lg) */}
                <AdvancedAnimation animation="slideRight" delay={0.5} className="lg:col-span-1 self-start">
                  <div className="grid grid-cols-1 gap-8">
                    
                    {/* Working Hours */}
                    <Card className="bg-white/90 backdrop-blur-md border-rose-100 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold text-rose-900 flex items-center">
                          <Clock className="w-6 h-6 mr-2 text-rose-600" />
                          Giờ Làm Việc
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {workingHours.map((schedule, index) => (
                            <AdvancedAnimation key={index} animation="slideLeft" delay={0.1 * index}>
                              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100">
                                <span className="font-medium text-rose-800">
                                  {schedule.day}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-rose-700">
                                    {schedule.time}
                                  </span>
                                  <AdvancedAnimation animation="glowPulse" repeat={true}>
                                    <div className={`w-2 h-2 rounded-full ${
                                      schedule.isOpen ? 'bg-green-500' : 'bg-yellow-500'
                                    }`}></div>
                                  </AdvancedAnimation>
                                </div>
                              </div>
                            </AdvancedAnimation>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Social Links */}
                    <Card className="bg-white/90 backdrop-blur-md border-rose-100 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold text-rose-900">
                          Theo Dõi Chúng Tôi
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {socialLinks.map((social, index) => (
                            <AdvancedAnimation 
                              key={index}
                              animation={index % 2 === 0 ? "bounceIn" : "flipIn"}
                              delay={0.1 * index}
                            >
                              <InteractiveEffect effect="sparkle">
                                <Button
                                  variant="outline"
                                  className="w-full border-rose-200 hover:border-rose-400 transform hover:scale-110 transition-all duration-300"
                                  onClick={() => window.open(social.url, '_blank')}
                                >
                                  <social.icon className={`w-5 h-5 mr-2 bg-gradient-to-r ${social.color} bg-clip-text text-transparent`} />
                                  {social.name}
                                </Button>
                              </InteractiveEffect>
                            </AdvancedAnimation>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </AdvancedAnimation>

                {/* FAQ placed under the form (spans 2 columns on lg) */}
                <AdvancedAnimation animation="slideUp" delay={0.55} className="lg:col-span-2">
                  <Card className="bg-white/90 backdrop-blur-md border-rose-100 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-rose-900">
                        Câu Hỏi Thường Gặp
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {faqs.map((faq, index) => (
                          <AdvancedAnimation key={index} animation="slideUp" delay={0.1 * index}>
                            <InteractiveEffect effect="ripple">
                              <div className="p-4 rounded-lg bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 hover:shadow-lg transition-shadow duration-300">
                                <h4 className="font-semibold text-rose-800 mb-2">
                                  {faq.question}
                                </h4>
                                <p className="text-sm text-rose-700">
                                  {faq.answer}
                                </p>
                              </div>
                            </InteractiveEffect>
                          </AdvancedAnimation>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </AdvancedAnimation>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        {/* @ts-ignore */}
        <SiteFooter />
      </div>
    </PageTransition>
  );
}