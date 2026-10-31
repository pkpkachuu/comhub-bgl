import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface VictorianTheatricalOpeningProps {
  autoPlay?: boolean;
  onSequenceComplete?: () => void;
}

export const VictorianTheatricalOpening: React.FC<VictorianTheatricalOpeningProps> = ({
  autoPlay = true,
  onSequenceComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const theatreBackdropRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const card4Ref = useRef<HTMLDivElement>(null);
  const collageLayerRef = useRef<HTMLDivElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const goldAccentRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const masterTlRef = useRef<gsap.core.Timeline | null>(null);

  const playOpeningTimeline = () => {
    if (masterTlRef.current) masterTlRef.current.kill();

    setIsPlaying(true);
    setIsFinished(false);

    const tl = gsap.timeline({
      onComplete: () => {
        setIsPlaying(false);
        setIsFinished(true);
        if (onSequenceComplete) onSequenceComplete();
      },
    });
    masterTlRef.current = tl;

    // Initial 3D State: dark, tilted perspective panels
    gsap.set(theatreBackdropRef.current, {
      opacity: 0,
      scale: 1.15,
      filter: 'brightness(0.3) saturate(0.8)',
    });
    gsap.set(collageLayerRef.current, { opacity: 1 });
    gsap.set(titleContainerRef.current, { opacity: 0, y: 30, scale: 0.94 });
    gsap.set(goldAccentRef.current, { scaleX: 0 });

    // Panel 1: Left dramatic vintage portrait
    gsap.set(card1Ref.current, {
      opacity: 0,
      x: -400,
      y: -50,
      rotateY: 45,
      rotateZ: -8,
      scale: 0.8,
      transformPerspective: 1200,
    });

    // Panel 2: Victorian collage artwork (Panic! album mood reference)
    gsap.set(card2Ref.current, {
      opacity: 0,
      y: 350,
      rotateX: 35,
      scale: 0.75,
      transformPerspective: 1200,
    });

    // Panel 3: Right ornate architectural frame
    gsap.set(card3Ref.current, {
      opacity: 0,
      x: 400,
      y: -40,
      rotateY: -45,
      rotateZ: 8,
      scale: 0.8,
      transformPerspective: 1200,
    });

    // Panel 4: Chandelier / Proscenium close-up
    gsap.set(card4Ref.current, {
      opacity: 0,
      scale: 1.4,
      rotateZ: 5,
      transformPerspective: 1200,
    });

    // PHASE 1: Dramatic 3D panels rotate through viewport (0.0s - 3.5s)
    tl.to(
      card4Ref.current,
      {
        opacity: 0.85,
        scale: 1.0,
        rotateZ: 0,
        duration: 2.2,
        ease: 'power2.out',
      },
      0.3
    );

    tl.to(
      card1Ref.current,
      {
        opacity: 0.9,
        x: -260,
        y: 0,
        rotateY: 22,
        rotateZ: -4,
        scale: 0.95,
        duration: 2.4,
        ease: 'power3.out',
      },
      0.6
    );

    tl.to(
      card3Ref.current,
      {
        opacity: 0.9,
        x: 260,
        y: 0,
        rotateY: -22,
        rotateZ: 4,
        scale: 0.95,
        duration: 2.4,
        ease: 'power3.out',
      },
      0.8
    );

    tl.to(
      card2Ref.current,
      {
        opacity: 0.95,
        y: 120,
        rotateX: 12,
        scale: 0.9,
        duration: 2.2,
        ease: 'power2.out',
      },
      1.1
    );

    // PHASE 2: Panels converge and dissolve into the real full European Theatre environment (3.2s - 5.5s)
    tl.to(
      [card1Ref.current, card2Ref.current, card3Ref.current, card4Ref.current],
      {
        opacity: 0,
        scale: 1.05,
        duration: 1.8,
        ease: 'power2.inOut',
      },
      3.2
    );

    tl.to(
      theatreBackdropRef.current,
      {
        opacity: 1,
        scale: 1.0,
        filter: 'brightness(1.0) saturate(1.1)',
        duration: 2.4,
        ease: 'power2.out',
      },
      3.4
    );

    // PHASE 3: Reveal BITS GOT LATENT Title with Victorian gold leaf radiance (5.2s - 7.0s)
    tl.to(
      titleContainerRef.current,
      {
        opacity: 1,
        y: 0,
        scale: 1.0,
        duration: 1.8,
        ease: 'power3.out',
      },
      5.0
    );

    tl.to(
      goldAccentRef.current,
      {
        scaleX: 1,
        duration: 1.4,
        ease: 'expo.out',
      },
      5.6
    );
  };

  useEffect(() => {
    if (autoPlay) {
      const timer = setTimeout(playOpeningTimeline, 200);
      return () => clearTimeout(timer);
    }
  }, [autoPlay]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-screen bg-[#070104] overflow-hidden select-none flex flex-col justify-between"
    >
      {/* 1. REAL THEATRE PHOTOGRAPH BACKDROP (Supplied Theatre Asset) */}
      <div
        ref={theatreBackdropRef}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-10 transition-all will-change-transform"
        style={{
          backgroundImage: "url('/public/assets/aistudio/image_bff9c266.png')",
        }}
      >
        {/* Subtle Victorian Dark Scrim for Perfect Typography Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(10,2,5,0.75)_100%)]" />
      </div>

      {/* 2. DYNAMIC 3D ROTATING IMAGE COLLAGE LAYER */}
      <div
        ref={collageLayerRef}
        className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center overflow-hidden"
        style={{ perspective: '1400px' }}
      >
        {/* Panel 1: Left Ornate Victorian Column / Arch Detail */}
        <div
          ref={card1Ref}
          className="absolute w-72 md:w-96 aspect-[3/4] rounded-lg overflow-hidden border-2 border-[#d4af37]/60 shadow-[0_25px_60px_rgba(0,0,0,0.9)] bg-[#1a040b]"
        >
          <img
            src="/public/assets/aistudio/image_bff9c266.png"
            alt="Theatre Arch Detail"
            className="w-full h-full object-cover object-left filter brightness-90 contrast-125 sepia-[0.25]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2a040c]/80 via-transparent to-transparent" />
        </div>

        {/* Panel 2: Victorian Collage Artwork (Panic! At The Disco Fever Mood Reference) */}
        <div
          ref={card2Ref}
          className="absolute w-80 md:w-[420px] aspect-square rounded-lg overflow-hidden border-2 border-[#d4af37]/70 shadow-[0_30px_70px_rgba(0,0,0,0.95)] bg-[#1c040d]"
        >
          <img
            src="/public/assets/aistudio/image_1ae85818.png"
            alt="Victorian Theatrical Collage Mood"
            className="w-full h-full object-cover filter contrast-110"
          />
          <div className="absolute inset-0 border border-[#f7e7b4]/30 pointer-events-none" />
        </div>

        {/* Panel 3: Right Corinthian Pillar & Chandelier Detail */}
        <div
          ref={card3Ref}
          className="absolute w-72 md:w-96 aspect-[3/4] rounded-lg overflow-hidden border-2 border-[#d4af37]/60 shadow-[0_25px_60px_rgba(0,0,0,0.9)] bg-[#1a040b]"
        >
          <img
            src="/public/assets/aistudio/image_bff9c266.png"
            alt="Theatre Chandelier Detail"
            className="w-full h-full object-cover object-right filter brightness-90 contrast-125 sepia-[0.25]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2a040c]/80 via-transparent to-transparent" />
        </div>

        {/* Panel 4: Center Proscenium Velvet Valance Close-up */}
        <div
          ref={card4Ref}
          className="absolute w-[80vw] max-w-4xl h-56 md:h-72 rounded-lg overflow-hidden border border-[#d4af37]/40 shadow-2xl bg-[#140207]"
        >
          <img
            src="/public/assets/aistudio/image_bff9c266.png"
            alt="Proscenium Velvet Detail"
            className="w-full h-full object-cover object-top filter brightness-85"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1c030c]/40 to-[#0e0105]/90" />
        </div>
      </div>

      {/* 3. PROMINENT VICTORIAN THEATRICAL WORDMARK (Revealed at Center Stage) */}
      <div className="relative z-30 flex-1 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto my-auto pointer-events-none">
        <div ref={titleContainerRef} className="space-y-3 opacity-0">
          {/* Subtle Classical Header */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 md:w-24 h-[1px] bg-gradient-to-r from-transparent to-[#d4af37]" />
            <span className="font-cinzel text-xs md:text-sm tracking-[0.45em] text-[#d4af37] uppercase font-bold drop-shadow">
              BITS Pilani • Live Production
            </span>
            <div className="w-12 md:w-24 h-[1px] bg-gradient-to-l from-transparent to-[#d4af37]" />
          </div>

          {/* MAIN PROMINENT TITLE: BITS GOT LATENT */}
          <h1 className="font-serif-theatre text-6xl md:text-8xl lg:text-9xl font-black tracking-tight leading-none">
            <span className="block gold-gradient-text drop-shadow-[0_8px_25px_rgba(0,0,0,0.95)]">
              BITS GOT
            </span>
            <span className="block font-cinzel text-5xl md:text-7xl lg:text-8xl tracking-[0.2em] text-[#fff8e7] drop-shadow-[0_0_40px_rgba(212,175,55,0.7)] mt-1">
              LATENT
            </span>
          </h1>

          {/* Ornate Gold Dividing Bar */}
          <div
            ref={goldAccentRef}
            className="w-48 md:w-72 h-[2px] mx-auto bg-gradient-to-r from-transparent via-[#d4af37] to-transparent origin-center"
          />

          <p className="font-serif italic text-base md:text-xl text-[#f7e7b4]/90 tracking-wide max-w-xl mx-auto drop-shadow-md">
            The Grand Theatre of Mathematical Accuracy & Unvarnished Truth
          </p>
        </div>
      </div>

      {/* 4. DISCREET REPLAY TRIGGER IN CORNER */}
      <div className="relative z-40 p-4 flex justify-between items-end">
        <div className="text-[11px] text-[#f7eedb]/40 font-mono-numbers">
          1920×1080 • Traditional Victorian Theatre Architecture
        </div>

        <button
          onClick={playOpeningTimeline}
          disabled={isPlaying}
          className="px-3 py-1 bg-black/60 hover:bg-black/90 border border-[#d4af37]/40 rounded text-[11px] font-mono-numbers text-[#f7e7b4] flex items-center gap-1.5 transition-colors disabled:opacity-30"
          title="Replay Theatrical Opening Sequence"
        >
          <span>↻</span>
          <span>Replay Theatrical Opening</span>
        </button>
      </div>
    </div>
  );
};
