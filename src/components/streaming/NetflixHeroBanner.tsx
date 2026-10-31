import React from 'react';
import { Play, Info } from 'lucide-react';
import { Contestant, HomepageSettings } from '../../types';

interface NetflixHeroBannerProps {
  homepageSettings?: HomepageSettings;
  featuredContestant?: Contestant | null;
  onWatchLive: () => void;
  onExploreContestants: () => void;
  onOpenDetails: (contestant: Contestant) => void;
}

export const NetflixHeroBanner: React.FC<NetflixHeroBannerProps> = ({
  homepageSettings,
  featuredContestant,
  onWatchLive,
  onExploreContestants,
  onOpenDetails,
}) => {
  const bannerImage = homepageSettings?.heroBannerUrl || featuredContestant?.photoUrl || '/uploads/hero_stage.jpg';
  const title = homepageSettings?.heroTitle || 'BITS GOT LATENT';
  const description =
    homepageSettings?.heroDescription ||
    'The collegiate live showcase where performers predict their own score before facing the five-evaluator panel. Calibration, raw nerve, and mathematical reality under the studio spotlight.';

  return (
    <section className="relative w-full h-[82vh] min-h-[540px] max-h-[760px] overflow-hidden select-none bg-[#141414]">
      {/* Background Hero Photography */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={bannerImage}
          alt={title}
          className="w-full h-full object-cover object-center filter brightness-90 contrast-105"
        />

        {/* Netflix Gradients Scrims */}
        <div className="absolute inset-0 netflix-hero-scrim" />
        <div className="absolute inset-0 netflix-bottom-fade" />
        <div className="absolute inset-0 netflix-top-fade" />
      </div>

      {/* Hero Content Overlay (Left-Aligned, Spacious, Cinematic) */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-4 md:px-12 flex flex-col justify-center max-w-2xl text-left space-y-4">
        {/* Brand Kicker */}
        <div className="flex items-center gap-2">
          <span className="text-sm tracking-widest text-[#e50914] font-bold uppercase">
            COMEDY HUB
          </span>
          <span className="text-neutral-500 text-xs">·</span>
          <span className="text-xs uppercase tracking-widest text-neutral-300 font-semibold">
            OASIS DAY 4
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white leading-none tracking-tight drop-shadow-xl">
          {title.includes('LATENT') ? (
            <>
              {title.replace('LATENT', '')}
              <span className="text-[#e50914]">LATENT</span>
            </>
          ) : (
            title
          )}
        </h1>

        {/* Adaptation Credit Line */}
        <div className="flex items-center gap-2 text-xs md:text-sm text-neutral-200 font-medium">
          <span className="text-[#e50914] font-bold tracking-wider">ADAPTED FROM:</span>
          <span className="italic text-white">Samay Raina's "Indian's Got Latent"</span>
        </div>

        {/* Synopsis */}
        <p className="text-sm md:text-base text-neutral-200 leading-relaxed max-w-xl font-normal drop-shadow-md">
          {description}
        </p>

        {/* Zero-Pill Unboxed Metadata Line */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-300 pt-1">
          <span className="text-white font-semibold">10-Point Scale</span>
          <span className="text-neutral-500">·</span>
          <span>0.5 Increments</span>
          <span className="text-neutral-500">·</span>
          <span>5 Evaluators</span>
          <span className="text-neutral-500">·</span>
          <span className="text-neutral-400">Jomedy · Priyanshu · ComHub Arbiters</span>
        </div>

        {/* Action Buttons (Authentic Netflix Desktop Buttons) */}
        <div className="flex items-center gap-3.5 pt-3">
          <button
            onClick={onWatchLive}
            className="flex items-center gap-2.5 px-7 py-2.5 bg-white hover:bg-neutral-200 text-black font-bold text-sm md:text-base rounded transition-all transform active:scale-95 shadow-lg"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Watch Live Broadcast</span>
          </button>

          {featuredContestant ? (
            <button
              onClick={() => onOpenDetails(featuredContestant)}
              className="flex items-center gap-2 px-6 py-2.5 bg-white/25 hover:bg-white/35 text-white font-bold text-sm md:text-base rounded transition-all transform active:scale-95 backdrop-blur-sm"
            >
              <Info className="w-5 h-5" />
              <span>More Info</span>
            </button>
          ) : (
            <button
              onClick={onExploreContestants}
              className="flex items-center gap-2 px-6 py-2.5 bg-white/25 hover:bg-white/35 text-white font-bold text-sm md:text-base rounded transition-all transform active:scale-95 backdrop-blur-sm"
            >
              <Info className="w-5 h-5" />
              <span>Explore Contestants</span>
            </button>
          )}
        </div>
      </div>

      {/* Right Side: Maturity & Live Broadcast Tag */}
      <div className="absolute right-0 bottom-24 hidden md:flex items-center bg-black/60 border-l-4 border-[#e50914] px-4 py-2 text-xs text-white backdrop-blur-md">
        <span className="font-bold">16+</span>
        <span className="mx-2 text-neutral-500">|</span>
        <span>NAB AUDITORIUM STAGE</span>
      </div>
    </section>
  );
};
