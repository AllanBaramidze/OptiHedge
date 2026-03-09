"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FileUp, Cpu, ShieldCheck, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: FileUp,
    title: "Upload Portfolio",
    desc: "Drop your CSV or Excel export. We support all major broker formats.",
    color: "from-blue-500 to-cyan-400"
  },
  {
    icon: Cpu,
    title: "AI Analysis",
    desc: "Our LSTM models identify hidden correlations and volatility risks.",
    color: "from-purple-500 to-pink-400"
  },
  {
    icon: ShieldCheck,
    title: "Deploy Hedge",
    desc: "Get exact tickers and allocations to protect your gains.",
    color: "from-emerald-500 to-teal-400"
  }
];

export default function HowItWorks() {
  return (
    <section className="relative w-full py-32 px-6 bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Three Steps to Peace of Mind
          </h2>
          <p className="text-white/40 max-w-2xl mx-auto text-lg">
            Complex quant finance, simplified into a 5-minute workflow.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-linear-to-r from-transparent via-white/10 to-transparent -translate-y-1/2 -z-10" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative group flex flex-col items-center text-center"
            >
              {/* Step Number Circle */}
              <div className={`mb-8 relative h-20 w-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:border-white/20`}>
                <div className={`absolute inset-0 rounded-2xl bg-linear-to-br ${step.color} opacity-0 group-hover:opacity-10 blur-xl transition-opacity`} />
                <step.icon className="h-8 w-8 text-white transition-transform group-hover:rotate-6" />
                
                {/* Step Number Badge */}
                <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-black border border-white/10 text-white/40 text-xs flex items-center justify-center font-bold">
                  0{i + 1}
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed max-w-62.5">
                {step.desc}
              </p>

              {/* Mobile Arrow */}
              {i < 2 && (
                <div className="md:hidden mt-8 text-white/10">
                  <ArrowRight className="rotate-90" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}