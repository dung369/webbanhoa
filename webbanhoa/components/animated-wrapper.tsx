"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedWrapperProps {
  children: ReactNode;
  animation?: "fadeIn" | "slideUp" | "slideLeft" | "slideRight" | "scale" | "bounce";
  delay?: number;
  duration?: number;
  className?: string;
}

const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.6 }
  },
  slideUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  },
  slideLeft: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6 }
  },
  slideRight: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6 }
  },
  bounce: {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, type: "spring", bounce: 0.4 }
  }
};

export default function AnimatedWrapper({ 
  children, 
  animation = "fadeIn", 
  delay = 0, 
  duration = 0.6,
  className = ""
}: AnimatedWrapperProps) {
  const selectedAnimation = animations[animation];
  
  return (
    <motion.div
      initial={selectedAnimation.initial}
      animate={selectedAnimation.animate}
      transition={{
        delay,
        duration
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}