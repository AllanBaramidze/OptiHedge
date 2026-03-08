"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";

export default function ScrollArrow() {
  const { scrollY } = useScroll();
  
  // Adjusted range: 0 to 100px for a faster fade-out
  const opacity = useTransform(scrollY, [0, 100], [1, 0]);

  return (
    <motion.div
      style={{ opacity }}
      className="fixed bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-50"
      initial={{ y: 0 }}
      animate={{ y: [0, 8, 0] }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* Icon with explicit colors to ensure visibility */}
      <ArrowDown 
        className="text-zinc-500 block" 
        size={24} 
        strokeWidth={2} 
      />
      
      <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">
        Scroll
      </span>
    </motion.div>
  );
}