import React from 'react';
import fs from 'fs';
import path from 'path';

export default function Page() {
  const filePath = path.join(process.cwd(), 'public', 'ascii-art.txt');
  
  let asciiArt = '';
  try {
    asciiArt = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    asciiArt = "ASCII Art file not found.";
  }

  return (
    <div className="flex-grow flex items-center justify-center relative overflow-hidden bg-black">
      {/* Background radial glow that reacts to the spin */}
      <div 
        className="absolute inset-0 z-0 opacity-50 animate-pulse"
        style={{
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(0,0,0,1) 75%)'
        }}
      />

      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <pre 
          className="
            font-mono 
            text-white 
            text-[4px] sm:text-[6px] md:text-[8px] lg:text-[10px] 
            leading-[1.1] 
            whitespace-pre 
            pointer-events-none 
            animate-card-spin-extreme
            drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]
          "
          aria-hidden="true"
        >
          {asciiArt}
        </pre>
      </div>
    </div>
  );
}