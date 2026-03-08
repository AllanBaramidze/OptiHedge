import React from 'react';
import Link from 'next/link';
import { Twitter, Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-white/5 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Bottom CTA Block */}
        <div className="relative rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/10 p-12 mb-24 overflow-hidden text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to hedge smarter?</h2>
          <p className="text-white/50 mb-8 max-w-lg mx-auto">
            Join 1,200+ retail traders using AI to protect their upside. 
            No credit card required.
          </p>
          <Link 
            href="/upload" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform"
          >
            Start Free Analysis
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="text-2xl font-bold tracking-tight text-white mb-6 block">
              OptiHedge
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs mb-6">
              Empowering retail investors with state-of-the-art AI and quant models. 
              Protecting gains shouldn't be a privilege of the elite.
            </p>
            <div className="flex gap-4">
              <Twitter className="w-5 h-5 text-white/20 hover:text-blue-400 cursor-pointer transition-colors" />
              <Github className="w-5 h-5 text-white/20 hover:text-white cursor-pointer transition-colors" />
              <Linkedin className="w-5 h-5 text-white/20 hover:text-blue-600 cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-white/40">
              <li><Link href="/risk" className="hover:text-white">Risk Analysis</Link></li>
              <li><Link href="/upload" className="hover:text-white">Portfolio Sync</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-white/40">
              <li><Link href="/about" className="hover:text-white">Research</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>

          <div className="hidden lg:block">
            <h4 className="text-white font-bold text-sm mb-6">Support</h4>
            <ul className="space-y-4 text-sm text-white/40">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@optihedge.ai</li>
              <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/20 text-xs">
            © 2026 OptiHedge. Built by traders for traders.
          </p>
          <p className="text-white/20 text-[10px] uppercase tracking-widest max-w-md text-center md:text-right">
            Disclaimers: Not financial advice. Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </footer>
  );
}