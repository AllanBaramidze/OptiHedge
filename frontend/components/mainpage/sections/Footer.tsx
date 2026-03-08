import React from 'react';
import Link from 'next/link';
import { Twitter, Github, Linkedin, Mail } from 'lucide-react';


// Configuration


/**
 * Footer link configuration.
 * Extracted from JSX to keep the component clean and make future additions trivial.
 */
const FOOTER_CATEGORIES = [
  {
    title: 'Tools',
    links: [
      { label: 'Wallet Creation', href: '/upload' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Hedge Discovery', href: '/risk' },
    ],
  },
  {
    title: 'References',
    links: [
      { label: 'Research Papers', href: '#' },
      { label: 'Glossary', href: '#' },
    ],
  },
  {
    title: 'Contact',
    links: [
      { label: 'Support / Email', href: 'mailto:support@optihedge.com' }, // Placeholder email
      { label: 'GitHub Repository', href: 'https://github.com/AllanBaramidze' },
      { label: 'Report a Bug', href: '#' },
    ],
  },
];

// Main Component


export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-white/5 pt-20 pb-10 px-6 sm:px-10">
      <div className="max-w-7xl mx-auto">

        {/* Top Section: Brand & Link Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & Socials Column (Takes up 2 columns on large screens) */}
          <div className="lg:col-span-2">
            <Link href="/" className="text-2xl font-bold tracking-tight text-white mb-4 block hover:text-white/80 transition-colors">
              OptiHedge
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-sm mb-6">
              Empowering retail investors with state-of-the-art AI and quant models. 
              Protecting gains shouldn&apos;t be a privilege of the elite.
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-4 items-center">
              <a 
                href="https://x.com/amidze1" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Twitter Profile"
                className="text-zinc-500 hover:text-[#1DA1F2] transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com/AllanBaramidze" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="GitHub Profile"
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              {/* Optional placeholders for future use */}
              <a 
                href="https://www.linkedin.com/in/allan-b-234145230/" 
                aria-label="LinkedIn Profile"
                className="text-zinc-500 hover:text-[#0A66C2] transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Dynamic Link Columns */}
          {FOOTER_CATEGORIES.map((category) => (
            <div key={category.title}>
              <h4 className="text-white font-semibold text-sm mb-5">{category.title}</h4>
              <ul className="space-y-3.5 text-sm">
                {category.links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href} 
                      className="text-zinc-500 hover:text-zinc-300 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
         
        </div>

        {/* Bottom Section: Copyright & Disclaimer */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-xs">
            © {new Date().getFullYear()} OptiHedge. Built for reassurance.
          </p>
          <p className="text-zinc-600 text-[10px] uppercase tracking-widest max-w-lg text-center md:text-right leading-relaxed">
            Disclaimers: Not financial advice. Past performance does not guarantee future results.
          </p>
        </div>
        
      </div>
    </footer>
  );
}