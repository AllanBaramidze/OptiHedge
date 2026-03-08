"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Upload, ShieldCheck, Zap, ArrowRight, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  // FIXED: Explicitly typed as Variants and cast 'ease' to satisfy strict TS requirements
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { 
        delay: i * 0.1, 
        duration: 0.6, 
        ease: [0.215, 0.61, 0.355, 1] as any // Casting 'ease' prevents the number[] error
      }
    })
  };

  return (
    <section className="relative w-full min-h-screen pt-32 pb-20 px-6 flex flex-col items-center justify-center overflow-hidden bg-black">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* LEFT COL: Content */}
        <div className="flex flex-col space-y-8">
          <motion.div 
            custom={0} initial="hidden" animate="visible" variants={fadeUp}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-blue-400 w-fit"
          >
            <Zap className="w-3 h-3 fill-current" />
            <span>AI-Powered Portfolio Protection</span>
          </motion.div>

          <motion.h1 
            custom={1} initial="hidden" animate="visible" variants={fadeUp}
            className="text-5xl lg:text-7xl font-bold tracking-tighter leading-[1.1] text-white"
          >
            Protect Your Portfolio <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              Before the Next Drop
            </span>
          </motion.h1>

          <motion.p 
            custom={2} initial="hidden" animate="visible" variants={fadeUp}
            className="text-lg text-white/60 max-w-xl leading-relaxed"
          >
            Upload your stocks, ETFs, or crypto. Get instant exposure analysis, 
            smart hedge suggestions, and optimized allocations — without needing 
            a finance degree or expensive advisor.
          </motion.p>

          <motion.div 
            custom={3} initial="hidden" animate="visible" variants={fadeUp}
            className="flex flex-wrap gap-4 pt-4"
          >
            <Link href="/upload" className="group relative px-8 py-4 bg-white text-black font-semibold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 overflow-hidden">
              <Upload className="w-5 h-5" />
              Start Free Analysis
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <button className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-xl transition-all hover:bg-white/10 flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-blue-400" />
              Watch 60s Demo
            </button>
          </motion.div>

          <motion.div 
            custom={4} initial="hidden" animate="visible" variants={fadeUp}
            className="flex items-center gap-6 pt-2 text-white/40 text-sm"
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure & Private
            </div>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div>No Credit Card Needed</div>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div>Not Financial Advice</div>
          </motion.div>
        </div>

        {/* RIGHT COL: Interactive Preview Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="relative hidden lg:block"
          style={{ perspective: "1000px" }}
        >
          {/* Main Dashboard Card */}
          <div className="relative z-10 w-full aspect-[4/3] rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-8 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Risk Exposure</p>
                <h4 className="text-2xl font-bold text-white">Aggressive High-Beta</h4>
              </div>
              <div className="h-12 w-12 rounded-full border-4 border-emerald-500/20 flex items-center justify-center relative">
                 <div className="absolute inset-0 rounded-full border-t-4 border-emerald-400 animate-[spin_3s_linear_infinite]" />
                 <span className="text-xs font-bold text-emerald-400">82%</span>
              </div>
            </div>

            {/* Simulated Chart/Bars */}
            <div className="space-y-6">
              {[
                { label: 'Technology', value: 78, color: 'bg-blue-500' },
                { label: 'Energy', value: 12, color: 'bg-emerald-500' },
                { label: 'Finance', value: 45, color: 'bg-purple-500' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-xs text-white/60">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 1.5, delay: 1 + idx * 0.2 }}
                      className={`h-full ${item.color}`} 
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Float Recommendation Card */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 2 }}
              className="absolute bottom-6 right-6 left-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-xl flex items-center gap-4"
            >
              <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <p className="text-blue-400 text-xs font-bold">AI RECOMMENDATION</p>
                <p className="text-white text-sm font-medium">Buy SQQQ + Put Options on QQQ</p>
              </div>
            </motion.div>
          </div>

          {/* Glowing Accents behind the card */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 blur-3xl -z-10 rounded-[3rem]" />
        </motion.div>

      </div>
    </section>
  );
}