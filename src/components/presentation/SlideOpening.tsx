import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { ComHubLogo } from '../common/ComHubLogo';

interface SlideOpeningProps {
  onSequenceComplete?: () => void;
}

export const SlideOpening: React.FC<SlideOpeningProps> = ({ onSequenceComplete }) => {
  // Cinematic Animation Phases: 0: Blackout, 1: Subtle Red Glow, 2: Kicker & Light Sweep, 3: Logo Reveal & Particle Burst, 4: Settle & Hold
  const [phase, setPhase] = useState<number>(0);

  const startSequence = () => {
    setPhase(0);

    const t1 = setTimeout(() => setPhase(1), 300);   // Subtle ambient glow begins
    const t2 = setTimeout(() => setPhase(2), 1200);  // "COMHUB PRESENTS" + Light Sweep
    const t3 = setTimeout(() => {
      setPhase(3);  // Giant BITS GOT LATENT reveal + particle burst
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { x: 0.5, y: 0.52 },
          colors: ['#e50914', '#ffffff', '#ff1a25'],
          ticks: 200,
          gravity: 0.8,
        });
      } catch {}
    }, 2400);
    const t4 = setTimeout(() => {
      setPhase(4);  // Settle and complete
      if (onSequenceComplete) onSequenceComplete();
    }, 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  };

  useEffect(() => {
    const cleanup = startSequence();
    return cleanup;
  }, []);

  return (
    <div
      onClick={startSequence}
      title="Click anywhere to replay opening sequence"
      className="w-full h-full min-h-screen relative overflow-hidden bg-[#0a0a0a] flex flex-col items-center justify-center select-none text-white font-sans cursor-pointer"
    >
      {/* Background Deep Ambience & Cinematic Radial Red Vignette */}
      <div className="absolute inset-0 bg-[#070707]" />

      {/* ComHub Official Logo Sticker in Top-Right Corner */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-30">
        <ComHubLogo size={80} />
      </div>

      {/* Phase 1: Subtle Centered Red Glow */}
      <AnimatePresence>
        {phase >= 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.65, scale: 1.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
          >
            <div className="w-[600px] h-[600px] md:w-[900px] md:h-[900px] rounded-full bg-[radial-gradient(circle,rgba(229,9,20,0.22)_0%,rgba(229,9,20,0.06)_45%,transparent_70%)] blur-3xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 max-w-5xl">
        {/* Phase 2: Kicker "COMHUB PRESENTS" — Bold, Cinematic, Highly Legible */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: -16, letterSpacing: '0.25em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.42em' }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg sm:text-2xl md:text-3xl lg:text-4xl uppercase text-[#e50914] font-black tracking-[0.42em] mb-4 sm:mb-6 drop-shadow-[0_4px_24px_rgba(229,9,20,0.65)]"
            >
              COMHUB PRESENTS
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 2 Light Sweep Flare Bar */}
        <AnimatePresence>
          {phase === 2 && (
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
              className="w-64 sm:w-96 md:w-[32rem] h-[3px] bg-gradient-to-r from-transparent via-[#e50914] to-transparent mb-5 shadow-[0_0_15px_#e50914]"
            />
          )}
        </AnimatePresence>

        {/* Phase 3: Massive 2-Line Hero Title Readable from Auditorium Back */}
        <AnimatePresence>
          {phase >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center tracking-tighter select-none"
            >
              {/* Line 1: BITS GOT */}
              <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] font-black text-white leading-[0.88] drop-shadow-[0_8px_40px_rgba(255,255,255,0.12)]">
                BITS GOT
              </h1>

              {/* Line 2: LATENT (Hero Crimson) */}
              <h2 className="text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] font-black text-[#e50914] leading-[0.88] drop-shadow-[0_12px_60px_rgba(229,9,20,0.55)]">
                LATENT
              </h2>

              {/* Phase 3 Red Underline Accent Bar (Final element below the title - ABSOLUTELY NOTHING BELOW THIS LINE) */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
                className="w-32 sm:w-56 md:w-72 h-1.5 md:h-2 bg-[#e50914] rounded-full mt-4 sm:mt-6 shadow-[0_0_20px_#e50914]"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Replay Hint for Projectionist (Subtle, non-distracting) */}
      <div className="absolute bottom-4 right-6 text-[10px] text-neutral-600 font-mono opacity-40 hover:opacity-100 transition-opacity">
        Click to Replay Sequence
      </div>
    </div>
  );
};
