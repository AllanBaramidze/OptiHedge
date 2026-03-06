"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function NavbarVisibilityWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check if we are on the home page
  const isHomePage = pathname === "/";

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
      
      // If we aren't on the home page, the navbar should be visible immediately
      if (!isHomePage) {
        setIsVisible(true);
      }
    });

    const handleScroll = () => {
      // Only apply the scroll logic on the Home Page
      if (isHomePage) {
        setIsVisible(window.scrollY > 350);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHomePage]); // Re-run effect when the page changes

  if (!mounted) return null;

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ease-in-out ${
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 -translate-y-full pointer-events-none"
      }`}
    >
      {children}
    </div>
  );
}