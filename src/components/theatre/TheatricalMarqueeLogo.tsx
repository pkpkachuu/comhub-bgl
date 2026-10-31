import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import gsap from 'gsap';

export interface MarqueeHandle {
  igniteBulbsSequence: () => gsap.core.Timeline;
  resetBulbs: () => void;
}

export const TheatricalMarqueeLogo = forwardRef<MarqueeHandle, { className?: string }>(
  ({ className = '' }, ref) => {
    const bulbRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const marqueeContainerRef = useRef<HTMLDivElement>(null);
    const lightSweepRef = useRef<HTMLDivElement>(null);
    const brandTextRef = useRef<HTMLHeadingElement>(null);

    // 36 Perimeter Marquee Bulbs (top: 12, right: 6, bottom: 12, left: 6)
    const totalBulbs = 36;

    useImperativeHandle(ref, () => ({
      igniteBulbsSequence: () => {
        const tl = gsap.timeline();

        // Reveal marquee container
        tl.to(marqueeContainerRef.current, {
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: 'power3.out',
        });

        // 1. Chasing / Cascade bulb ignition: ripple ignition around perimeter
        tl.to(
          bulbRefs.current,
          {
            opacity: 1,
            scale: 1.25,
            duration: 0.08,
            stagger: {
              each: 0.04,
              from: 'start',
            },
            ease: 'power1.out',
            onStart: () => {
              // Add glowing class as each activates
            },
          },
          0.3
        );

        // Settle bulbs into steady warm shimmer
        tl.to(
          bulbRefs.current,
          {
            scale: 1,
            duration: 0.4,
            stagger: 0.02,
          },
          '>-0.5'
        );

        // 2. Golden light sweep across the lettering
        tl.fromTo(
          lightSweepRef.current,
          { x: '-120%', opacity: 0 },
          {
            x: '220%',
            opacity: 0.8,
            duration: 1.8,
            ease: 'power2.inOut',
          },
          '-=0.8'
        );

        // 3. Brand text glow pulse
        tl.to(
          brandTextRef.current,
          {
            textShadow: '0 0 35px rgba(255,230,130,0.85), 0 0 70px rgba(212,175,55,0.4)',
            duration: 1.0,
            yoyo: true,
            repeat: 1,
            ease: 'sine.inOut',
          },
          '-=1.2'
        );

        return tl;
      },

      resetBulbs: () => {
        gsap.set(marqueeContainerRef.current, { opacity: 0, scale: 0.94 });
        gsap.set(bulbRefs.current, { opacity: 0.15, scale: 0.8 });
        gsap.set(lightSweepRef.current, { x: '-120%', opacity: 0 });
      },
    }));

    return (
      <div
        ref={marqueeContainerRef}
        className={`relative max-w-4xl w-full mx-auto p-6 md:p-12 opacity-0 select-none ${className}`}
      >
        {/* Outer Baroque Gilded Frame */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#24050e] via-[#140207] to-[#090104] rounded-2xl border-4 border-[#d4af37] shadow-[0_0_60px_rgba(212,175,55,0.4),inset_0_0_40px_rgba(0,0,0,0.9)]" />

        {/* Ornate Corner Baroque Brackets */}
        <div className="absolute -top-3 -left-3 w-8 h-8 border-t-4 border-l-4 border-[#fff8e7] rounded-tl-lg shadow-[0_0_15px_#facc15]" />
        <div className="absolute -top-3 -right-3 w-8 h-8 border-t-4 border-r-4 border-[#fff8e7] rounded-tr-lg shadow-[0_0_15px_#facc15]" />
        <div className="absolute -bottom-3 -left-3 w-8 h-8 border-b-4 border-l-4 border-[#fff8e7] rounded-bl-lg shadow-[0_0_15px_#facc15]" />
        <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b-4 border-r-4 border-[#fff8e7] rounded-br-lg shadow-[0_0_15px_#facc15]" />

        {/* Perimeter Marquee Bulbs Track */}
        {/* TOP ROW */}
        <div className="absolute top-3 inset-x-8 flex justify-between z-20 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={`top-${i}`}
              ref={(el) => { bulbRefs.current[i] = el; }}
              className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#fffbeb] via-[#facc15] to-[#854d0e] shadow-[0_0_12px_#fde047] opacity-20"
            />
          ))}
        </div>

        {/* RIGHT COLUMN */}
        <div className="absolute right-3 inset-y-12 flex flex-col justify-between z-20 pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={`right-${i}`}
              ref={(el) => { bulbRefs.current[12 + i] = el; }}
              className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#fffbeb] via-[#facc15] to-[#854d0e] shadow-[0_0_12px_#fde047] opacity-20"
            />
          ))}
        </div>

        {/* BOTTOM ROW (reversed for clockwise circuit) */}
        <div className="absolute bottom-3 inset-x-8 flex justify-between flex-row-reverse z-20 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={`bot-${i}`}
              ref={(el) => { bulbRefs.current[18 + i] = el; }}
              className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#fffbeb] via-[#facc15] to-[#854d0e] shadow-[0_0_12px_#fde047] opacity-20"
            />
          ))}
        </div>

        {/* LEFT COLUMN (bottom to top for clockwise circuit) */}
        <div className="absolute left-3 inset-y-12 flex flex-col-reverse justify-between z-20 pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={`left-${i}`}
              ref={(el) => { bulbRefs.current[30 + i] = el; }}
              className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#fffbeb] via-[#facc15] to-[#854d0e] shadow-[0_0_12px_#fde047] opacity-20"
            />
          ))}
        </div>

        {/* Inner Content Area */}
        <div className="relative z-10 flex flex-col items-center justify-center py-8 md:py-12 overflow-hidden">
          {/* Diagonal Specular Light Sweep Overlay */}
          <div
            ref={lightSweepRef}
            className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-[#fffbeb]/30 to-transparent skew-x-[-25deg] pointer-events-none"
          />

          {/* Top Filigree Crown Accent */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 md:w-24 h-[1px] bg-gradient-to-r from-transparent to-[#d4af37]" />
            <span className="font-cinzel text-xs md:text-sm tracking-[0.4em] text-[#d4af37] uppercase font-bold">
              THE GRAND SHOWCASE
            </span>
            <div className="w-12 md:w-24 h-[1px] bg-gradient-to-l from-transparent to-[#d4af37]" />
          </div>

          {/* MAIN PROMINENT LOGO / WORDMARK */}
          <h1
            ref={brandTextRef}
            className="font-serif-theatre text-6xl md:text-8xl lg:text-9xl font-black tracking-tight leading-none text-center my-1"
          >
            <span className="block gold-gradient-text drop-shadow-[0_6px_16px_rgba(0,0,0,0.95)]">
              BITS GOT
            </span>
            <span className="block font-cinzel text-5xl md:text-7xl lg:text-8xl tracking-[0.16em] text-[#fff8e7] drop-shadow-[0_0_35px_rgba(255,230,130,0.6)]">
              TALENT
            </span>
          </h1>

          {/* Bottom Ornate Medallion Bar */}
          <div className="flex items-center gap-3 mt-3">
            <div className="w-16 md:w-32 h-[1px] bg-gradient-to-r from-transparent to-[#d4af37]" />
            <svg className="w-5 h-5 text-[#d4af37]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
            </svg>
            <div className="w-16 md:w-32 h-[1px] bg-gradient-to-l from-transparent to-[#d4af37]" />
          </div>
        </div>
      </div>
    );
  }
);
TheatricalMarqueeLogo.displayName = 'TheatricalMarqueeLogo';
