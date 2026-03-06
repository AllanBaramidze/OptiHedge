import React from 'react';
import fs from 'fs';
import path from 'path';
import PageClientWrapper from '@/components/mainpage/PageClientWrapper';

export default function Page() {
  const filePath = path.join(process.cwd(), 'public', 'art.txt');
  let asciiArt = '';
  
  try {
    asciiArt = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    asciiArt = "ASCII Art file not found.";
  }

  return (
    <div className="grow flex flex-col relative overflow-x-hidden bg-black">
      {/* Permanent background glow that persists across transitions */}
      <div 
        className="fixed inset-0 z-0 opacity-40 animate-pulse pointer-events-none"
        style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0.12) 0%, rgba(0,0,0,1) 85%)' }}
      />

      <PageClientWrapper asciiArt={asciiArt} />
    </div>
  );
}