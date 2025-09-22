"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  direction: number;
}

export default function ParticleBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const colors = [
      "rgba(244, 63, 94, 0.6)",   // rose
      "rgba(236, 72, 153, 0.6)",  // pink
      "rgba(251, 146, 60, 0.6)",  // orange
      "rgba(168, 85, 247, 0.4)",  // purple
      "rgba(59, 130, 246, 0.4)",  // blue
    ];

    const newParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 0.5 + 0.1,
      direction: Math.random() * 360
    }));

    setParticles(newParticles);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Floating Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            filter: "blur(1px)"
          }}
          animate={{
            x: `${particle.x + Math.sin(Date.now() * 0.001 + particle.id) * 20}vw`,
            y: `${particle.y + Math.cos(Date.now() * 0.001 + particle.id) * 20}vh`,
          }}
          transition={{
            duration: 20 + particle.speed * 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}

      {/* Mouse Follower */}
      <motion.div
        className="absolute w-32 h-32 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(244, 63, 94, 0.1) 0%, transparent 70%)",
          filter: "blur(20px)"
        }}
        animate={{
          x: `${mousePosition.x}vw`,
          y: `${mousePosition.y}vh`,
          scale: [1, 1.2, 1]
        }}
        transition={{
          x: { duration: 0.5 },
          y: { duration: 0.5 },
          scale: { duration: 2, repeat: Infinity }
        }}
      />

      {/* Geometric Shapes */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-16 h-16 border border-rose-300 opacity-20"
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 4, repeat: Infinity }
        }}
      />

      <motion.div
        className="absolute top-3/4 right-1/4 w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-30"
        animate={{
          y: [-20, 20, -20],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute top-1/2 right-1/3 w-8 h-8 bg-gradient-to-r from-orange-400 to-yellow-400 transform rotate-45 opacity-25"
        animate={{
          rotate: [45, 225, 45],
          x: [-10, 10, -10]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Light Rays */}
      <motion.div
        className="absolute top-0 left-1/2 w-1 h-full bg-gradient-to-b from-transparent via-rose-300 to-transparent opacity-10"
        animate={{
          rotate: [0, 360]
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ transformOrigin: "50% 100%" }}
      />

      <motion.div
        className="absolute top-0 right-1/4 w-1 h-full bg-gradient-to-b from-transparent via-pink-300 to-transparent opacity-10"
        animate={{
          rotate: [180, -180]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ transformOrigin: "50% 100%" }}
      />
    </div>
  );
}