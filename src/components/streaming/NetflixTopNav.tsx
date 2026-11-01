import React, { useState, useEffect } from 'react';
import { Search, Play, Maximize2, Minimize2 } from 'lucide-react';

interface NetflixTopNavProps {
  currentTab: string;
  onNavigateTab: (tab: string) => void;
  onSwitchExperience: (exp: 'streaming' | 'admin' | 'judge' | 'contestant' | 'presentation') => void;
  onWatchLive?: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const NetflixTopNav: React.FC<NetflixTopNavProps> = ({
  currentTab,
  onNavigateTab,
  onSwitchExperience,
  onWatchLive,
  onToggleFullscreen,
  isFullscreen,
  searchQuery,
  onSearchChange,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-12 py-3.5 flex items-center justify-between ${
        isScrolled
          ? 'bg-[#141414] shadow-lg border-b border-[#282828]'
          : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent'
      }`}
    >
      {/* Left: Netflix-Style Brand Logo & Navigation Links */}
      <div className="flex items-center gap-6 md:gap-10">
        <button
          onClick={() => onNavigateTab('home')}
          className="text-left focus:outline-none"
        >
          <span className="font-display text-2xl md:text-3xl font-black text-[#e50914] tracking-wider uppercase drop-shadow-md">
            BITS GOT LATENT
          </span>
        </button>

        <nav aria-label="Streaming showcase categories" className="hidden lg:flex items-center gap-5 text-sm font-medium">
          <button
            onClick={() => onNavigateTab('home')}
            className={`transition-colors hover:text-white ${
              currentTab === 'home' ? 'text-white font-bold' : 'text-[#b3b3b3]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigateTab('contestants')}
            className={`transition-colors hover:text-white ${
              currentTab === 'contestants' ? 'text-white font-bold' : 'text-[#b3b3b3]'
            }`}
          >
            Performers
          </button>
          <button
            onClick={() => onNavigateTab('judges')}
            className={`transition-colors hover:text-white ${
              currentTab === 'judges' ? 'text-white font-bold' : 'text-[#b3b3b3]'
            }`}
          >
            Evaluators
          </button>
          <button
            onClick={() => onNavigateTab('standings')}
            className={`transition-colors hover:text-white ${
              currentTab === 'standings' ? 'text-white font-bold' : 'text-[#b3b3b3]'
            }`}
          >
            Live Standings
          </button>
        </nav>
      </div>

      {/* Right: Search, Fullscreen Mode Toggle & Live Broadcast Launch */}
      <div className="flex items-center gap-3 md:gap-4 text-sm text-[#e5e5e5]">
        {/* Search Input */}
        <div className="relative flex items-center">
          {isSearchOpen ? (
            <div className="flex items-center bg-black/80 border border-white/30 rounded px-2.5 py-1 transition-all">
              <Search className="w-4 h-4 text-[#b3b3b3] mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search performers, branches..."
                className="bg-transparent text-xs text-white placeholder-[#808080] focus:outline-none w-36 sm:w-48"
                autoFocus
                onBlur={() => {
                  if (!searchQuery) setIsSearchOpen(false);
                }}
              />
            </div>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 hover:text-white text-neutral-300 transition-colors"
              title="Search performers"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dedicated Fullscreen Toggle Button (Safe Kiosk Mode) */}
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 hover:text-white text-xs font-semibold rounded transition-colors border border-neutral-700/80 shadow"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Immersive Fullscreen Mode'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
        )}

        {/* Watch Live Broadcast Button (Enters Fullscreen Stage Automatically) */}
        <button
          onClick={onWatchLive || (() => onSwitchExperience('presentation'))}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-[#e50914] hover:bg-[#b81d24] text-white text-xs font-bold rounded transition-all shadow-md active:scale-95"
          title="Watch Live Broadcast in Fullscreen"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Watch Live Broadcast</span>
        </button>
      </div>
    </header>
  );
};
