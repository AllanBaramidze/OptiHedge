"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function NavbarVisibilityWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  
  // If not home, start visible. If home, start hidden.
  const [isVisible, setIsVisible] = useState(!isHomePage);

  useEffect(() => {
    if (!isHomePage) {
      setIsVisible(true);
      return;
    }

    const handleScroll = () => {
      const scrollPos = window.scrollY;
      
      // FIX: Once we pass 350, keep it visible. 
      // Only hide it if the user scrolls back up near the top (e.g., < 100)
      if (scrollPos > 350) {
        setIsVisible(true);
      } else if (scrollPos < 100) {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  return (
    <div 
      className={`fixed top-0 left-0 right-0 transition-all duration-700 ease-in-out ${
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 -translate-y-10 pointer-events-none"
      }`}
      // Ensure this is HIGHER than any other z-index in your app
      style={{ zIndex: 9999 }} 
    >
      {children}
    </div>
  );
}