"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AdvancedAnimationProps {
  children: ReactNode;
  animation?: 
    | "magicAppear" 
    | "bounceIn" 
    | "spiralIn" 
    | "flipIn" 
    | "glowPulse"
    | "morphIn"
    | "elasticScale"
    | "floatingBounce"
    | "sparkleEntry"
    | "liquidWave"
    | "prismShift"
    | "slideUp"
    | "slideLeft"
    | "slideRight"
    | "fadeIn";
  delay?: number;
  duration?: number;
  className?: string;
  repeat?: boolean;
}

const advancedAnimations = {
  magicAppear: {
    initial: { 
      opacity: 0, 
      scale: 0.3, 
      rotateY: 180,
      filter: "blur(10px)"
    },
    animate: { 
      opacity: 1, 
      scale: 1, 
      rotateY: 0,
      filter: "blur(0px)"
    },
    transition: { 
      duration: 1.2,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  
  bounceIn: {
    initial: { 
      opacity: 0, 
      scale: 0.3,
      y: -100
    },
    animate: { 
      opacity: 1, 
      scale: [0.3, 1.1, 0.9, 1],
      y: [0, -20, 10, 0]
    },
    transition: { 
      duration: 0.8,
      times: [0, 0.3, 0.6, 1]
    }
  },

  spiralIn: {
    initial: { 
      opacity: 0, 
      scale: 0,
      rotate: -360
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      rotate: 0
    },
    transition: { 
      duration: 1,
      ease: "easeOut"
    }
  },

  flipIn: {
    initial: { 
      opacity: 0, 
      rotateX: -90,
      transformPerspective: 1000
    },
    animate: { 
      opacity: 1, 
      rotateX: 0
    },
    transition: { 
      duration: 0.8,
      ease: "backOut"
    }
  },

  glowPulse: {
    initial: { 
      opacity: 0.5,
      scale: 0.8,
      filter: "brightness(0.5)"
    },
    animate: { 
      opacity: [0.5, 1, 0.8, 1],
      scale: [0.8, 1.05, 0.95, 1],
      filter: [
        "brightness(0.5) drop-shadow(0 0 5px rgba(244, 63, 94, 0.3))",
        "brightness(1.2) drop-shadow(0 0 20px rgba(244, 63, 94, 0.8))",
        "brightness(0.9) drop-shadow(0 0 10px rgba(244, 63, 94, 0.5))",
        "brightness(1) drop-shadow(0 0 15px rgba(244, 63, 94, 0.6))"
      ]
    },
    transition: { 
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },

  morphIn: {
    initial: { 
      opacity: 0,
      borderRadius: "50%",
      scale: 0
    },
    animate: { 
      opacity: 1,
      borderRadius: ["50%", "20%", "0%"],
      scale: [0, 1.2, 1]
    },
    transition: { 
      duration: 1.5,
      times: [0, 0.6, 1]
    }
  },

  elasticScale: {
    initial: { 
      scale: 0,
      opacity: 0
    },
    animate: { 
      scale: [0, 1.3, 0.8, 1.1, 1],
      opacity: 1
    },
    transition: { 
      duration: 1.5,
      ease: "easeOut"
    }
  },

  floatingBounce: {
    initial: { 
      y: 50,
      opacity: 0
    },
    animate: { 
      y: [50, -10, 5, -5, 0],
      opacity: 1
    },
    transition: { 
      duration: 1.2,
      ease: "easeOut"
    }
  },

  sparkleEntry: {
    initial: { 
      opacity: 0,
      scale: 0,
      rotate: -180
    },
    animate: { 
      opacity: [0, 1, 0.8, 1],
      scale: [0, 1.2, 0.9, 1],
      rotate: [-180, 20, -10, 0]
    },
    transition: { 
      duration: 1.8,
      ease: "backOut"
    }
  },

  liquidWave: {
    initial: { 
      opacity: 0,
      scaleX: 0,
      skewX: 45
    },
    animate: { 
      opacity: 1,
      scaleX: [0, 1.2, 1],
      skewX: [45, -10, 0]
    },
    transition: { 
      duration: 1.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },

  prismShift: {
    initial: { 
      opacity: 0,
      filter: "hue-rotate(180deg) saturate(0%)"
    },
    animate: { 
      opacity: 1,
      filter: [
        "hue-rotate(180deg) saturate(0%)",
        "hue-rotate(90deg) saturate(150%)",
        "hue-rotate(0deg) saturate(100%)"
      ]
    },
    transition: { 
      duration: 2,
      ease: "easeInOut"
    }
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

  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.6 }
  }
};

export default function AdvancedAnimation({ 
  children, 
  animation = "magicAppear", 
  delay = 0, 
  duration = 1,
  className = "",
  repeat = false
}: AdvancedAnimationProps) {
  const selectedAnimation = advancedAnimations[animation];
  
  return (
    <motion.div
      initial={selectedAnimation.initial}
      animate={selectedAnimation.animate}
      transition={{
        delay,
        duration,
        repeat: repeat ? Infinity : 0
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}