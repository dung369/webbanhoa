"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Petal {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
}

export default function FloatingPetals() {
  const [petals, setPetals] = useState<Petal[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const petalColors = ["🌸", "🌺", "🌷", "🌹", "💐"];
    // Reduce petals on mobile for better performance
    const petalCount = isMobile ? 4 : 8;
    
    const newPetals: Petal[] = Array.from({ length: petalCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 4,
      size: isMobile ? 0.3 + Math.random() * 0.5 : 0.5 + Math.random() * 0.8,
      color: petalColors[Math.floor(Math.random() * petalColors.length)]
    }));
    setPetals(newPetals);

    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobile]);

  // Disable on very small screens or prefer-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setPetals([]);
    }
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          initial={{ 
            y: -100, 
            x: `${petal.x}vw`,
            opacity: 0,
            rotate: 0
          }}
          animate={{ 
            y: "100vh", 
            opacity: [0, 1, 1, 0],
            rotate: 360
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute text-2xl"
          style={{ fontSize: `${petal.size}rem` }}
        >
          {petal.color}
        </motion.div>
      ))}
    </div>
  );
}