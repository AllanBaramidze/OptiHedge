"use client";

import React from 'react';

export default function AsciiContainer({ art }: { art: string }) {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <pre 
        className="
          font-mono 
          text-white 
          text-[4px] sm:text-[6px] md:text-[8px] lg:text-[10px] 
          leading-[1.1] 
          whitespace-pre 
          pointer-events-none 
          animate-card-spin-extreme
          drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]
        "
      >
        {art}
      </pre>
    </div>
  );
}