import React from 'react';

export default function LandingPage() {
  return (
    <div className="w-full max-w-6xl mx-auto px-6 pt-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Placeholder feature cards */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md hover:border-white/30 transition-colors">
            <h3 className="text-xl font-semibold mb-2">Feature 0{i}</h3>
            <p className="text-muted-foreground">Sophisticated risk management tools built for retail traders.</p>
          </div>
        ))}
      </div>
    </div>
  );
}