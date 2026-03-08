"use client";

/**
 * @file ProblemSolution.tsx
 * @description Renders the core capabilities showcase, including interactive quantitative models.
 * Features optimized SVG rendering, dynamic state-driven color theming, and Framer Motion transitions.
 * Copy and interactions have been calibrated for an intermediate (3-4/10) investor knowledge level.
 */

import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ChevronRight, Target, TrendingUp, Network, Scale, BrainCircuit, Info } from 'lucide-react';


// Types & Interfaces


interface Capability {
  id: string;
  index: string;
  tag: string;
  title: string;
  body: string;
  aside: string;
  accent: string;
  accentBg: string;
  icon: React.ReactNode;
  metrics: { label: string; value: string }[];
  visual: React.ReactNode;
}


// Interactive Visualizations


/**
 * Efficient Frontier Visualization
 * Now features click-to-lock interaction, precise X-axis tracking, and 
 * dynamic color shifting (Red/Amber/Green) based on the underlying Sharpe Ratio.
 */
function FrontierVisual() {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [activeIdx, setActiveIdx] = useState<number>(6); // Defaults to Max Sharpe point

  // Core model data points representing different risk/return portfolios
  const curvePoints = useMemo(() => [
    { risk: 6, ret: 18, label: 'Ultra Conservative' }, 
    { risk: 10, ret: 28, label: 'Conservative' }, 
    { risk: 16, ret: 40, label: 'Moderate' },
    { risk: 24, ret: 52, label: 'Balanced' }, 
    { risk: 34, ret: 62, label: 'Growth' }, 
    { risk: 46, ret: 70, label: 'Aggressive' },
    { risk: 60, ret: 75, label: 'Max Efficiency' }, // Tangency point
    { risk: 76, ret: 76, label: 'Leveraged' }, 
    { risk: 90, ret: 72, label: 'Over-exposed' }, // Diminishing returns
  ], []);

  // Chart dimensions
  const W = 320, H = 140;
  const pl = 40, pr = 20, pt = 20, pb = 30;
  const iW = W - pl - pr, iH = H - pt - pb;

  // Scale functions
  const sx = (r: number) => pl + (r / 100) * iW;
  const sy = (r: number) => pt + (1 - r / 100) * iH;

  // Generate SVG paths
  const svgPts = curvePoints.map((p, i) => ({ x: sx(p.risk), y: sy(p.ret), idx: i, ...p }));
  const pathD = `M ${svgPts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`;
  const areaD = `${pathD} L ${svgPts[svgPts.length - 1].x.toFixed(1)},${(pt + iH).toFixed(1)} L ${svgPts[0].x.toFixed(1)},${(pt + iH).toFixed(1)} Z`;

  const displayIdx = hoverIdx !== null ? hoverIdx : activeIdx;
  const activePt = svgPts[displayIdx];
  
  // Calculate health (Sharpe Ratio = Return / Risk) and determine color
  const sharpe = activePt.ret / activePt.risk;
  let themeColor = '#10b981'; // Green (Healthy)
  if (sharpe < 1.0) themeColor = '#ef4444'; // Red (Poor return for the risk)
  else if (sharpe < 1.8) themeColor = '#f59e0b'; // Amber (Okay)

  return (
    <div className="relative select-none w-full">
      
      {/* Dynamic Status Panel */}
      <div className="flex items-center justify-between mb-4 bg-zinc-900/50 p-3 rounded-xl border border-white/5">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-0.5">Selected Portfolio</div>
          <div className="text-sm font-bold text-white">{activePt.label}</div>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-0.5">Risk</div>
            <div className="text-sm font-mono text-zinc-300">{activePt.risk}%</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-0.5">Return</div>
            <div className="text-sm font-mono text-zinc-300">{activePt.ret}%</div>
          </div>
          <div className="w-16">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-0.5">Efficiency</div>
            <div className="text-sm font-mono font-bold transition-colors duration-300" style={{ color: themeColor }}>
              {(sharpe).toFixed(2)}x
            </div>
          </div>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto drop-shadow-md" onMouseLeave={() => setHoverIdx(null)}>
        <defs>
          <linearGradient id="frontier-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={themeColor} stopOpacity="0.05"/>
            <stop offset="100%" stopColor={themeColor} stopOpacity="0.25"/>
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(t => (
          <React.Fragment key={t}>
            <line x1={pl + t * iW} y1={pt} x2={pl + t * iW} y2={pt + iH} stroke="#ffffff08" strokeWidth="1"/>
            <line x1={pl} y1={pt + t * iH} x2={pl + iW} y2={pt + t * iH} stroke="#ffffff08" strokeWidth="1"/>
          </React.Fragment>
        ))}

        {/* Axes */}
        <line x1={pl} y1={pt} x2={pl} y2={pt + iH} stroke="#ffffff20" strokeWidth="1.2"/>
        <line x1={pl} y1={pt + iH} x2={pl + iW} y2={pt + iH} stroke="#ffffff20" strokeWidth="1.2"/>

        {/* Axis Labels */}
        <text x={pl + iW / 2} y={H - 10} textAnchor="middle" fill="#71717a" fontSize="9" fontFamily="monospace">RISK (Volatility) →</text>
        <text x={pl - 24} y={pt + iH / 2 + 4} textAnchor="middle" fill="#71717a" fontSize="9" fontFamily="monospace">RETURN</text>

        {/* Data Paths */}
        <path d={areaD} fill="url(#frontier-gradient)" className="transition-all duration-500"/>
        <path d={pathD} fill="none" stroke="#3f3f46" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
        
        {/* Dynamic Highlight Line overlay */}
        <path d={`M ${svgPts.slice(0, displayIdx + 1).map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`} 
          fill="none" stroke={themeColor} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" 
          className="transition-all duration-300"
        />

        {/* Hover/Active Tracker */}
        <g className="transition-all duration-200" style={{ transform: `translate(${activePt.x}px, ${activePt.y}px)` }}>
          <line x1={0} y1={pt - activePt.y} x2={0} y2={pt + iH - activePt.y} stroke="#ffffff30" strokeWidth="1" strokeDasharray="4 3"/>
          <circle cx={0} cy={0} r="5" fill="#18181b" stroke={themeColor} strokeWidth="2.5"/>
          <circle cx={0} cy={0} r="14" fill={themeColor} fillOpacity="0.2"/>
        </g>

        {/* Invisible Hitboxes for accurate, jitter-free interaction */}
        {svgPts.map((p, i) => {
          const prevX = i === 0 ? pl : sx((curvePoints[i - 1].risk + p.risk) / 2);
          const nextX = i === svgPts.length - 1 ? pl + iW : sx((curvePoints[i + 1].risk + p.risk) / 2);
          return (
            <rect 
              key={i} x={prevX} y={pt} width={nextX - prevX} height={iH} 
              fill="transparent" 
              onMouseEnter={() => setHoverIdx(i)}
              onClick={() => setActiveIdx(i)}
              className="cursor-pointer"
            />
          );
        })}
      </svg>
      <p className="text-xs text-zinc-500 mt-4 text-center flex items-center justify-center gap-2">
        <Info className="w-3.5 h-3.5" />
        Click any point on the curve to lock in the portfolio and view its efficiency.
      </p>
    </div>
  );
}

/**
 * Hierarchical Risk Parity Visualization
 * Increased the viewBox height so weights are clearly visible. Added beginner-friendly
 * contextual tooltips below the network diagram.
 */
function HRPVisual() {
  const [hoveredCluster, setHoveredCluster] = useState<string | null>(null);

  const layout = { root: { cx: 160, cy: 25 } };
  const clusters = [
    {
      id: 'A', label: 'Growth Assets', cx: 80, cy: 80,
      desc: 'These assets tend to move together during economic booms.',
      children: [
        { id: 'tech', label: 'TECH', cx: 30, cy: 140, weight: '28%' },
        { id: 'semi', label: 'SEMI', cx: 80, cy: 140, weight: '22%' },
        { id: 'cons', label: 'RETAIL', cx: 130, cy: 140, weight: '17%' },
      ]
    },
    {
      id: 'B', label: 'Defensive Assets', cx: 240, cy: 80,
      desc: 'These hold value or rise when growth assets fall.',
      children: [
        { id: 'bond', label: 'BONDS', cx: 190, cy: 140, weight: '18%' },
        { id: 'cmd', label: 'GOLD', cx: 240, cy: 140, weight: '10%' },
        { id: 'reit', label: 'REAL EST', cx: 290, cy: 140, weight: '5%' },
      ]
    },
  ];

  const activeData = clusters.find(c => c.id === hoveredCluster);

  return (
    <div className="w-full">
      {/* Expanded height to 200px to prevent bottom text cutoff */}
      <svg viewBox="0 0 320 200" className="w-full h-auto drop-shadow-md select-none">
        
        {/* Connection Lines */}
        {clusters.map(cl => (
          <line key={`root-${cl.id}`} x1={layout.root.cx} y1={layout.root.cy} x2={cl.cx} y2={cl.cy}
            stroke={hoveredCluster === cl.id ? '#818cf8' : '#ffffff1a'}
            strokeWidth={hoveredCluster === cl.id ? 2 : 1.2}
            className="transition-all duration-300"
          />
        ))}
        {clusters.map(cl =>
          cl.children.map(child => (
            <line key={`child-${child.id}`} x1={cl.cx} y1={cl.cy} x2={child.cx} y2={child.cy}
              stroke={hoveredCluster === cl.id ? '#6366f180' : '#ffffff10'}
              strokeWidth={hoveredCluster === cl.id ? 1.5 : 1}
              className="transition-all duration-300"
            />
          ))
        )}

        {/* Nodes */}
        <circle cx={layout.root.cx} cy={layout.root.cy} r={14} fill="#09090b" stroke="#6366f1" strokeWidth="2"/>
        <text x={layout.root.cx} y={layout.root.cy + 4} textAnchor="middle" fill="#c7d2fe" fontSize="10" fontFamily="monospace" fontWeight="bold">PORT</text>

        {clusters.map(cl => (
          <g key={cl.id}>
            {/* Cluster Node */}
            <circle cx={cl.cx} cy={cl.cy} r={20}
              fill={hoveredCluster === cl.id ? '#6366f120' : '#18181b'}
              stroke={hoveredCluster === cl.id ? '#818cf8' : '#ffffff20'}
              strokeWidth="1.5"
              className="transition-all duration-300"
            />
            <text x={cl.cx} y={cl.cy + 4} textAnchor="middle"
              fill={hoveredCluster === cl.id ? '#e0e7ff' : '#a1a1aa'}
              fontSize="9" fontFamily="sans-serif" fontWeight="bold">{cl.label}</text>

            {/* Child Nodes */}
            {cl.children.map(child => (
              <g key={child.id}>
                <circle cx={child.cx} cy={child.cy} r={16}
                  fill={hoveredCluster === cl.id ? '#6366f115' : '#09090b'}
                  stroke={hoveredCluster === cl.id ? '#6366f160' : '#ffffff15'}
                  strokeWidth="1.2"
                  className="transition-all duration-300"
                />
                <text x={child.cx} y={child.cy + 3} textAnchor="middle"
                  fill={hoveredCluster === cl.id ? '#ffffff' : '#71717a'}
                  fontSize="8" fontFamily="monospace" fontWeight="bold">{child.label}</text>
                
                {/* Weight Tooltips - Positioned correctly inside bounds */}
                <text x={child.cx} y={child.cy + 32} textAnchor="middle"
                  fill={hoveredCluster === cl.id ? '#818cf8' : 'transparent'}
                  fontSize="10" fontFamily="monospace" fontWeight="bold"
                  className="transition-all duration-300">{child.weight}</text>
              </g>
            ))}

            {/* Invisible Hitbox for interaction */}
            <rect 
              x={cl.cx - 70} y={cl.cy - 30} width={140} height={140} 
              fill="transparent" 
              onMouseEnter={() => setHoveredCluster(cl.id)}
              onMouseLeave={() => setHoveredCluster(null)}
              className="cursor-pointer"
            />
          </g>
        ))}
      </svg>
      
      {/* Novice-friendly explainer text */}
      <div className="h-10 mt-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {activeData ? (
            <motion.p key="desc" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
              className="text-sm text-indigo-300 text-center font-medium bg-indigo-500/10 py-2 px-4 rounded-lg">
              {activeData.desc}
            </motion.p>
          ) : (
            <motion.p key="prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-xs text-zinc-500 text-center flex items-center gap-2">
              <Info className="w-3.5 h-3.5" />
              Hover over a cluster branch to see how assets behave together.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Risk Parity Visualization
 */
function RiskParityVisual() {
  const [mode, setMode] = useState<'dollar' | 'parity'>('dollar');

  const assets = [
    { label: 'US Stocks',   dollar60: 60, risk60: 88,  dollarRP: 22, riskRP: 33, color: '#f59e0b' },
    { label: 'Global Bonds',  dollar60: 30, risk60: 9,   dollarRP: 52, riskRP: 34, color: '#6366f1' },
    { label: 'Commodities',   dollar60: 10, risk60: 3,   dollarRP: 26, riskRP: 33, color: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
        {(['dollar', 'parity'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-5 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              mode === m ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {m === 'dollar' ? 'Standard 60/40' : 'Risk Parity'}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {assets.map((a) => {
          const dw = mode === 'dollar' ? a.dollar60 : a.dollarRP;
          const rw = mode === 'dollar' ? a.risk60 : a.riskRP;
          return (
            <div key={a.label} className="relative">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-semibold text-zinc-300">{a.label}</span>
                <div className="flex gap-5 text-right">
                  <span className="text-xs font-mono text-zinc-500 w-24">Money In: {dw}%</span>
                  <span className="text-xs font-mono font-bold w-24" style={{ color: a.color }}>Risk Load: {rw}%</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <div className="h-2.5 bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ backgroundColor: a.color, opacity: 0.3 }}
                    animate={{ width: `${dw}%` }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}/>
                </div>
                <div className="h-2.5 bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ backgroundColor: a.color }}
                    animate={{ width: `${rw}%` }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}/>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={mode} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
          className="text-sm leading-relaxed mt-4 p-4 rounded-lg bg-zinc-900/80 border border-zinc-800" 
          style={{ borderLeftWidth: '4px', borderLeftColor: mode === 'dollar' ? '#f59e0b' : '#10b981' }}>
          {mode === 'dollar'
            ? <p className="text-zinc-300"><strong>The Illusion of Safety:</strong> You put 60% of your money in stocks, but stocks are so volatile that they actually account for nearly 90% of your portfolio&apos;s total danger.</p>
            : <p className="text-zinc-300"><strong>True Balance:</strong> Instead of splitting your dollars evenly, we split your risk evenly. Now, no single asset class can single-handedly tank your portfolio.</p>}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/**
 * AI Hedge Discovery Visualization
 */
function AIHedgeVisual() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { label: 'Read & Learn', detail: 'The AI reads through thousands of pages of confusing company filings, earnings calls, and news in seconds.', color: '#71717a' },
    { label: 'Find Hidden Risks', detail: 'It spots threats that aren\'t obvious on a chart, like a company relying too heavily on one factory in a conflict zone.', color: '#6366f1' },
    { label: 'Categorize', detail: 'It groups these threats into plain-English categories: "Supply Chain Issues", "Interest Rate Sensitivity", etc.', color: '#a78bfa' },
    { label: 'Suggest Protection', detail: 'Finally, it suggests specific, actionable trades (like buying a targeted ETF) that act as an insurance policy against those exact threats.', color: '#10b981' },
  ];

  return (
    <div className="space-y-3">
      {steps.map((s, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }} className="flex items-stretch gap-4">
          
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full mt-4 shrink-0 transition-all duration-300"
              style={{ backgroundColor: activeStep === i ? s.color : '#27272a', boxShadow: activeStep === i ? `0 0 10px ${s.color}80` : 'none' }}/>
            {i < steps.length - 1 && (
              <div className="w-0.5 flex-1 mt-2 transition-colors duration-300"
                style={{ backgroundColor: activeStep === i ? `${s.color}40` : '#ffffff10' }}/>
            )}
          </div>

          <motion.div onClick={() => setActiveStep(i)} className="flex-1 rounded-xl px-5 py-3 mb-2 border cursor-pointer transition-all duration-300"
            animate={{ 
              backgroundColor: activeStep === i ? `${s.color}15` : '#18181b', 
              borderColor: activeStep === i ? `${s.color}40` : '#27272a' 
            }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold tracking-wide transition-colors duration-300"
                style={{ color: activeStep === i ? s.color : '#a1a1aa' }}>{s.label}</span>
              <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded-md">Step {i + 1}</span>
            </div>
            
            <AnimatePresence>
              {activeStep === i && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <p className="text-sm text-zinc-300 mt-3 leading-relaxed border-t border-white/5 pt-3">
                    {s.detail}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

// Data Configuration


const CAPABILITIES: Capability[] = [
  {
    id: 'frontier',
    index: '01',
    tag: 'OPTIMIZATION ENGINE',
    title: 'The Efficient Frontier',
    body: 'Standard models try to find the highest return for a given risk level, but they are fragile. If one assumption is wrong, the whole portfolio breaks. We blend historical market data with realistic views to create a portfolio that stays sturdy even when the market throws a curveball.',
    aside: 'Most tools build portfolios based on what worked yesterday. This engine is designed to survive tomorrow.',
    accent: '#10b981',
    accentBg: '#10b98115',
    icon: <TrendingUp className="w-6 h-6" />,
    metrics: [
      { label: 'Efficiency', value: 'Optimized' },
      { label: 'Model Type', value: 'Black-Litterman' },
      { label: 'Rebalancing', value: 'Dynamic' },
    ],
    visual: <FrontierVisual />,
  },
  {
    id: 'hrp',
    index: '02',
    tag: 'CRASH RESILIENCE',
    title: 'Smart Clustering',
    body: 'During a market crash, traditional diversification fails because everything drops at once. Our AI groups assets into a "family tree" based on how they actually behave in the real world, rather than just their industry label. This prevents you from secretly holding 10 things that all crash together.',
    aside: 'True diversification isn\'t about owning a lot of things. It\'s about owning things that behave differently.',
    accent: '#6366f1',
    accentBg: '#6366f115',
    icon: <Network className="w-6 h-6" />,
    metrics: [
      { label: 'Method', value: 'Behavioral Grouping' },
      { label: 'Crash Protection', value: 'High' },
      { label: 'Recovery Speed', value: 'Accelerated' },
    ],
    visual: <HRPVisual />,
  },
  {
    id: 'riskparity',
    index: '03',
    tag: 'ALLOCATION FRAMEWORK',
    title: 'Risk Parity',
    body: 'A classic 60% stock / 40% bond split looks safe on paper, but stocks are so volatile that they dictate 90% of your actual performance. Risk Parity fixes this by sizing your positions based on how risky they are, ensuring every investment pulls its own weight.',
    aside: 'How you split your dollars is not how you split your risk. Equalizing risk is the secret behind "All-Weather" funds.',
    accent: '#f59e0b',
    accentBg: '#f59e0b15',
    icon: <Scale className="w-6 h-6" />,
    metrics: [
      { label: 'Target Strategy', value: 'Equal Volatility' },
      { label: 'Focus Area', value: 'Downside Protection' },
      { label: 'Stability Gain', value: 'Significant' },
    ],
    visual: <RiskParityVisual />,
  },
  {
    id: 'ai-hedge',
    index: '04',
    tag: 'INTELLIGENCE LAYER',
    title: 'AI Implementation',
    body: 'Instead of guessing how to protect your portfolio, our AI reads thousands of dense financial reports to find hidden threats, like a company relying too heavily on one factory. It then automatically suggests a specific "insurance" trade to protect you against that exact vulnerability.',
    aside: 'The best protection is rarely obvious. Sometimes the safest move is an asset you wouldn\'t have thought to look at.',
    accent: '#a78bfa',
    accentBg: '#a78bfa15',
    icon: <BrainCircuit className="w-6 h-6" />,
    metrics: [
      { label: 'Data Analyzed', value: 'SEC Filings & News' },
      { label: 'Outputs', value: 'Actionable Trades' },
      { label: 'Speed', value: 'Real-time' },
    ],
    visual: <AIHedgeVisual />,
  },
];


// Main Component


export default function ProblemSolution() {
  const [activeId, setActiveId] = useState<string>(CAPABILITIES[0].id);
  const active = useMemo(() => CAPABILITIES.find(c => c.id === activeId) ?? CAPABILITIES[0], [activeId]);
  
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  return (
    <section ref={sectionRef} className="relative bg-black w-full overflow-hidden py-24 md:py-32 px-6 sm:px-10">

      {/* Background Decorators */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-size-[80px_80px]" />
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-rrom-transparent via-white/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
      </motion.div>

      {/* Widened container max-width for better horizontal spacing */}
      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Section Header */}
        <div className="mb-16 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex items-center gap-4 mb-6">
            <div className="h-0.5 w-12 bg-white/20" />
            <span className="text-sm font-mono text-zinc-400 uppercase tracking-[0.3em] font-bold">The Engine</span>
          </motion.div>

          <motion.h2 initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.05] text-white mb-6">
            Institutional-grade<br />
            <span className="text-zinc-600">tools, finally</span><br />
            <span className="italic font-light text-zinc-300">within reach.</span>
          </motion.h2>

          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-lg sm:text-xl leading-relaxed max-w-2xl">
            Four professional frameworks used by top hedge funds translated into clear, interactive tools that help you build a bulletproof portfolio.
          </motion.p>
        </div>

        {/* Interactive Workspace Area - Widened right column */}
        <div className="grid lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)] gap-8 xl:gap-12 items-start">

          {/* Left Panel: Navigation Menu */}
          <div className="space-y-2">
            {CAPABILITIES.map((cap, i) => (
              <motion.button key={cap.id} onClick={() => setActiveId(cap.id)}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`w-full text-left group relative flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-300 ${
                  activeId === cap.id ? 'border-white/15 bg-white/5 shadow-lg' : 'border-transparent hover:border-white/10 hover:bg-white/5'
                }`}
              >
                {/* Active Indicator Bar */}
                {activeId === cap.id && (
                  <motion.div layoutId="activeNavigation"
                    className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
                    style={{ backgroundColor: cap.accent }}
                  />
                )}
                
                <span className="text-sm font-mono text-zinc-600 w-8 text-right shrink-0">{cap.index}</span>
                
                {/* Icon Container */}
                <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300"
                  style={{
                    backgroundColor: activeId === cap.id ? cap.accentBg : '#18181b',
                    borderColor: activeId === cap.id ? `${cap.accent}40` : '#27272a',
                    color: activeId === cap.id ? cap.accent : '#52525b',
                  }}>
                  {cap.icon}
                </div>
                
                {/* Text Content */}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-1 font-semibold">{cap.tag}</div>
                  <div className={`text-base font-bold transition-colors duration-300 ${activeId === cap.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                    {cap.title}
                  </div>
                </div>
                
                <ChevronRight className="w-5 h-5 shrink-0 transition-all duration-300"
                  style={{ color: cap.accent, opacity: activeId === cap.id ? 1 : 0, transform: activeId === cap.id ? 'translateX(0)' : 'translateX(-8px)' }}/>
              </motion.button>
            ))}

            {/* Contextual Information Box */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-6 p-6 rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-[0.2em] font-bold">The Bottom Line</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.p key={active.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                  className="text-sm sm:text-base text-zinc-300 leading-relaxed italic pl-4 border-l-2"
                  style={{ borderColor: `${active.accent}60` }}>
                  &ldquo;{active.aside}&rdquo;
                </motion.p>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Right Panel: Active Capability Detail */}
          <AnimatePresence mode="wait">
            <motion.div key={active.id} initial={{ opacity: 0, scale: 0.98, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -20 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl overflow-hidden flex flex-col h-full">

              {/* Detail Header */}
              <div className="p-6 sm:p-8 border-b border-white/10 flex items-start gap-6 justify-between">
                <div className="flex-1">
                  <div className="inline-block px-3 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-widest mb-4"
                    style={{ backgroundColor: active.accentBg, color: active.accent }}>
                    {active.tag}
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">{active.title}</h3>
                  <p className="text-zinc-400 text-base leading-relaxed max-w-2xl">{active.body}</p>
                </div>
                <div className="hidden sm:flex shrink-0 w-16 h-16 rounded-2xl items-center justify-center border"
                  style={{ backgroundColor: active.accentBg, borderColor: `${active.accent}30`, color: active.accent }}>
                  {active.icon}
                </div>
              </div>

              {/* Interactive Visual Canvas */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center bg-zinc-950/50">
                <div className="text-xs font-mono text-zinc-600 uppercase tracking-widest mb-6 font-bold flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: active.accent }} />
                  Interactive Example
                </div>
                {active.visual}
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Feature Strip */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.3 }}
          className="mt-24 pt-12 border-t border-white/10 grid md:grid-cols-3 gap-10">
          {[
            { title: 'Stress-Test Your Ideas', body: 'Simulate a 2008-style market crash or an inflation spike to see how your money would react before it happens.' },
            { title: 'See the Unseen Risk', body: 'Uncover hidden dangers tucked away in financial reports that standard brokerage dashboards completely miss.' },
            { title: 'Protect Your Downside', body: 'We prioritize frameworks that protect you when the market falls, because recovering from a 50% loss requires a 100% gain.' },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="space-y-3">
              <div className="text-lg font-bold text-white tracking-tight">{item.title}</div>
              <p className="text-sm text-zinc-500 leading-relaxed">{item.body}</p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}