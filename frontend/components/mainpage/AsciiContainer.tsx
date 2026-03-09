"use client";

import React, { useState } from 'react';
import Image from 'next/image';

export default function AsciiContainer({ art }: { art: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  const handleClick = () => {
    if (isPulsing) return;
    setIsPulsing(true);
    setTimeout(() => {
      setIsPulsing(false);
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <style>{`
        @keyframes green-pulse {
          0% { filter: drop-shadow(0 0 10px rgba(220, 252, 231, 0.8)); }
          50% { filter: drop-shadow(0 0 50px rgba(22, 163, 74, 1)); }
          100% { filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.2)); }
        }
        .animate-green-pulse {
          animation: green-pulse 1s ease-out forwards;
        }
      `}</style>

      {/* LAYER 1: The Spin (Everything inside this rotates together) */}
      <div className="relative flex items-center justify-center animate-card-spin-extreme">
        
        {/* --- THE VISUALS --- */}
        {/* We disable pointer events entirely here so the invisible ASCII padding can't trigger anything */}
        <div className={`pointer-events-none relative flex items-center justify-center transition-all duration-300 ${isPulsing ? 'animate-green-pulse' : ''}`}>
          
          <pre
            className={`
              font-mono text-white 
              text-[4px] sm:text-[6px] md:text-[8px] lg:text-[10px] leading-[1.1] whitespace-pre 
              drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]
              transition-opacity duration-500 ease-in-out
              ${isHovered ? 'opacity-0' : 'opacity-100'}
            `}
          >
            {art}
          </pre>

          <div 
            className={`
              absolute inset-0 flex items-center justify-center
              transition-opacity duration-500 ease-in-out
              ${isHovered ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <Image
              src="/OpitHedgeCard-Transparent.png"
              alt="OptiHedge Card"
              width={800} 
              height={800} 
              className="w-80 sm:w-96 md:w-125 lg:w-150 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
              priority
            />
          </div>
        </div>

        {/* --- THE SHARP HITBOX --- */}
        {/* This is an invisible box placed dead-center over the card. 
            Adjust w-[60%] and h-[70%] to make the trigger area exactly as tight as you want it. */}
        <div 
          className="absolute z-20 w-[60%] h-[70%] cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleClick}
        />
        
      </div>
    </div>
  );
}