"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  ShoppingCart,
  Star,
  Users,
  Award,
  Truck,
  Phone,
  MapPin,
  Mail,
  Sparkles,
  Target,
  Lightbulb,
  Shield,
} from "lucide-react";
import CartButton from "@/components/cart-button";
import AnimatedHeader from "@/components/animated-header";
import PageTransition from "@/components/page-transition";
import AdvancedAnimation from "@/components/advanced-animation";
import InteractiveEffect from "@/components/interactive-effect";
import ParticleBackground from "@/components/particle-background";
import SiteFooter from "@/components/site-footer";

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState("story");

  const teamMembers = [
    {
      name: "Trần Đại Dũng",
      role: "Nhóm trưởng",
      image: "/images/Hoa Hồng Đỏ Ecuador.jpg",
      description: "Lãnh đạo đội ngũ với tầm nhìn chiến lược và kinh nghiệm quản lý",
      specialty: "Quản lý & Chiến lược",
      experience: "10+ năm",
    },
    {
      name: "Võ Hoàng Duy Nam",
      role: "Thành viên",
      image: "/images/Hoa Tulip Hà Lan.jpg",
      description: "Chuyên gia về thiết kế và cắm hoa nghệ thuật",
      specialty: "Thiết kế & Nghệ thuật",
      experience: "8+ năm",
    },
    {
      name: "Nguyễn Ngọc Bảo",
      role: "Thành viên",
      image: "/images/Hoa Cẩm Tú Cầu.jpg",
      description: "Chuyên viên phát triển sản phẩm và marketing",
      specialty: "Marketing & Sản phẩm",
      experience: "6+ năm",
    },
    {
      name: "Nguyễn Huỳnh Đức Duy",
      role: "Thành viên",
      image: "/images/Hoa Lan Hồ Điệp.jpg",
      description: "Chuyên gia về logistics và quản lý kho hàng",
      specialty: "Logistics & Vận hành",
      experience: "7+ năm",
    },
    {
      name: "Võ Nhật Triều",
      role: "Thành viên",
      image: "/images/Hoa Lavender.jpg",
      description: "Chuyên viên chăm sóc khách hàng và dịch vụ",
      specialty: "Chăm sóc khách hàng",
      experience: "5+ năm",
    },
  ];

  const achievements = [
    { icon: Users, number: "10,000+", label: "Khách hàng hài lòng", color: "from-rose-500 to-pink-500" },
    { icon: Award, number: "50+", label: "Giải thưởng", color: "from-yellow-500 to-orange-500" },
    { icon: Truck, number: "99%", label: "Giao hàng đúng hẹn", color: "from-green-500 to-emerald-500" },
    { icon: Star, number: "4.9/5", label: "Đánh giá trung bình", color: "from-blue-500 to-purple-500" },
  ];

  const values = [
    {
      icon: Shield,
      title: "Chất Lượng",
      description: "Chỉ chọn lọc những bông hoa tươi nhất, đẹp nhất từ các vườn hoa uy tín.",
      color: "from-rose-500 to-pink-500"
    },
    {
      icon: Heart,
      title: "Tận Tâm",
      description: "Phục vụ khách hàng với tất cả sự chân thành và nhiệt huyết.",
      color: "from-red-500 to-rose-500"
    },
    {
      icon: Lightbulb,
      title: "Sáng Tạo",
      description: "Không ngừng đổi mới trong thiết kế và cách thức phục vụ.",
      color: "from-yellow-500 to-amber-500"
    },
    {
      icon: Target,
      title: "Uy Tín",
      description: "Luôn giữ lời hứa và cam kết với khách hàng.",
      color: "from-blue-500 to-cyan-500"
    },
  ];

  const milestones = [
    { year: "2010", event: "Thành lập cửa hàng đầu tiên tại Đà Lạt", icon: "🌱" },
    { year: "2015", event: "Mở rộng ra TP.HCM và Hà Nội", icon: "🌿" },
    { year: "2018", event: "Ra mắt dịch vụ giao hàng toàn quốc", icon: "🚚" },
    { year: "2020", event: "Phát triển platform online hiện đại", icon: "💻" },
    { year: "2023", event: "Đạt 10,000+ khách hàng tin tưởng", icon: "🎉" },
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
                    <Sparkles className="w-4 h-4 mr-2" />
                    Về chúng tôi
                  </Badge>
                </InteractiveEffect>
                
                <h1 className="text-6xl font-bold text-rose-900 mb-6">
                  Câu Chuyện Của
                  <AdvancedAnimation animation="glowPulse" repeat={true}>
                    <span className="block bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                      Hoa Tươi Việt
                    </span>
                  </AdvancedAnimation>
                </h1>
                
                <AdvancedAnimation animation="slideUp" delay={1.5}>
                  <p className="text-xl text-rose-700 max-w-3xl mx-auto leading-relaxed">
                    Từ một cửa hàng nhỏ đến thương hiệu hoa tươi hàng đầu Việt Nam, chúng tôi luôn cam kết mang đến những bông hoa đẹp nhất cho khách hàng.
                  </p>
                </AdvancedAnimation>
              </div>
            </AdvancedAnimation>

            {/* Achievements */}
            <div className="grid md:grid-cols-4 gap-8 mb-20">
              {achievements.map((achievement, index) => (
                <AdvancedAnimation
                  key={index}
                  animation={
                    index % 4 === 0 ? "bounceIn" :
                    index % 4 === 1 ? "flipIn" :
                    index % 4 === 2 ? "elasticScale" :
                    "morphIn"
                  }
                  delay={0.2 * index}
                >
                  <InteractiveEffect effect="confetti">
                    <Card className="text-center p-6 border-rose-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-2 bg-gradient-to-br from-white via-rose-50/30 to-pink-50/30">
                      <CardContent className="p-0 relative">
                        <div className="absolute inset-0 bg-gradient-to-br opacity-0 hover:opacity-20 transition-opacity duration-500 rounded-lg"
                             style={{background: `linear-gradient(135deg, ${achievement.color.split(' ')[1]}, ${achievement.color.split(' ')[3]})`}}></div>
                        
                        <AdvancedAnimation animation="glowPulse" repeat={true}>
                          <achievement.icon className={`w-12 h-12 bg-gradient-to-r ${achievement.color} bg-clip-text text-transparent mx-auto mb-4`} />
                        </AdvancedAnimation>
                        
                        <h3 className="text-4xl font-bold text-rose-900 mb-2">
                          {achievement.number}
                        </h3>
                        
                        <p className="text-rose-700 font-medium">
                          {achievement.label}
                        </p>
                      </CardContent>
                    </Card>
                  </InteractiveEffect>
                </AdvancedAnimation>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <AdvancedAnimation animation="fadeIn" delay={0.5}>
          <section className="py-20 bg-white/60 backdrop-blur-md relative z-10">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <AdvancedAnimation animation="sparkleEntry" delay={0.2}>
                  <h2 className="text-5xl font-bold text-rose-900 mb-4">
                    Hành Trình Phát Triển
                  </h2>
                </AdvancedAnimation>
                <p className="text-xl text-rose-700 max-w-2xl mx-auto">
                  Những cột mốc quan trọng trong hành trình xây dựng thương hiệu
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                {milestones.map((milestone, index) => (
                  <AdvancedAnimation
                    key={index}
                    animation={index % 2 === 0 ? "slideLeft" : "slideRight"}
                    delay={0.2 * index}
                  >
                    <InteractiveEffect effect="ripple">
                      <div className={`flex items-center mb-12 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                        <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                          <Card className="bg-gradient-to-br from-white via-rose-50/50 to-pink-50/50 border-rose-100 hover:shadow-xl transition-all duration-500 transform hover:scale-105">
                            <CardContent className="p-6">
                              <div className="text-3xl mb-2">
                                {milestone.icon}
                              </div>
                              <h3 className="text-2xl font-bold text-rose-900 mb-2">
                                {milestone.year}
                              </h3>
                              <p className="text-rose-700">
                                {milestone.event}
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <div className="w-4 h-4 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full relative z-10 flex-shrink-0">
                          <AdvancedAnimation animation="glowPulse" repeat={true}>
                            <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full animate-ping"></div>
                          </AdvancedAnimation>
                        </div>
                        
                        <div className="w-1/2"></div>
                      </div>
                    </InteractiveEffect>
                  </AdvancedAnimation>
                ))}
              </div>
            </div>
          </section>
        </AdvancedAnimation>

        {/* Dynamic Tabs Section */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-4">
            <AdvancedAnimation animation="magicAppear" delay={0.3}>
              <div className="max-w-4xl mx-auto">
                <div className="flex justify-center mb-12">
                  <InteractiveEffect effect="sparkle">
                    <div className="bg-white/80 backdrop-blur-md rounded-full p-2 shadow-2xl border border-rose-100">
                      {["story", "mission", "values"].map((tab, index) => (
                        <AdvancedAnimation key={tab} animation="elasticScale" delay={0.1 * index}>
                          <Button
                            variant={activeTab === tab ? "default" : "ghost"}
                            onClick={() => setActiveTab(tab)}
                            className={`transition-all duration-500 transform hover:scale-110 ${
                              activeTab === tab
                                ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg"
                                : "text-rose-700 hover:text-rose-900 hover:bg-rose-50"
                            }`}
                          >
                            {tab === "story" ? "Câu chuyện" : tab === "mission" ? "Sứ mệnh" : "Giá trị"}
                          </Button>
                        </AdvancedAnimation>
                      ))}
                    </div>
                  </InteractiveEffect>
                </div>

                <AdvancedAnimation animation="morphIn" delay={0.5}>
                  <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-rose-100">
                    {activeTab === "story" && (
                      <AdvancedAnimation animation="fadeIn">
                        <div className="space-y-6">
                          <h2 className="text-4xl font-bold text-rose-900 mb-6">
                            Câu Chuyện Của Chúng Tôi
                          </h2>
                          <p className="text-lg text-rose-700 leading-relaxed">
                            Hoa Tươi Việt được thành lập vào năm 2010 bởi chị Nguyễn Thị Hoa với niềm đam mê mãnh liệt dành cho hoa tươi. Bắt đầu từ một cửa hàng nhỏ tại Đà Lạt, chúng tôi đã không ngừng phát triển và mở rộng.
                          </p>
                          <p className="text-lg text-rose-700 leading-relaxed">
                            Ngày nay, Hoa Tươi Việt đã trở thành một trong những thương hiệu hoa tươi uy tín nhất tại Việt Nam, với hệ thống cửa hàng trải dài khắp cả nước và dịch vụ giao hàng toàn quốc.
                          </p>
                        </div>
                      </AdvancedAnimation>
                    )}

                    {activeTab === "mission" && (
                      <AdvancedAnimation animation="fadeIn">
                        <div className="space-y-6">
                          <h2 className="text-4xl font-bold text-rose-900 mb-6">
                            Sứ Mệnh Của Chúng Tôi
                          </h2>
                          <p className="text-lg text-rose-700 leading-relaxed">
                            Chúng tôi cam kết mang đến những bông hoa tươi đẹp nhất, chất lượng cao nhất để làm đẹp cuộc sống và truyền tải những thông điệp yêu thương, chân thành nhất.
                          </p>
                          <p className="text-lg text-rose-700 leading-relaxed">
                            Với đội ngũ florist chuyên nghiệp và hệ thống logistics hiện đại, chúng tôi luôn đảm bảo mỗi bông hoa đến tay khách hàng đều tươi mới và hoàn hảo nhất.
                          </p>
                        </div>
                      </AdvancedAnimation>
                    )}

                    {activeTab === "values" && (
                      <AdvancedAnimation animation="fadeIn">
                        <div className="space-y-6">
                          <h2 className="text-4xl font-bold text-rose-900 mb-6">
                            Giá Trị Cốt Lõi
                          </h2>
                          <div className="grid md:grid-cols-2 gap-6">
                            {values.map((value, index) => (
                              <AdvancedAnimation 
                                key={index}
                                animation={index % 2 === 0 ? "slideLeft" : "slideRight"}
                                delay={0.2 * index}
                              >
                                <InteractiveEffect effect="ripple">
                                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-100 hover:shadow-lg transition-all duration-500 transform hover:scale-105">
                                    <AdvancedAnimation animation="glowPulse" repeat={true}>
                                      <value.icon className={`w-8 h-8 bg-gradient-to-r ${value.color} bg-clip-text text-transparent mb-3`} />
                                    </AdvancedAnimation>
                                    <h3 className="text-xl font-semibold text-rose-800 mb-3">
                                      {value.title}
                                    </h3>
                                    <p className="text-rose-700">
                                      {value.description}
                                    </p>
                                  </div>
                                </InteractiveEffect>
                              </AdvancedAnimation>
                            ))}
                          </div>
                        </div>
                      </AdvancedAnimation>
                    )}
                  </div>
                </AdvancedAnimation>
              </div>
            </AdvancedAnimation>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-white/60 backdrop-blur-md relative z-10">
          <div className="container mx-auto px-4">
            <AdvancedAnimation animation="slideUp" delay={0.2}>
              <div className="text-center mb-16">
                <InteractiveEffect effect="sparkle">
                  <Badge className="bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 hover:from-rose-200 hover:to-pink-200 mb-4 transform hover:scale-110 transition-all duration-300">
                    <Users className="w-4 h-4 mr-2" />
                    Đội ngũ
                  </Badge>
                </InteractiveEffect>
                <h2 className="text-5xl font-bold text-rose-900 mb-4">
                  Gặp Gỡ Đội Ngũ
                </h2>
                <p className="text-xl text-rose-700 max-w-2xl mx-auto">
                  Những con người tài năng và đam mê đứng sau thành công của Hoa Tươi Việt
                </p>
              </div>
            </AdvancedAnimation>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
              {teamMembers.map((member, index) => (
                <AdvancedAnimation
                  key={index}
                  animation={
                    index % 5 === 0 ? "magicAppear" :
                    index % 5 === 1 ? "slideUp" :
                    index % 5 === 2 ? "bounceIn" :
                    index % 5 === 3 ? "flipIn" :
                    "elasticScale"
                  }
                  delay={0.15 * index}
                >
                  <InteractiveEffect effect={
                    index % 5 === 0 ? "fireworks" :
                    index % 5 === 1 ? "confetti" :
                    index % 5 === 2 ? "sparkle" :
                    index % 5 === 3 ? "explosion" :
                    "ripple"
                  }>
                    <Card className="text-center border-rose-100 hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-6 hover:rotate-3 bg-gradient-to-br from-white via-rose-50/30 to-pink-50/30 overflow-hidden group">
                      <CardContent className="p-6 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-100/50 to-pink-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        <div className="relative z-10">
                          <AdvancedAnimation animation="glowPulse" repeat={true}>
                            <div className="relative mb-4">
                              <img
                                src={member.image || "/placeholder.svg"}
                                alt={member.name}
                                className="w-24 h-24 rounded-full mx-auto object-cover group-hover:scale-110 transition-transform duration-500 border-4 border-rose-200 group-hover:border-rose-400"
                              />
                              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </div>
                          </AdvancedAnimation>
                          
                          <h3 className="text-lg font-bold text-rose-900 mb-2 group-hover:text-rose-600 transition-colors duration-300">
                            {member.name}
                          </h3>
                          
                          <p className="text-rose-600 font-medium mb-2">
                            {member.role}
                          </p>
                          
                          <Badge className="bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 text-xs mb-3 transform group-hover:scale-110 transition-transform duration-300">
                            {member.specialty}
                          </Badge>
                          
                          <p className="text-rose-700 text-sm mb-3">
                            {member.description}
                          </p>
                          
                          <div className="flex items-center justify-center space-x-1 text-xs text-rose-500">
                            <span>⏱</span>
                            {member.experience}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </InteractiveEffect>
                </AdvancedAnimation>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-4">
            <AdvancedAnimation animation="magicAppear" delay={0.3}>
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-5xl font-bold text-rose-900 mb-4">
                    Liên Hệ Với Chúng Tôi
                  </h2>
                  <p className="text-xl text-rose-700">
                    Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    { icon: Phone, title: "Điện thoại", info: "0123 456 789", color: "from-green-500 to-emerald-500" },
                    { icon: MapPin, title: "Địa chỉ", info: "123 Đường Hoa, Quận 1, TP.HCM", color: "from-blue-500 to-cyan-500" },
                    { icon: Mail, title: "Email", info: "contact@hoatuoiviet.com", color: "from-purple-500 to-pink-500" }
                  ].map((contact, index) => (
                    <AdvancedAnimation
                      key={index}
                      animation={
                        index % 3 === 0 ? "bounceIn" :
                        index % 3 === 1 ? "flipIn" :
                        "elasticScale"
                      }
                      delay={0.2 * index}
                    >
                      <InteractiveEffect effect="confetti">
                        <Card className="text-center p-6 border-rose-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-2 bg-gradient-to-br from-white via-rose-50/30 to-pink-50/30">
                          <CardContent className="p-0 relative">
                            <div className="absolute inset-0 bg-gradient-to-br opacity-0 hover:opacity-20 transition-opacity duration-500 rounded-lg"
                                 style={{background: `linear-gradient(135deg, ${contact.color.split(' ')[1]}, ${contact.color.split(' ')[3]})`}}></div>
                            
                            <AdvancedAnimation animation="glowPulse" repeat={true}>
                              <contact.icon className={`w-12 h-12 bg-gradient-to-r ${contact.color} bg-clip-text text-transparent mx-auto mb-4`} />
                            </AdvancedAnimation>
                            
                            <h3 className="text-lg font-semibold text-rose-900 mb-2">
                              {contact.title}
                            </h3>
                            
                            <p className="text-rose-700">
                              {contact.info}
                            </p>
                          </CardContent>
                        </Card>
                      </InteractiveEffect>
                    </AdvancedAnimation>
                  ))}
                </div>
              </div>
            </AdvancedAnimation>
          </div>
        </section>

        {/* Footer */}
        {/* @ts-ignore */}
        <SiteFooter />
      </div>
    </PageTransition>
  );
}