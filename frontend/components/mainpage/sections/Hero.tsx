"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowRight, ShieldCheck, TrendingDown, TrendingUp } from 'lucide-react';

// Data 

const PORTFOLIO_LESSONS = [
  {
    id: 'concentration',
    label: 'Concentration Risk',
    title: 'The All-In Trap',
    stat: '94%',
    statLabel: 'of retail portfolios hold 1–2 sectors',
    description:
      `Retail traders pour into the hottest sector. When that theme rotates and it always does there's nowhere to hide. One bad quarter wipes out months of gains.`,
    principle: 'Spread across 5–7 uncorrelated sectors. No single position should exceed 20% of capital.',
    visual: <ConcentrationVisual />,
  },
  {
    id: 'hedging',
    label: 'No Protection',
    title: 'Hope Is Not a Hedge',
    stat: '0%',
    statLabel: 'downside protection on average retail portfolio',
    description:
      'Without a defined risk floor, every market crash is a full-force hit. Most retail traders ride drawdowns to the bottom then capitulate locking in permanent losses.',
    principle: 'Allocate 5–10% to hedges (puts, inverse ETFs, cash). Define your max acceptable loss before entering any position.',
    visual: <HedgingVisual />,
  },
  {
    id: 'drawdown',
    label: 'Volatility Damage',
    title: 'Volatility Destroys Wealth',
    stat: '−38%',
    statLabel: 'average max drawdown for concentrated retail portfolios',
    description:
      `A 50% loss requires a 100% gain just to break even. Wild swings don't just hurt psychologically they mathematically erode compounding. Smooth returns beat high returns.`,
    principle: 'Optimize for Sharpe ratio, not just returns. Rebalance quarterly. Use risk parity to weight positions by volatility, not dollars.',
    visual: <DrawdownVisual />,
  },
];

// Sub-visuals 

function ConcentrationVisual() {
  const bad = [
    { label: 'Tech', pct: 78, highlight: true },
    { label: 'Finance', pct: 9, highlight: false },
    { label: 'Energy', pct: 5, highlight: false },
    { label: 'Health', pct: 4, highlight: false },
    { label: 'Cons.', pct: 3, highlight: false },
    { label: 'Other', pct: 1, highlight: false },
  ];
  const good = [
    { label: 'Tech', pct: 18 },
    { label: 'Finance', pct: 17 },
    { label: 'Energy', pct: 16 },
    { label: 'Health', pct: 17 },
    { label: 'Cons.', pct: 16 },
    { label: 'Other', pct: 16 },
  ];

  return (
    <div className="grid grid-cols-2 gap-5">
      {/* BAD */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-red-400">❌ Retail</p>
        <div className="bg-zinc-950 border border-white/8 rounded-2xl p-4 space-y-2">
          {bad.map((s) => (
            <div key={s.label} className="space-y-0.5">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>{s.label}</span>
                <span className={s.highlight ? 'text-red-400 font-bold' : ''}>{s.pct}%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${s.highlight ? 'bg-red-500' : 'bg-zinc-600'}`}
                />
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-white/5 text-xs text-red-400 font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Single-sector failure risk
          </div>
        </div>
      </div>

      {/* GOOD */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">✓ Institutional</p>
        <div className="bg-zinc-950 border border-white/8 rounded-2xl p-4 space-y-2">
          {good.map((s, i) => (
            <div key={s.label} className="space-y-0.5">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>{s.label}</span>
                <span className="text-zinc-300">{s.pct}%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.pct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.06, ease: 'easeOut' }}
                  className="h-full rounded-full bg-emerald-500"
                />
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-white/5 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> No single point of failure
          </div>
        </div>
      </div>
    </div>
  );
}

function HedgingVisual() {
  const scenarios = [
    { label: 'Market −5%', retail: '−5.0%', hedged: '−2.1%', retailColor: 'text-red-400', hedgedColor: 'text-zinc-300' },
    { label: 'Market −15%', retail: '−15.2%', hedged: '−6.8%', retailColor: 'text-red-400', hedgedColor: 'text-yellow-400' },
    { label: 'Market −30%', retail: '−31.4%', hedged: '−11.2%', retailColor: 'text-red-500 font-bold', hedgedColor: 'text-emerald-400 font-bold' },
  ];

  return (
    <div className="grid grid-cols-2 gap-5">
      {/* Unhedged */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-red-400">❌ Unhedged</p>
        <div className="bg-zinc-950 border border-white/8 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs text-zinc-400">No downside protection</span>
          </div>
          {scenarios.map((s) => (
            <div key={s.label} className="flex justify-between items-center">
              <span className="text-xs text-zinc-500">{s.label}</span>
              <span className={`text-xs font-mono ${s.retailColor}`}>{s.retail}</span>
            </div>
          ))}
          <div className="mt-1 pt-3 border-t border-white/5">
            <div className="text-xs text-red-400 font-semibold">Full market exposure · no floor</div>
          </div>
        </div>
      </div>

      {/* Hedged */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">✓ Hedged</p>
        <div className="bg-zinc-950 border border-white/8 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-zinc-400">5–10% in options/inverse</span>
          </div>
          {scenarios.map((s) => (
            <div key={s.label} className="flex justify-between items-center">
              <span className="text-xs text-zinc-500">{s.label}</span>
              <span className={`text-xs font-mono ${s.hedgedColor}`}>{s.hedged}</span>
            </div>
          ))}
          <div className="mt-1 pt-3 border-t border-white/5">
            <div className="text-xs text-emerald-400 font-semibold">Defined risk floor · capital preserved</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DrawdownVisual() {
  // Simulated monthly equity curves
  const retailCurve = [100, 112, 108, 127, 118, 99, 78, 88, 95, 103, 97, 110];
  const institutionalCurve = [100, 104, 102, 107, 105, 101, 96, 100, 103, 106, 105, 109];

  const maxR = Math.max(...retailCurve);
  const minR = Math.min(...retailCurve);
  const maxI = Math.max(...institutionalCurve);
  const minI = Math.min(...institutionalCurve);

  const toY = (val: number, min: number, max: number, height: number) =>
    height - ((val - min) / (max - min + 10)) * height;

  const W = 200;
  const H = 80;
  const step = W / (retailCurve.length - 1);

  const polyline = (curve: number[], min: number, max: number) =>
    curve.map((v, i) => `${i * step},${toY(v, min, max, H)}`).join(' ');

  return (
    <div className="grid grid-cols-2 gap-5">
      {/* Retail */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-red-400">❌ Retail</p>
        <div className="bg-zinc-950 border border-white/8 rounded-2xl p-4 space-y-3">
          <svg viewBox={`0 0 ${W} ${H + 10}`} className="w-full h-20" preserveAspectRatio="none">
            <polyline
              points={polyline(retailCurve, minR - 5, maxR)}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Shade below */}
            <polygon
              points={`0,${H + 10} ${polyline(retailCurve, minR - 5, maxR)} ${W},${H + 10}`}
              fill="url(#redFade)"
              opacity="0.3"
            />
            <defs>
              <linearGradient id="redFade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#ef444400" />
              </linearGradient>
            </defs>
          </svg>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-zinc-500">Max Drawdown</div>
              <div className="text-red-400 font-bold font-mono">−38%</div>
            </div>
            <div>
              <div className="text-zinc-500">Sharpe Ratio</div>
              <div className="text-red-400 font-bold font-mono">0.41</div>
            </div>
          </div>
          <div className="text-xs text-zinc-500 flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-red-400" /> Volatile, hard to hold
          </div>
        </div>
      </div>

      {/* Institutional */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">✓ Institutional</p>
        <div className="bg-zinc-950 border border-white/8 rounded-2xl p-4 space-y-3">
          <svg viewBox={`0 0 ${W} ${H + 10}`} className="w-full h-20" preserveAspectRatio="none">
            <polyline
              points={polyline(institutionalCurve, minI - 5, maxI)}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <polygon
              points={`0,${H + 10} ${polyline(institutionalCurve, minI - 5, maxI)} ${W},${H + 10}`}
              fill="url(#greenFade)"
              opacity="0.3"
            />
            <defs>
              <linearGradient id="greenFade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#10b98100" />
              </linearGradient>
            </defs>
          </svg>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-zinc-500">Max Drawdown</div>
              <div className="text-emerald-400 font-bold font-mono">−4%</div>
            </div>
            <div>
              <div className="text-zinc-500">Sharpe Ratio</div>
              <div className="text-emerald-400 font-bold font-mono">1.84</div>
            </div>
          </div>
          <div className="text-xs text-zinc-500 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Smooth, easy to hold
          </div>
        </div>
      </div>
    </div>
  );
}

// Hero

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeLesson = PORTFOLIO_LESSONS[activeIndex];

  return (
    <section className="relative w-full min-h-screen flex items-center bg-black overflow-hidden px-5 sm:px-8 pt-16 pb-16">
      {/* Ambient glows — subtle, not cut off */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-100 bg-white/2 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-125 h-125 bg-white/1.5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 xl:gap-20 items-center relative z-10">

        {/* LEFT */}
        <div className="space-y-8">
          <div className="">
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-black tracking-tight leading-[1.05] text-white">
            Why most retail<br />
            portfolios{' '}
            <span className="relative inline-block">
              <span className="text-white">fail</span>
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-red-500" />
            </span>
            {' '}when it<br />matters most.
          </h1>

          <p className="text-lg text-zinc-400 leading-relaxed max-w-md">
            Three structural mistakes made by the majority of retail investors that silently erode capital during every market cycle.
          </p>

          {/* Lesson navigation — vertical on left */}
          <div className="space-y-2 pt-2">
            {PORTFOLIO_LESSONS.map((lesson, i) => (
              <button
                key={lesson.id}
                onClick={() => setActiveIndex(i)}
                className={`w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-200 ${
                  activeIndex === i
                    ? 'border-white/20 bg-white/5 text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <span
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold border shrink-0 transition-colors duration-200 ${
                    activeIndex === i ? 'border-white/30 text-white' : 'border-zinc-700 text-zinc-600'
                  }`}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{lesson.label}</div>
                  {activeIndex === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-xs text-zinc-400 mt-0.5"
                    >
                      {lesson.stat} — {lesson.statLabel}
                    </motion.div>
                  )}
                </div>
                {activeIndex === i && (
                  <ArrowRight className="w-4 h-4 text-zinc-400 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Lesson Card ── */}
        <div className="relative">
          <div className="rounded-2xl border border-white/10 bg-zinc-950 overflow-hidden">

            {/* Card header */}
            <div className="px-7 pt-7 pb-6 border-b border-white/5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeLesson.id + '-header'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                        {activeLesson.title}
                      </h2>
                      <p className="mt-2 text-sm text-zinc-400 leading-relaxed max-w-sm">
                        {activeLesson.description}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-3xl font-black text-white font-mono">{activeLesson.stat}</div>
                      <div className="text-xs text-zinc-500 mt-0.5 max-w-30 leading-snug">{activeLesson.statLabel}</div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Visual area */}
            <div className="px-7 py-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeLesson.id + '-visual'}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  {activeLesson.visual}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Principle */}
            <div className="mx-7 mb-7 px-5 py-4 rounded-xl bg-white/3 border border-white/8">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Core Principle</div>
                  <p className="text-sm text-zinc-300 leading-relaxed">{activeLesson.principle}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-4">
            {PORTFOLIO_LESSONS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  activeIndex === i ? 'w-8 bg-white' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}