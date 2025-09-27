"use client";

import { ReactNode, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface HeroBannerProps {
  images: string[];
  intervalMs?: number;
  className?: string;
  rounded?: string;
  captions?: ReactNode[];
  /** CSS object-position value, e.g. "center", "top", "center 20%" */
  objectPosition?: string;
  /** Alt text prefix for slides, default: "Banner" */
  altPrefix?: string;
}

export default function HeroBanner({
  images,
  intervalMs = 4500,
  className,
  rounded = "rounded-3xl",
  captions,
  objectPosition = "center",
  altPrefix = "Banner",
}: HeroBannerProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!images?.length) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [images, intervalMs]);

  return (
    <div
      className={cn(
        "relative w-full h-[480px] md:h-[600px] lg:h-[680px] overflow-hidden shadow-2xl",
        rounded,
        className
      )}
    >
      <AnimatePresence mode="wait">
        {/** Use next/image for better performance and automatic resizing */}
        {/** Wrap Image with motion for transitions */}
        {(() => {
          const MotionImage: any = motion(Image as any);
          return (
            <MotionImage
              key={images[index]}
              src={images[index]}
              alt={`${altPrefix} ${index + 1}`}
              fill
              priority={index === 0}
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition }}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          );
        })()}
      </AnimatePresence>

      {/* subtle gradient overlay for readability */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.18),rgba(0,0,0,0)_40%),linear-gradient(to_right,rgba(255,182,193,0.22),rgba(255,182,193,0)_55%),linear-gradient(to_left,rgba(0,0,0,0.10),rgba(0,0,0,0))]" />

      {/* caption overlay */}
      {captions && captions[index] && (
        <div className="absolute left-0 right-0 top-[45%] -translate-y-1/2 pl-12 pr-6 md:pl-24 lg:pl-32 xl:pl-36 flex z-[1]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`caption-${index}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-white drop-shadow-md w-full max-w-[90%] md:max-w-[45%] lg:max-w-[40%]"
            >
              {captions[index]}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* indicators */}
  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-[1]">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Chuyển tới slide ${i + 1}`}
            className={cn(
              "h-1.5 w-4 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white/70",
              i === index ? "bg-rose-500 w-6" : "bg-white/60 hover:bg-white/80"
            )}
          />
        ))}
      </div>
    </div>
  );
}
