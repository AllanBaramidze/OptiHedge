"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function NavbarVisibilityWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  
  // 1. This state now ONLY tracks if the user has scrolled enough on the Home Page
  const [isScrolled, setIsScrolled] = useState(false);

  // 2. DERIVED STATE: This is the magic. 
  // If it's not the home page, it's ALWAYS visible.
  // If it IS the home page, visibility depends on the scroll state.
  const isVisible = !isHomePage || isScrolled;

  useEffect(() => {
    // If we aren't on the home page, we don't need a scroll listener at all
    if (!isHomePage) return;

    const handleScroll = () => {
      const scrollPos = window.scrollY;
      
      // Keep the "Buffer" logic: 
      // Show after 350px, hide only when back above 100px
      if (scrollPos > 350) {
        setIsScrolled(true);
      } else if (scrollPos < 100) {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Check initial position in case they refresh halfway down the home page
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]); // Only re-run if we switch between home and other pages

  return (
    <div 
      className={`fixed top-0 left-0 right-0 transition-all duration-700 ease-in-out ${
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 -translate-y-10 pointer-events-none"
      }`}
      style={{ zIndex: 9999 }} 
    >
      {children}
    </div>
  );
}