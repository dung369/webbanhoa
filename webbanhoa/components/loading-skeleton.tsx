"use client";

import { motion } from "framer-motion";

interface LoadingSkeletonProps {
  type?: "card" | "text" | "image" | "button";
  count?: number;
  className?: string;
}

const SkeletonCard = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-white rounded-lg border border-rose-100 overflow-hidden"
  >
    <div className="h-64 bg-gradient-to-r from-rose-100 to-pink-100 animate-pulse"></div>
    <div className="p-6 space-y-4">
      <div className="h-4 bg-gradient-to-r from-rose-100 to-pink-100 rounded animate-pulse"></div>
      <div className="h-3 bg-gradient-to-r from-rose-100 to-pink-100 rounded w-3/4 animate-pulse"></div>
      <div className="flex space-x-2">
        <div className="h-6 bg-gradient-to-r from-rose-100 to-pink-100 rounded w-20 animate-pulse"></div>
        <div className="h-6 bg-gradient-to-r from-rose-100 to-pink-100 rounded w-16 animate-pulse"></div>
      </div>
      <div className="h-10 bg-gradient-to-r from-rose-100 to-pink-100 rounded animate-pulse"></div>
    </div>
  </motion.div>
);

const SkeletonText = ({ width = "100%" }: { width?: string }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className={`h-4 bg-gradient-to-r from-rose-100 to-pink-100 rounded animate-pulse`}
    style={{ width }}
  />
);

const SkeletonImage = ({ height = "64" }: { height?: string }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className={`h-${height} bg-gradient-to-r from-rose-100 to-pink-100 rounded animate-pulse`}
  />
);

const SkeletonButton = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="h-10 bg-gradient-to-r from-rose-100 to-pink-100 rounded animate-pulse w-24"
  />
);

export default function LoadingSkeleton({ 
  type = "card", 
  count = 1, 
  className = "" 
}: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (type) {
      case "card":
        return <SkeletonCard />;
      case "text":
        return <SkeletonText />;
      case "image":
        return <SkeletonImage />;
      case "button":
        return <SkeletonButton />;
      default:
        return <SkeletonCard />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {renderSkeleton()}
        </motion.div>
      ))}
    </div>
  );
}