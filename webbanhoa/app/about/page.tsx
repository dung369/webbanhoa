"use client";

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
} from "lucide-react";
import CartButton from '@/components/cart-button';
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import { useState } from "react";

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState("story");

  const teamMembers = [
    {
      name: "Trần Đại Dũng",
      role: "Nhóm trưởng",
      image: "/images/Hoa Hồng Đỏ Ecuador.jpg",
      description:
        "Lãnh đạo đội ngũ với tầm nhìn chiến lược và kinh nghiệm quản lý",
    },
    {
      name: "Võ Hoàng Duy Nam",
      role: "Thành viên",
      image: "/images/Hoa Tulip Hà Lan.jpg",
      description: "Chuyên gia về thiết kế và cắm hoa nghệ thuật",
    },
    {
      name: "Nguyễn Ngọc Bảo",
      role: "Thành viên",
      image: "/images/Hoa Cẩm Tú Cầu.jpg",
      description: "Chuyên viên phát triển sản phẩm và marketing",
    },
    {
      name: "Nguyễn Huỳnh Đức Duy",
      role: "Thành viên",
      image: "/images/Hoa Lan Hồ Điệp.jpg",
      description: "Chuyên gia về logistics và quản lý kho hàng",
    },
    {
      name: "Võ Nhật Triều",
      role: "Thành viên",
      image: "/images/Hoa Lavender.jpg",
      description: "Chuyên viên chăm sóc khách hàng và dịch vụ",
    },
  ];

  const achievements = [
    { icon: Users, number: "10,000+", label: "Khách hàng hài lòng" },
    { icon: Award, number: "50+", label: "Giải thưởng" },
    { icon: Truck, number: "99%", label: "Giao hàng đúng hẹn" },
    { icon: Star, number: "4.9/5", label: "Đánh giá trung bình" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50">
      <SiteHeader />

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 mb-4">
              Về chúng tôi
            </Badge>
            <h1 className="text-5xl font-bold text-rose-900 mb-6">
              Câu Chuyện Của
              <span className="block bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                Hoa Tươi Việt
              </span>
            </h1>
            <p className="text-xl text-rose-700 max-w-3xl mx-auto leading-relaxed">
              Từ một cửa hàng nhỏ đến thương hiệu hoa tươi hàng đầu Việt Nam,
              chúng tôi luôn cam kết mang đến những bông hoa đẹp nhất cho khách
              hàng.
            </p>
          </div>

          {/* Achievements */}
          <div className="grid md:grid-cols-4 gap-8 mb-20">
            {achievements.map((achievement, index) => (
              <Card
                key={index}
                className="text-center p-6 border-rose-100 hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-0">
                  <achievement.icon className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                  <h3 className="text-3xl font-bold text-rose-900 mb-2">
                    {achievement.number}
                  </h3>
                  <p className="text-rose-700">{achievement.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Tabs Section */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-12">
              <div className="bg-white rounded-full p-2 shadow-lg">
                <Button
                  variant={activeTab === "story" ? "default" : "ghost"}
                  onClick={() => setActiveTab("story")}
                  className={
                    activeTab === "story"
                      ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white"
                      : "text-rose-700"
                  }
                >
                  Câu chuyện
                </Button>
                <Button
                  variant={activeTab === "mission" ? "default" : "ghost"}
                  onClick={() => setActiveTab("mission")}
                  className={
                    activeTab === "mission"
                      ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white"
                      : "text-rose-700"
                  }
                >
                  Sứ mệnh
                </Button>
                <Button
                  variant={activeTab === "values" ? "default" : "ghost"}
                  onClick={() => setActiveTab("values")}
                  className={
                    activeTab === "values"
                      ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white"
                      : "text-rose-700"
                  }
                >
                  Giá trị
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl">
              {activeTab === "story" && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-rose-900 mb-6">
                    Câu Chuyện Của Chúng Tôi
                  </h2>
                  <p className="text-lg text-rose-700 leading-relaxed">
                    Hoa Tươi Việt được thành lập vào năm 2010 bởi chị Nguyễn Thị
                    Hoa với niềm đam mê mãnh liệt dành cho hoa tươi. Bắt đầu từ
                    một cửa hàng nhỏ tại Đà Lạt, chúng tôi đã không ngừng phát
                    triển và mở rộng.
                  </p>
                  <p className="text-lg text-rose-700 leading-relaxed">
                    Ngày nay, Hoa Tươi Việt đã trở thành một trong những thương
                    hiệu hoa tươi uy tín nhất tại Việt Nam, với hệ thống cửa
                    hàng trải dài khắp cả nước và dịch vụ giao hàng toàn quốc.
                  </p>
                </div>
              )}

              {activeTab === "mission" && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-rose-900 mb-6">
                    Sứ Mệnh Của Chúng Tôi
                  </h2>
                  <p className="text-lg text-rose-700 leading-relaxed">
                    Chúng tôi cam kết mang đến những bông hoa tươi đẹp nhất,
                    chất lượng cao nhất để làm đẹp cuộc sống và truyền tải những
                    thông điệp yêu thương, chân thành nhất.
                  </p>
                  <p className="text-lg text-rose-700 leading-relaxed">
                    Với đội ngũ florist chuyên nghiệp và hệ thống logistics hiện
                    đại, chúng tôi luôn đảm bảo mỗi bông hoa đến tay khách hàng
                    đều tươi mới và hoàn hảo nhất.
                  </p>
                </div>
              )}

              {activeTab === "values" && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-rose-900 mb-6">
                    Giá Trị Cốt Lõi
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-rose-800">
                        Chất Lượng
                      </h3>
                      <p className="text-rose-700">
                        Chỉ chọn lọc những bông hoa tươi nhất, đẹp nhất từ các
                        vườn hoa uy tín.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-rose-800">
                        Tận Tâm
                      </h3>
                      <p className="text-rose-700">
                        Phục vụ khách hàng với tất cả sự chân thành và nhiệt
                        huyết.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-rose-800">
                        Sáng Tạo
                      </h3>
                      <p className="text-rose-700">
                        Không ngừng đổi mới trong thiết kế và cách thức phục vụ.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-rose-800">
                        Uy Tín
                      </h3>
                      <p className="text-rose-700">
                        Luôn giữ lời hứa và cam kết với khách hàng.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 mb-4">
              Đội ngũ
            </Badge>
            <h2 className="text-4xl font-bold text-rose-900 mb-4">
              Gặp Gỡ Đội Ngũ
            </h2>
            <p className="text-xl text-rose-700 max-w-2xl mx-auto">
              Những con người tài năng và đam mê đứng sau thành công của Hoa
              Tươi Việt
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
              {teamMembers.map((member, index) => (
                <Card
                  key={index}
                  className="text-center border-rose-100 hover:shadow-xl transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    />
                    <h3 className="text-lg font-bold text-rose-900 mb-2">
                      {member.name}
                    </h3>
                    <p className="text-rose-600 font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-rose-700 text-sm">
                      {member.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-rose-900 mb-4">
                Liên Hệ Với Chúng Tôi
              </h2>
              <p className="text-xl text-rose-700">
                Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center p-6 border-rose-100">
                <CardContent className="p-0">
                  <Phone className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-rose-900 mb-2">
                    Điện thoại
                  </h3>
                  <p className="text-rose-700">0123 456 789</p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 border-rose-100">
                <CardContent className="p-0">
                  <MapPin className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-rose-900 mb-2">
                    Địa chỉ
                  </h3>
                  <p className="text-rose-700">123 Đường Hoa, Quận 1, TP.HCM</p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 border-rose-100">
                <CardContent className="p-0">
                  <Mail className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-rose-900 mb-2">
                    Email
                  </h3>
                  <p className="text-rose-700">contact@hoatuoiviet.com</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* Footer (centralized) */}
      {/* @ts-ignore */}
      <SiteFooter />
    </div>
  );
}
