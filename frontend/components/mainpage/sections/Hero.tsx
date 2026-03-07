import React from 'react';
import Link from 'next/link';
import { ArrowRight, Play, ShieldCheck, Zap, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PortfolioMiniature from './PortfolioMiniature'; //

export default function Hero() {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 pt-10 pb-24 md:pt-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* LEFT COLUMN: COPY */}
        <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white leading-[1.1]">
              Protect Your Portfolio <br />
              <span className="text-white/60 text-3xl md:text-5xl">Before the Next Drop</span>
            </h2>
            <p className="text-lg md:text-xl text-white/50 max-w-xl leading-relaxed">
              Structure modular wallets, track custom holdings, and get AI-powered hedge suggestions—without needing a finance degree.
            </p>
          </div>

          {/* CTA BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Link href="/upload" className="w-full sm:w-auto">
              <Button size="lg" className="w-full h-14 px- text-lg font-bold group shadow-xl shadow-primary/20">
                Build Your First Wallet
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: THE MINIATURE BUILDER */}
        <PortfolioMiniature />

      </div>
    </section>
  );
}