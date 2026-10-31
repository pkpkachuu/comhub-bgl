import React, { useState, useEffect } from 'react';
import { Search, Bell, MonitorPlay, Shield, Award, Play } from 'lucide-react';

interface NetflixTopNavProps {
  currentTab: string;
  onNavigateTab: (tab: string) => void;
  onSwitchExperience: (exp: 'streaming' | 'admin' | 'judge' | 'contestant' | 'presentation') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const NetflixTopNav: React.FC<NetflixTopNavProps> = ({
  currentTab,
  onNavigateTab,
  onSwitchExperience,
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
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            onNavigateTab('home');
          }}
          className="flex items-center gap-2 group"
        >
          <span className="text-2xl md:text-3xl font-black text-[#e50914] tracking-tighter">
            BITS GOT LATENT
          </span>
          <span className="text-[10px] bg-[#e50914] text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
            LIVE
          </span>
        </a>

        {/* Streaming Nav Links */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-[#e5e5e5]">
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
            Contestants
          </button>
          <button
            onClick={() => onNavigateTab('guests')}
            className={`transition-colors hover:text-white ${
              currentTab === 'guests' ? 'text-white font-bold' : 'text-[#b3b3b3]'
            }`}
          >
            Featured Guests
          </button>
          <button
            onClick={() => onNavigateTab('rules')}
            className={`transition-colors hover:text-white ${
              currentTab === 'rules' ? 'text-white font-bold' : 'text-[#b3b3b3]'
            }`}
          >
            Scoring Rules
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

      {/* Right: Search, Experience Quick Access, and Profile */}
      <div className="flex items-center gap-3 md:gap-5 text-sm text-[#e5e5e5]">
        {/* Search Input */}
        <div className="relative flex items-center">
          {isSearchOpen ? (
            <div className="flex items-center bg-black/80 border border-white/30 rounded px-2.5 py-1 transition-all">
              <Search className="w-4 h-4 text-[#b3b3b3] mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Titles, performers, genres..."
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
              className="p-1 hover:text-white transition-colors"
              title="Search performers"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Live Presentation Mode Quick Launch */}
        <button
          onClick={() => onSwitchExperience('presentation')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e50914] hover:bg-[#b81d24] text-white text-xs font-semibold rounded transition-colors shadow-md"
          title="Launch Fullscreen Presentation for Projector"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span className="hidden sm:inline">Launch Live Show</span>
        </button>

        {/* Role Switcher Drawer Menu */}
        <div className="flex items-center gap-1 border-l border-[#333333] pl-3">
          <button
            onClick={() => onSwitchExperience('admin')}
            className="p-1.5 text-xs text-[#b3b3b3] hover:text-white hover:bg-[#262626] rounded transition-colors flex items-center gap-1"
            title="Open Producer Admin Console"
          >
            <Shield className="w-4 h-4" />
            <span className="hidden xl:inline text-[11px]">Admin</span>
          </button>

          <button
            onClick={() => onSwitchExperience('judge')}
            className="p-1.5 text-xs text-[#b3b3b3] hover:text-white hover:bg-[#262626] rounded transition-colors flex items-center gap-1"
            title="Open Single-Operator Judge Scoring"
          >
            <Award className="w-4 h-4" />
            <span className="hidden xl:inline text-[11px]">Judge Room</span>
          </button>

          <button
            onClick={() => onSwitchExperience('contestant')}
            className="p-1.5 text-xs text-[#b3b3b3] hover:text-white hover:bg-[#262626] rounded transition-colors flex items-center gap-1"
            title="Open Contestant Token Vault"
          >
            <MonitorPlay className="w-4 h-4" />
            <span className="hidden xl:inline text-[11px]">Vault</span>
          </button>
        </div>
      </div>
    </header>
  );
};
