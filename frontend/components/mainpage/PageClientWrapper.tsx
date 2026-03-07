"use client";

import { useState, useEffect } from "react";
import AsciiContainer from "./AsciiContainer";
import LandingPage from "./LandingPage";

export default function PageClientWrapper({ asciiArt }: { asciiArt: string }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);

    const handleScroll = () => {
      // The transition happens over the first 600px of scroll
      const progress = Math.min(window.scrollY / 600, 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, []);

  if (!mounted) return null;

  // Layer 1: ASCII Art (Fades out, scales up slightly)
  const asciiOpacity = Math.max(1 - scrollProgress * 2.5, 0); 
  const asciiScale = 1 + (scrollProgress * 0.1);

  // Layer 2: Main Text (Fades in, blurs in)
  const textOpacity = scrollProgress > 0.4 ? (scrollProgress - 0.4) * 1.6 : 0;
  const textBlur = Math.max(20 - (scrollProgress * 40), 0);

  return (
    <div className="relative w-full bg-black">
      {/* BACKGROUND: Persistent Light Source */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{ 
          background: `radial-gradient(circle at center, rgba(255,255,255,${0.12 - scrollProgress * 0.04}) 0%, rgba(0,0,0,1) 80%)` 
        }}
      />

      {/* THE VIEWPORT STICKY: Keeps everything centered during scroll */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none overflow-hidden h-screen w-full">
        
        {/* Layer: ASCII Card */}
        <div 
          className="absolute flex items-center justify-center w-full"
          style={{ 
            opacity: asciiOpacity,
            transform: `scale(${asciiScale})`,
            filter: `blur(${scrollProgress * 10}px)`
          }}
        >
          <AsciiContainer art={asciiArt} />
        </div>

        {/* Layer: Main Title */}
        <div 
          className="absolute flex flex-col items-center justify-center w-full text-center"
          style={{ 
            opacity: textOpacity,
            filter: `blur(${textBlur}px)`,
            transform: `translateY(${(1 - scrollProgress) * 20}px)` // Slides up slightly as it appears
          }}
        >
          <h1 className="text-7xl md:text-9xl font-bold tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            OptiHedge
          </h1>
          <p className="mt-4 text-white/40 text-sm md:text-lg tracking-[0.9em] uppercase">
            Risk Management Evolved
          </p>
        </div>

      </div>

      {/* THE PADDING: Provides the "length" of the scroll transition */}
      <div className="h-[150vh] w-full pointer-events-none" />

      {/* THE CONTENT: Appears after the user scrolls past the transition */}
      <div className="relative z-100 bg-black shadow-[0_-50px_100px_50px_rgba(0,0,0,1)]">
        <LandingPage />
        {/* Extra space for the footer/bottom of page */}
        <div className="h-[50vh]" />
      </div>
    </div>
  );
}