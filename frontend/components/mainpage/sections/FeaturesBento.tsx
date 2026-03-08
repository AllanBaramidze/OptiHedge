"use client";

import React, { useState, MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Database, LineChart, ShieldAlert, FlaskConical, LayoutDashboard, Fingerprint } from 'lucide-react';

// --- Sub-Component: Feature Card with Spotlight Effect ---
const FeatureCard = ({ title, desc, icon: Icon, className = "" }: any) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 transition-all hover:bg-white/[0.04] ${className}`}
    >
      {/* The "Spotlight" Gradient */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(59,130,246,0.15), transparent 40%)`
          ),
        }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform duration-500">
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-sm leading-relaxed text-white/50">{desc}</p>
        </div>
        
        {/* Subtle Decorative element at bottom */}
        <div className="mt-8 flex items-center gap-2">
           <div className="h-[1px] w-8 bg-blue-500/50" />
           <div className="h-1 w-1 rounded-full bg-blue-500" />
        </div>
      </div>
    </motion.div>
  );
};

export default function FeaturesBento() {
  return (
    <section className="relative w-full py-32 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-blue-400 font-bold tracking-widest text-xs uppercase mb-4"
          >
            <Fingerprint className="w-4 h-4" />
            <span>Platform Capabilities</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">
            Institutional Power. <br />
            <span className="text-white/40">Retail Simplicity.</span>
          </h2>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[300px]">
          
          {/* Card 1: Risk Analysis (Big 2x1) */}
          <FeatureCard 
            className="md:col-span-2"
            icon={LineChart}
            title="Exposure Mapping & Correlation"
            desc="Our AI identifies hidden links between your assets. Discover if your 'diversified' portfolio is actually 80% correlated to a single volatility factor. Powered by Graph Attention Networks."
          />

          {/* Card 2: Ingestion */}
          <FeatureCard 
            icon={Database}
            title="Instant Ingestion"
            desc="Drag-drop CSVs or connect via API. We handle the dirty work of parsing tickers and quantities."
          />

          {/* Card 3: Backtesting */}
          <FeatureCard 
            icon={FlaskConical}
            title="Stress Test Simulations"
            desc="Run your current holdings through 2008, 2020, and custom 'Black Swan' scenarios in seconds."
          />

          {/* Card 4: AI Recommendations (Big 2x1) */}
          <FeatureCard 
            className="md:col-span-2"
            icon={ShieldAlert}
            title="Dynamic Hedge Recommendations"
            desc="Get precise instructions: 'Buy 4x SQQQ' or 'Long 2x OTM Puts on SPY'. Optimized via Reinforcement Learning to minimize your drawdown while preserving 90% of your upside."
          />

          {/* Card 5: Dashboard */}
          <FeatureCard 
            icon={LayoutDashboard}
            title="What-If Playground"
            desc="Tweak volatility inputs or interest rate hikes and watch your portfolio's Delta and Gamma adjust live."
          />

        </div>
      </div>

      {/* Background radial glow */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -z-10" />
    </section>
  );
}