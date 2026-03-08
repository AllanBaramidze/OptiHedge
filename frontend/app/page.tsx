// page.tsx
import React from 'react';
import fs from 'fs';
import path from 'path';
import PageClientWrapper from '@/components/mainpage/PageClientWrapper';
import ScrollArrow from '@/components/mainpage/ScrollArrow';


export default function Page() {
  const filePath = path.join(process.cwd(), 'public', 'art.txt');
  let asciiArt = '';
  
  try {
    asciiArt = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    asciiArt = "ASCII Art file not found.";
  }

  return (
    // REMOVED: grow, flex, flex-col. 
    // KEEP: relative, overflow-x-hidden, bg-black
    <div className="relative overflow-x-hidden bg-black">
      <div 
        className="fixed inset-0 z-[-1] opacity-40 animate-pulse pointer-events-none"
        style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0.12) 0%, rgba(0,0,0,1) 85%)' }}
      />

      <PageClientWrapper asciiArt={asciiArt} />
      <ScrollArrow />
    </div>
  );
}