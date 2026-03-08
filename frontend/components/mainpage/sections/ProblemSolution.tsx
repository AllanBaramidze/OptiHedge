"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { AlertCircle, TrendingDown, Clock, BrainCircuit, ShieldCheck, BarChart3 } from 'lucide-react';

export default function ProblemSolution() {
  const containerRef = useRef(null);
  
  // Track scroll progress of this specific section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Create subtle parallax movement for the cards
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 50]);

  const painPoints = [
    { 
      icon: <TrendingDown className="text-red-400" />, 
      text: "Over-concentrated in tech or meme stocks without realizing it." 
    },
    { 
      icon: <AlertCircle className="text-red-400" />, 
      text: "No clear hedge plan when volatility spikes and markets bleed." 
    },
    { 
      icon: <Clock className="text-red-400" />, 
      text: "Traditional tools are too complex or cost $200+/month." 
    }
  ];

  const solutions = [
    { 
      icon: <ShieldCheck className="text-emerald-400" />, 
      title: "Smart Exposure Mapping",
      desc: "Instantly see hidden correlations across your entire portfolio."
    },
    { 
      icon: <BrainCircuit className="text-emerald-400" />, 
      title: "AI-Driven Hedging",
      desc: "Get specific tickers and allocations to offset your unique risks."
    },
    { 
      icon: <BarChart3 className="text-emerald-400" />, 
      title: "Institutional Alpha",
      desc: "Access LSTM and Reinforcement Learning models built for retail."
    }
  ];

  return (
    <section ref={containerRef} className="relative w-full py-32 px-6 overflow-hidden bg-black">
      
      {/* 1. Header Transition */}
      <div className="max-w-4xl mx-auto text-center mb-24">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6"
        >
          Retail trading is exciting... <br />
          <span className="text-red-500/80">until a 30% drawdown wipes you out.</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/40 text-lg"
        >
          Modern markets move at AI speed. Manual diversification isn't enough anymore.
        </motion.p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* 2. THE PAIN (Left Side) */}
        <motion.div style={{ y: y1 }} className="space-y-6">
          <p className="text-xs font-bold tracking-widest text-white/30 uppercase mb-8">The Problem</p>
          {painPoints.map((point, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/5"
            >
              <div className="mt-1">{point.icon}</div>
              <p className="text-white/70 leading-relaxed">{point.text}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* 3. THE SOLUTION (Right Side) */}
        <motion.div style={{ y: y2 }} className="space-y-6 lg:mt-24">
          <p className="text-xs font-bold tracking-widest text-emerald-500 uppercase mb-8">The OptiHedge Solution</p>
          {solutions.map((sol, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="group p-6 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10 hover:border-emerald-500/30 transition-colors"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                  {sol.icon}
                </div>
                <h3 className="text-xl font-bold text-white">{sol.title}</h3>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">{sol.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] -z-10" />
    </section>
  );
}