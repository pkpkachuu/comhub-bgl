import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import gsap from 'gsap';

export interface CurtainHandle {
  openCurtains: (duration?: number) => gsap.core.Timeline;
  closeCurtains: (duration?: number) => gsap.core.Timeline;
  resetCurtains: () => void;
}

interface RealisticVelvetCurtainsProps {
  onOpened?: () => void;
}

export const RealisticVelvetCurtains = forwardRef<CurtainHandle, RealisticVelvetCurtainsProps>(
  ({ onOpened }, ref) => {
    const leftCurtainRef = useRef<HTMLDivElement>(null);
    const rightCurtainRef = useRef<HTMLDivElement>(null);
    const leftTiebackRef = useRef<HTMLDivElement>(null);
    const rightTiebackRef = useRef<HTMLDivElement>(null);
    const centerOverlapRef = useRef<HTMLDivElement>(null);

    // Number of pleats per side
    const pleatsCount = 10;

    useImperativeHandle(ref, () => ({
      openCurtains: (duration = 3.2) => {
        const tl = gsap.timeline({
          onComplete: () => {
            if (onOpened) onOpened();
          },
        });

        // 1. Center flap folds back
        tl.to(
          centerOverlapRef.current,
          {
            opacity: 0,
            scaleY: 0.95,
            duration: 0.8,
            ease: 'power2.inOut',
          },
          0
        );

        // 2. Part curtains to the sides with natural fabric acceleration and gathering
        tl.to(
          leftCurtainRef.current,
          {
            x: '-82%',
            scaleX: 0.38,
            transformOrigin: 'left top',
            duration,
            ease: 'power2.inOut',
          },
          0.2
        );

        tl.to(
          rightCurtainRef.current,
          {
            x: '82%',
            scaleX: 0.38,
            transformOrigin: 'right top',
            duration,
            ease: 'power2.inOut',
          },
          0.2
        );

        // 3. Reveal and tighten gold tiebacks at the wings
        tl.to(
          [leftTiebackRef.current, rightTiebackRef.current],
          {
            opacity: 1,
            scale: 1,
            duration: 1.0,
            ease: 'back.out(1.4)',
          },
          duration - 1.0
        );

        return tl;
      },

      closeCurtains: (duration = 2.5) => {
        const tl = gsap.timeline();

        tl.to([leftTiebackRef.current, rightTiebackRef.current], {
          opacity: 0,
          scale: 0.8,
          duration: 0.5,
        });

        tl.to(
          leftCurtainRef.current,
          {
            x: '0%',
            scaleX: 1,
            duration,
            ease: 'power2.inOut',
          },
          0.3
        );

        tl.to(
          rightCurtainRef.current,
          {
            x: '0%',
            scaleX: 1,
            duration,
            ease: 'power2.inOut',
          },
          0.3
        );

        tl.to(
          centerOverlapRef.current,
          {
            opacity: 1,
            scaleY: 1,
            duration: 0.8,
            ease: 'power2.out',
          },
          duration - 0.2
        );

        return tl;
      },

      resetCurtains: () => {
        gsap.set(leftCurtainRef.current, { x: '0%', scaleX: 1 });
        gsap.set(rightCurtainRef.current, { x: '0%', scaleX: 1 });
        gsap.set(centerOverlapRef.current, { opacity: 1, scaleY: 1 });
        gsap.set([leftTiebackRef.current, rightTiebackRef.current], { opacity: 0, scale: 0.8 });
      },
    }));

    // Generate realistic vertical velvet pleats with deep ambient shadow valleys and specular sheen crests
    const renderPleats = (isLeft: boolean) => {
      return Array.from({ length: pleatsCount }).map((_, i) => {
        return (
          <div
            key={i}
            className="flex-1 h-full relative"
            style={{
              background: `linear-gradient(${isLeft ? '90deg' : '270deg'}, 
                #1a0207 0%, 
                #3b050f 18%, 
                #6e0b1d 45%, 
                #9b132c 52%, 
                #650a1b 68%, 
                #2e040c 90%, 
                #0d0104 100%)`,
              boxShadow: isLeft
                ? 'inset -6px 0 14px rgba(0,0,0,0.85), inset 3px 0 8px rgba(255,160,180,0.18)'
                : 'inset 6px 0 14px rgba(0,0,0,0.85), inset -3px 0 8px rgba(255,160,180,0.18)',
            }}
          >
            {/* Subtle vertical texture grain & fabric nap sheen */}
            <div
              className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,200,210,0.08) 2px, rgba(255,200,210,0.08) 4px)',
              }}
            />

            {/* Bottom Scalloped Hem Billow Shadow */}
            <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>
        );
      });
    };

    return (
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
        {/* Left Velvet Curtain Panel */}
        <div
          ref={leftCurtainRef}
          className="absolute top-0 left-0 bottom-0 w-[53vw] flex will-change-transform z-30"
          style={{ transformOrigin: 'left top' }}
        >
          {renderPleats(true)}

          {/* Golden Cord & Bullion Fringe on leading vertical edge */}
          <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-b from-[#f7e7b4] via-[#d4af37] to-[#8c6d1f] shadow-[0_0_12px_rgba(212,175,55,0.7)] flex flex-col justify-between py-6">
            {Array.from({ length: 24 }).map((_, idx) => (
              <div key={idx} className="w-full h-1 bg-[#451a03] opacity-60" />
            ))}
          </div>
        </div>

        {/* Right Velvet Curtain Panel */}
        <div
          ref={rightCurtainRef}
          className="absolute top-0 right-0 bottom-0 w-[53vw] flex will-change-transform z-30"
          style={{ transformOrigin: 'right top' }}
        >
          {renderPleats(false)}

          {/* Golden Cord & Bullion Fringe on leading vertical edge */}
          <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-b from-[#f7e7b4] via-[#d4af37] to-[#8c6d1f] shadow-[0_0_12px_rgba(212,175,55,0.7)] flex flex-col justify-between py-6">
            {Array.from({ length: 24 }).map((_, idx) => (
              <div key={idx} className="w-full h-1 bg-[#451a03] opacity-60" />
            ))}
          </div>
        </div>

        {/* Center Vertical Overlap Shadow */}
        <div
          ref={centerOverlapRef}
          className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 z-35 pointer-events-none bg-gradient-to-r from-black/80 via-black/40 to-black/80"
        />

        {/* Top Ornate Pelmet / Lambrequin (Scalloped Valance) */}
        <div className="absolute top-0 inset-x-0 h-24 md:h-32 z-40 pointer-events-none flex items-start overflow-hidden">
          {/* Baroque Gilded Crown Cornice along the very top edge */}
          <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-r from-[#8c6d1f] via-[#f7e7b4] to-[#8c6d1f] border-b border-[#ffd700] shadow-[0_2px_10px_rgba(0,0,0,0.9)]" />

          {/* 7 Scalloped Swags */}
          <div className="w-full h-full flex justify-between items-start pt-3">
            {Array.from({ length: 7 }).map((_, sIdx) => (
              <div key={sIdx} className="flex-1 h-20 md:h-28 relative -mx-2">
                <svg
                  className="w-full h-full filter drop-shadow-[0_8px_12px_rgba(0,0,0,0.9)]"
                  viewBox="0 0 100 60"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id={`valanceGrad-${sIdx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4a0614" />
                      <stop offset="40%" stopColor="#871026" />
                      <stop offset="70%" stopColor="#550817" />
                      <stop offset="100%" stopColor="#250309" />
                    </linearGradient>
                  </defs>
                  {/* Scalloped velvet curve */}
                  <path
                    d="M0,0 Q50,75 100,0 L100,5 Q50,80 0,5 Z"
                    fill={`url(#valanceGrad-${sIdx})`}
                  />
                  <path
                    d="M0,0 Q50,70 100,0 L100,0 L0,0 Z"
                    fill={`url(#valanceGrad-${sIdx})`}
                  />
                  {/* Golden fringe border */}
                  <path
                    d="M0,0 Q50,70 100,0"
                    fill="none"
                    stroke="#d4af37"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Golden Hanging Tassel at each swag node */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#f7e7b4] border border-[#8c6d1f] shadow-[0_0_6px_#ffd700]" />
                  <div className="w-1.5 h-6 bg-gradient-to-b from-[#d4af37] to-[#8c6d1f] rounded-b" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Left Wing Gold Tieback & Cord (appears when gathered) */}
        <div
          ref={leftTiebackRef}
          className="absolute left-[6vw] top-[48%] -translate-y-1/2 z-40 opacity-0 pointer-events-none flex items-center"
        >
          <div className="w-14 h-36 border-4 border-[#d4af37] rounded-full shadow-[0_0_20px_rgba(212,175,55,0.8)] bg-gradient-to-r from-transparent to-[#28050e]/80 flex items-end justify-center pb-2">
            <div className="w-4 h-12 bg-gradient-to-b from-[#f7e7b4] via-[#d4af37] to-[#8c6d1f] rounded shadow-lg" />
          </div>
        </div>

        {/* Right Wing Gold Tieback & Cord (appears when gathered) */}
        <div
          ref={rightTiebackRef}
          className="absolute right-[6vw] top-[48%] -translate-y-1/2 z-40 opacity-0 pointer-events-none flex items-center"
        >
          <div className="w-14 h-36 border-4 border-[#d4af37] rounded-full shadow-[0_0_20px_rgba(212,175,55,0.8)] bg-gradient-to-l from-transparent to-[#28050e]/80 flex items-end justify-center pb-2">
            <div className="w-4 h-12 bg-gradient-to-b from-[#f7e7b4] via-[#d4af37] to-[#8c6d1f] rounded shadow-lg" />
          </div>
        </div>
      </div>
    );
  }
);
RealisticVelvetCurtains.displayName = 'RealisticVelvetCurtains';
