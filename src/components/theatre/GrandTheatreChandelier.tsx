import React from 'react';

interface GrandTheatreChandelierProps {
  glowOpacity?: number; // 0 to 1 controlled by GSAP
}

export const GrandTheatreChandelier: React.FC<GrandTheatreChandelierProps> = ({ glowOpacity = 1 }) => {
  return (
    <div className="relative w-64 md:w-80 h-44 flex flex-col items-center pointer-events-none select-none">
      {/* Hanging Brass Chain from Ceiling */}
      <div className="w-1.5 h-12 bg-gradient-to-b from-[#451a03] via-[#d4af37] to-[#8c6d1f]" />

      {/* Warm Ambient Volumetric Glow Pool */}
      <div
        className="absolute top-10 w-96 h-72 rounded-full pointer-events-none transition-opacity duration-700 -z-10"
        style={{
          opacity: glowOpacity * 0.85,
          background: 'radial-gradient(ellipse at center, rgba(254,240,138,0.35) 0%, rgba(212,175,55,0.18) 40%, transparent 75%)',
          filter: 'blur(20px)',
        }}
      />

      {/* Chandelier SVG Armature */}
      <svg
        className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]"
        viewBox="0 0 300 160"
        fill="none"
      >
        <defs>
          <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="35%" stopColor="#d4af37" />
            <stop offset="70%" stopColor="#a16207" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>

          <radialGradient id="crystalGlint" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#fef08a" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0.3" />
          </radialGradient>
        </defs>

        {/* Central Finial & Crown */}
        <path d="M142,0 L158,0 L155,18 L145,18 Z" fill="url(#brassGrad)" />
        <ellipse cx="150" cy="22" rx="14" ry="6" fill="url(#brassGrad)" />
        <circle cx="150" cy="30" r="8" fill="url(#brassGrad)" />

        {/* Upper tier crystal chains */}
        <path d="M150,30 Q110,45 80,60" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="3 3" opacity={glowOpacity} />
        <path d="M150,30 Q190,45 220,60" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="3 3" opacity={glowOpacity} />
        <path d="M150,30 Q130,50 110,65" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="3 3" opacity={glowOpacity} />
        <path d="M150,30 Q170,50 190,65" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="3 3" opacity={glowOpacity} />

        {/* Main Curved Brass Arms */}
        {/* Far Left Arm */}
        <path d="M150,60 C120,65 70,75 50,60 C38,50 45,35 60,35" stroke="url(#brassGrad)" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Mid Left Arm */}
        <path d="M150,65 C130,70 100,80 90,65 C82,55 90,45 105,45" stroke="url(#brassGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Mid Right Arm */}
        <path d="M150,65 C170,70 200,80 210,65 C218,55 210,45 195,45" stroke="url(#brassGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Far Right Arm */}
        <path d="M150,60 C180,65 230,75 250,60 C262,50 255,35 240,35" stroke="url(#brassGrad)" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Candle Sconces & Flames */}
        {[
          { x: 60, y: 35 },
          { x: 105, y: 45 },
          { x: 150, y: 50 },
          { x: 195, y: 45 },
          { x: 240, y: 35 },
        ].map((candle, idx) => (
          <g key={idx} style={{ opacity: glowOpacity }}>
            {/* Candle base dish */}
            <ellipse cx={candle.x} cy={candle.y} rx="9" ry="3.5" fill="url(#brassGrad)" />
            {/* Wax candle body */}
            <rect x={candle.x - 2.5} y={candle.y - 12} width="5" height="12" fill="#fffbeb" rx="1" />
            {/* Candle Flame with Warm Pulsing Shimmer */}
            <path
              d={`M${candle.x},${candle.y - 22} Q${candle.x + 3.5},${candle.y - 16} ${candle.x},${candle.y - 13} Q${candle.x - 3.5},${candle.y - 16} ${candle.x},${candle.y - 22} Z`}
              fill="#fbbf24"
              className="animate-pulse"
              style={{ filter: 'drop-shadow(0 0 6px #f59e0b)' }}
            />
            <circle cx={candle.x} cy={candle.y - 16} r="2" fill="#ffffff" />
          </g>
        ))}

        {/* Lower Crystal Drops & Pendalogues */}
        {[
          { x: 60, y: 42, len: 18 },
          { x: 80, y: 65, len: 14 },
          { x: 105, y: 52, len: 18 },
          { x: 128, y: 72, len: 16 },
          { x: 150, y: 78, len: 26 },
          { x: 172, y: 72, len: 16 },
          { x: 195, y: 52, len: 18 },
          { x: 220, y: 65, len: 14 },
          { x: 240, y: 42, len: 18 },
        ].map((crystal, cIdx) => (
          <g key={`c-${cIdx}`} style={{ opacity: glowOpacity }}>
            <line x1={crystal.x} y1={crystal.y} x2={crystal.x} y2={crystal.y + 6} stroke="#fef08a" strokeWidth="1" />
            {/* Teardrop crystal facet */}
            <path
              d={`M${crystal.x},${crystal.y + 6} L${crystal.x + 4.5},${crystal.y + crystal.len - 4} L${crystal.x},${crystal.y + crystal.len} L${crystal.x - 4.5},${crystal.y + crystal.len - 4} Z`}
              fill="url(#crystalGlint)"
              stroke="#d4af37"
              strokeWidth="0.5"
            />
          </g>
        ))}
      </svg>
    </div>
  );
};
