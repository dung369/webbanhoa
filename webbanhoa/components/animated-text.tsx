"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface AnimatedTextProps {
  text: string;
  effect?: "typewriter" | "slideIn" | "rainbow" | "glitch" | "wave" | "matrix";
  className?: string;
  delay?: number;
}

export default function AnimatedText({ 
  text, 
  effect = "typewriter",
  className = "",
  delay = 0
}: AnimatedTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (effect === "typewriter") {
      const timer = setTimeout(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        }
      }, 100 + delay * 1000);

      return () => clearTimeout(timer);
    } else {
      setDisplayedText(text);
    }
  }, [currentIndex, text, effect, delay]);

  const renderEffect = () => {
    switch (effect) {
      case "typewriter":
        return (
          <span className={className}>
            {displayedText}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-0.5 h-6 bg-current ml-1"
            />
          </span>
        );

      case "slideIn":
        return (
          <div className="inline-block">
            {text.split("").map((char, index) => (
              <motion.span
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ 
                  delay: delay + index * 0.05,
                  duration: 0.6 
                }}
                className={`inline-block ${className}`}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </div>
        );

      case "rainbow":
        return (
          <motion.div
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
            className={`bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent bg-300% ${className}`}
          >
            {text}
          </motion.div>
        );

      case "glitch":
        return (
          <motion.div
            animate={{
              x: [0, -2, 2, 0],
              textShadow: [
                "0 0 0 transparent",
                "2px 0 0 #ff0000, -2px 0 0 #00ffff",
                "-2px 0 0 #ff0000, 2px 0 0 #00ffff",
                "0 0 0 transparent"
              ]
            }}
            transition={{
              duration: 0.2,
              repeat: Infinity,
              repeatDelay: 2
            }}
            className={className}
          >
            {text}
          </motion.div>
        );

      case "wave":
        return (
          <div className="inline-block">
            {text.split("").map((char, index) => (
              <motion.span
                key={index}
                animate={{
                  y: [0, -10, 0]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: delay + index * 0.1
                }}
                className={`inline-block ${className}`}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </div>
        );

      case "matrix":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay }}
            className={`font-mono ${className}`}
          >
            {text.split("").map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0, 1, 0.7, 1],
                  color: [
                    "#00ff00",
                    "#ffffff", 
                    "#00ff00",
                    "#ffffff"
                  ]
                }}
                transition={{
                  delay: delay + index * 0.05,
                  duration: 1,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
                className="inline-block"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.div>
        );

      default:
        return <span className={className}>{text}</span>;
    }
  };

  return renderEffect();
}