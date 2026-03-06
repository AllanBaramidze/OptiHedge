"use client";

import { useState, useEffect } from "react";

export default function NavbarVisibilityWrapper({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Reveal the navbar after scrolling 350px 
      // This aligns with when the 'OptiHedge' text starts appearing
      setIsVisible(window.scrollY > 350);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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