import React from 'react';
import { ComHubLogo } from './common/ComHubLogo';

interface TheatricalStageFrameProps {
  children: React.ReactNode;
  curtainsOpen?: boolean;
  className?: string;
}

export const TheatricalStageFrame: React.FC<TheatricalStageFrameProps> = ({ children, className }) => {
  return (
    <div className={`relative w-full h-full min-h-screen bg-[#0e0e0e] text-white overflow-hidden flex flex-col justify-between select-none ${className || ''}`}>
      {/* Top Projector Header: Enlarged, High-Contrast Branding Readable from Auditorium Back */}
      <header className="relative z-30 w-full px-8 md:px-14 py-4 flex items-center justify-between border-b border-neutral-800/60 bg-black/40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="font-black text-2xl sm:text-3xl text-white tracking-tight">
            BITS GOT <span className="text-[#e50914]">LATENT</span>
          </span>
        </div>

        {/* ComHub Official Logo Sticker in Top-Right Corner */}
        <div className="flex items-center">
          <ComHubLogo size={56} />
        </div>
      </header>

      {/* Main Slide Content Arena: Maximized Viewport Presence */}
      <main className="relative z-20 flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-4 flex flex-col justify-center">
        {children}
      </main>
    </div>
  );
};
