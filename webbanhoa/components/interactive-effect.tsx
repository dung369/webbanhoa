"use client";

import { motion } from "framer-motion";
import { ReactNode, useState } from "react";

interface InteractiveEffectProps {
  children: ReactNode;
  effect?: "fireworks" | "ripple" | "confetti" | "sparkle" | "explosion";
  className?: string;
}

export default function InteractiveEffect({ 
  children, 
  effect = "ripple",
  className = ""
}: InteractiveEffectProps) {
  const [isTriggered, setIsTriggered] = useState(false);

  const handleClick = () => {
    setIsTriggered(true);
    setTimeout(() => setIsTriggered(false), 1000);
  };

  const renderEffect = () => {
    if (!isTriggered) return null;

    switch (effect) {
      case "fireworks":
        return (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 8 }, (_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  scale: 0, 
                  x: 0, 
                  y: 0,
                  opacity: 1
                }}
                animate={{ 
                  scale: [0, 1, 0],
                  x: Math.cos(i * 45 * Math.PI / 180) * 50,
                  y: Math.sin(i * 45 * Math.PI / 180) * 50,
                  opacity: [1, 1, 0]
                }}
                transition={{ duration: 0.6 }}
                className="absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full"
              />
            ))}
          </div>
        );

      case "ripple":
        return (
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 rounded-full border-2 border-rose-500 pointer-events-none"
          />
        );

      case "confetti":
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 12 }, (_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  y: 0, 
                  x: 0,
                  rotate: 0,
                  opacity: 1
                }}
                animate={{ 
                  y: -100 - Math.random() * 50,
                  x: (Math.random() - 0.5) * 100,
                  rotate: Math.random() * 360,
                  opacity: 0
                }}
                transition={{ 
                  duration: 1 + Math.random() * 0.5,
                  ease: "easeOut"
                }}
                className={`absolute top-1/2 left-1/2 w-2 h-2 ${
                  ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'][i % 6]
                } transform -translate-x-1/2 -translate-y-1/2`}
              />
            ))}
          </div>
        );

      case "sparkle":
        return (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 6 }, (_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  scale: 0,
                  rotate: 0,
                  opacity: 0
                }}
                animate={{ 
                  scale: [0, 1.5, 0],
                  rotate: [0, 180, 360],
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 0.8,
                  delay: i * 0.1
                }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${30 + Math.random() * 40}%`,
                  top: `${30 + Math.random() * 40}%`
                }}
              >
                ✨
              </motion.div>
            ))}
          </div>
        );

      case "explosion":
        return (
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ 
                scale: [0, 2, 3],
                opacity: [1, 0.8, 0]
              }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-gradient-radial from-yellow-400 via-orange-500 to-transparent rounded-full"
            />
            {Array.from({ length: 16 }, (_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  scale: 0,
                  x: 0,
                  y: 0,
                  opacity: 1
                }}
                animate={{ 
                  scale: [0, 1, 0],
                  x: Math.cos(i * 22.5 * Math.PI / 180) * (30 + Math.random() * 30),
                  y: Math.sin(i * 22.5 * Math.PI / 180) * (30 + Math.random() * 30),
                  opacity: [1, 1, 0]
                }}
                transition={{ 
                  duration: 0.7,
                  delay: Math.random() * 0.2
                }}
                className="absolute top-1/2 left-1/2 w-1 h-1 bg-yellow-400 rounded-full"
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
      {renderEffect()}
    </motion.div>
  );
}