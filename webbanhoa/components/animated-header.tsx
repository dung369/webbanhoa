"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import HeaderAuth from "@/components/header-auth";
import CartButton from "@/components/cart-button";

export default function AnimatedHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { href: "/", label: "Trang chủ" },
    { href: "/products", label: "Sản phẩm" },
    { href: "/about", label: "Về chúng tôi" },
    { href: "/contact", label: "Liên hệ" }
  ];

  return (
    <motion.header 
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/95 backdrop-blur-md border-b border-rose-100 sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex items-center space-x-2"
          >
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center"
            >
              <span className="text-white font-bold text-lg">H</span>
            </motion.div>
            <div>
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-xl md:text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent"
              >
                Hoa Tươi Việt
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-xs text-rose-500 hidden sm:block"
              >
                Hoa tươi cao cấp
              </motion.p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.nav 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="hidden md:flex items-center space-x-8"
          >
            {menuItems.map((item, index) => (
              <motion.div
                key={item.href}
                whileHover={{ 
                  scale: 1.05,
                  y: -2,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ 
                  scale: 0.95,
                  transition: { duration: 0.1 }
                }}
              >
                <Link
                  href={item.href}
                  className="text-rose-700 hover:text-rose-500 font-medium transition-colors duration-300 relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </motion.div>
            ))}
          </motion.nav>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex items-center space-x-2 md:space-x-4"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:block"
            >
              <Button
                variant="ghost"
                size="sm"
                className="text-rose-700 hover:text-rose-500"
              >
                <Heart className="w-5 h-5" />
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <CartButton />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="hidden sm:block"
            >
              <HeaderAuth />
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-rose-700 hover:text-rose-500 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </motion.div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4 pb-4 border-t border-rose-100"
            >
              <div className="flex flex-col space-y-4 pt-4">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    whileHover={{ 
                      x: 5,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ 
                      scale: 0.95,
                      transition: { duration: 0.1 }
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-rose-700 hover:text-rose-500 font-medium transition-colors duration-300 block py-2 relative group"
                    >
                      {item.label}
                      <span className="absolute -bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  className="flex items-center space-x-4 pt-2"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-700 hover:text-rose-500"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Yêu thích
                  </Button>
                  <HeaderAuth />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}