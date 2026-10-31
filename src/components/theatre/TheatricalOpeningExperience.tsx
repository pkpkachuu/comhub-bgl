import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { RealisticVelvetCurtains, CurtainHandle } from './RealisticVelvetCurtains';
import { GrandTheatreChandelier } from './GrandTheatreChandelier';
import { TheatricalMarqueeLogo, MarqueeHandle } from './TheatricalMarqueeLogo';

interface TheatricalOpeningExperienceProps {
  autoPlay?: boolean;
  onSequenceComplete?: () => void;
}

export const TheatricalOpeningExperience: React.FC<TheatricalOpeningExperienceProps> = ({
  autoPlay = true,
  onSequenceComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const curtainsRef = useRef<CurtainHandle>(null);
  const marqueeRef = useRef<MarqueeHandle>(null);

  // Lighting & Architecture Refs for GSAP
  const darkShroudRef = useRef<HTMLDivElement>(null);
  const chandelierContainerRef = useRef<HTMLDivElement>(null);
  const archLightingRef = useRef<HTMLDivElement>(null);
  const spotlightLeftRef = useRef<HTMLDivElement>(null);
  const spotlightRightRef = useRef<HTMLDivElement>(null);
  const stageFloorRef = useRef<HTMLDivElement>(null);

  const [chandelierGlow, setChandelierGlow] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const masterTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const playTheatricalSequence = () => {
    if (masterTimelineRef.current) {
      masterTimelineRef.current.kill();
    }

    setIsPlaying(true);
    setIsFinished(false);

    // Reset initial states
    curtainsRef.current?.resetCurtains();
    marqueeRef.current?.resetBulbs();
    setChandelierGlow(0);

    const masterTl = gsap.timeline({
      onComplete: () => {
        setIsPlaying(false);
        setIsFinished(true);
        if (onSequenceComplete) onSequenceComplete();
      },
    });
    masterTimelineRef.current = masterTl;

    // STEP 1: Dark Theatre Atmosphere
    gsap.set(darkShroudRef.current, { opacity: 0.95 });
    gsap.set(archLightingRef.current, { opacity: 0 });
    gsap.set([spotlightLeftRef.current, spotlightRightRef.current], { opacity: 0 });
    gsap.set(stageFloorRef.current, { opacity: 0.2 });

    // STEP 2: Slowly illuminate chandelier and architectural detailing (0.5s - 2.5s)
    masterTl.to(
      darkShroudRef.current,
      {
        opacity: 0.2,
        duration: 2.2,
        ease: 'power1.inOut',
      },
      0.5
    );

    masterTl.to(
      archLightingRef.current,
      {
        opacity: 1,
        duration: 2.0,
        ease: 'power2.out',
      },
      1.0
    );

    // Chandelier glow ramp
    const glowProxy = { val: 0 };
    masterTl.to(
      glowProxy,
      {
        val: 1,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate: () => setChandelierGlow(glowProxy.val),
      },
      1.2
    );

    // STEP 3: Introduce warm stage lighting & sweeping spotlights (2.5s - 4.2s)
    masterTl.to(
      stageFloorRef.current,
      {
        opacity: 1,
        duration: 1.5,
        ease: 'power2.out',
      },
      2.5
    );

    masterTl.to(
      [spotlightLeftRef.current, spotlightRightRef.current],
      {
        opacity: 0.85,
        duration: 1.8,
        ease: 'power2.out',
      },
      2.8
    );

    // Spotlight sweep convergence on center stage
    masterTl.fromTo(
      spotlightLeftRef.current,
      { rotate: -35, transformOrigin: 'top left' },
      { rotate: -15, duration: 2.0, ease: 'sine.inOut' },
      2.8
    );
    masterTl.fromTo(
      spotlightRightRef.current,
      { rotate: 35, transformOrigin: 'top right' },
      { rotate: 15, duration: 2.0, ease: 'sine.inOut' },
      2.8
    );

    // STEP 4 & 5: Begin realistic theatrical curtain-opening animation (4.5s - 7.8s)
    masterTl.add(() => {
      if (curtainsRef.current) {
        curtainsRef.current.openCurtains(3.3);
      }
    }, 4.5);

    // STEP 6 & 7: Reveal BITS GOT LATENT marquee & ignite bulbs in sequence (6.8s - 9.5s)
    masterTl.add(() => {
      if (marqueeRef.current) {
        marqueeRef.current.igniteBulbsSequence();
      }
    }, 6.5);

    // STEP 8: Hold finished composition with subtle ambient theatrical breathing
    masterTl.to(
      {},
      {
        duration: 0.5,
      }
    );
  };

  useEffect(() => {
    if (autoPlay) {
      // Small timeout to allow layout to settle without initial jump
      const timer = setTimeout(() => {
        playTheatricalSequence();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [autoPlay]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-screen bg-[#070104] overflow-hidden select-none flex flex-col justify-between"
    >
      {/* Absolute Dark Shroud for opening fade-in */}
      <div
        ref={darkShroudRef}
        className="absolute inset-0 bg-black pointer-events-none z-50 transition-opacity"
      />

      {/* Stage Background Atmosphere & Architecture */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Deep dark theatre auditorium backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#20040c_0%,_#0a0104_70%,_#040002_100%)]" />

        {/* Ornate Baroque Back Wall Pilasters */}
        <div
          ref={archLightingRef}
          className="absolute inset-0 opacity-0 transition-opacity"
        >
          {/* Subtle architectural vertical columns */}
          <div className="absolute left-1/4 inset-y-0 w-1 bg-gradient-to-b from-[#d4af37]/20 via-[#8c6d1f]/10 to-transparent" />
          <div className="absolute right-1/4 inset-y-0 w-1 bg-gradient-to-b from-[#d4af37]/20 via-[#8c6d1f]/10 to-transparent" />
          <div className="absolute inset-x-0 top-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent" />
        </div>

        {/* Sweeping Spotlights from Auditorium Wings */}
        <div
          ref={spotlightLeftRef}
          className="absolute -top-40 -left-40 w-[60vw] h-[130vh] opacity-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 35% 80% at 30% 20%, rgba(254,240,138,0.22) 0%, rgba(212,175,55,0.06) 45%, transparent 75%)',
          }}
        />
        <div
          ref={spotlightRightRef}
          className="absolute -top-40 -right-40 w-[60vw] h-[130vh] opacity-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 35% 80% at 70% 20%, rgba(254,240,138,0.22) 0%, rgba(212,175,55,0.06) 45%, transparent 75%)',
          }}
        />
      </div>

      {/* TOP: Suspended Grand Chandelier */}
      <div
        ref={chandelierContainerRef}
        className="relative z-25 w-full flex justify-center -mt-2"
      >
        <GrandTheatreChandelier glowOpacity={chandelierGlow} />
      </div>

      {/* CENTER STAGE: BITS GOT LATENT MARQUEE (Behind the Curtains, Revealed on Opening) */}
      <div className="relative z-15 flex-1 w-full max-w-6xl mx-auto px-6 md:px-16 flex items-center justify-center">
        <TheatricalMarqueeLogo ref={marqueeRef} />
      </div>

      {/* FOREGROUND: REALISTIC VELVET CURTAINS SYSTEM (Z-30, Parting in Timeline) */}
      <RealisticVelvetCurtains ref={curtainsRef} />

      {/* BOTTOM: THEATRE WOODEN STAGE PLANK FLOOR & FOOTLIGHTS */}
      <div
        ref={stageFloorRef}
        className="relative z-35 w-full h-20 md:h-24 bg-gradient-to-t from-[#100307] via-[#21060f] to-[#3a0818] border-t-2 border-[#d4af37]/40 shadow-[0_-10px_30px_rgba(0,0,0,0.9)] flex items-end justify-between px-8 pb-3"
      >
        {/* Footlights row illuminating stage apron */}
        <div className="flex-1 flex justify-around max-w-5xl mx-auto px-4">
          {Array.from({ length: 15 }).map((_, idx) => (
            <div key={idx} className="flex flex-col items-center">
              {/* Footlight Bulb */}
              <div
                className="w-2.5 h-2.5 rounded-full bg-[#fef08a] shadow-[0_-4px_16px_#facc15] transition-opacity"
                style={{ opacity: isFinished ? 1 : chandelierGlow }}
              />
              {/* Brass base housing */}
              <div className="w-4 h-2 bg-gradient-to-b from-[#8c6d1f] to-[#3a1a05] rounded-t-sm" />
            </div>
          ))}
        </div>
      </div>

      {/* DISCREET REPLAY TRIGGER (Allows Replaying the Grand Theatrical Sequence) */}
      <div className="absolute top-4 right-6 z-40 opacity-30 hover:opacity-100 transition-opacity">
        <button
          onClick={playTheatricalSequence}
          disabled={isPlaying}
          className="px-3 py-1 bg-black/60 hover:bg-black/90 border border-[#d4af37]/40 rounded text-[11px] font-mono-numbers text-[#f7e7b4] flex items-center gap-1.5 transition-colors disabled:opacity-30"
          title="Replay Theatrical Curtain Opening"
        >
          <span>↻</span>
          <span>Replay Theatrical Opening</span>
        </button>
      </div>
    </div>
  );
};
