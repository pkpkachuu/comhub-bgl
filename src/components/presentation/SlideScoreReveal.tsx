import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Contestant, EvaluatorId } from '../../types';

interface SlideScoreRevealProps {
  contestant: Contestant;
  scoreReveal: {
    hasSubmission: boolean;
    predictionRevealed: boolean;
    panelScoreRevealed: boolean;
    comparisonRevealed: boolean;
    revealedPrediction: number | null;
    revealedPanelScore: number | null;
    revealedBreakdown: { evaluatorId: EvaluatorId; name: string; role: string; score: number }[] | null;
    difference: number | null;
    latencyTier: string | null;
  };
}

const CountUpNumber: React.FC<{ value: number }> = ({ value }) => {
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = start + ease * (value - start);
      setDisplayVal(current);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setDisplayVal(value);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [value]);

  return <>{displayVal.toFixed(1)}</>;
};

export const SlideScoreReveal: React.FC<SlideScoreRevealProps> = ({ contestant, scoreReveal }) => {
  // Use refs to strictly track transitions (false -> true) to prevent confetti from re-firing on polls
  const prevPredictionRevealed = useRef(scoreReveal.predictionRevealed);
  const prevPanelScoreRevealed = useRef(scoreReveal.panelScoreRevealed);
  const prevComparisonRevealed = useRef(scoreReveal.comparisonRevealed);
  const prevContestantId = useRef(contestant.id);

  // If active contestant changes, reset tracking refs
  useEffect(() => {
    if (prevContestantId.current !== contestant.id) {
      prevContestantId.current = contestant.id;
      prevPredictionRevealed.current = scoreReveal.predictionRevealed;
      prevPanelScoreRevealed.current = scoreReveal.panelScoreRevealed;
      prevComparisonRevealed.current = scoreReveal.comparisonRevealed;
    }
  }, [contestant.id, scoreReveal.predictionRevealed, scoreReveal.panelScoreRevealed, scoreReveal.comparisonRevealed]);

  // MOMENT 1: Red & White Confetti on Prediction Reveal
  useEffect(() => {
    if (!prevPredictionRevealed.current && scoreReveal.predictionRevealed && scoreReveal.revealedPrediction !== null) {
      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { x: 0.35, y: 0.55 },
          colors: ['#e50914', '#ffffff', '#ff2e3b', '#ffffff'],
        });
      } catch {}
    }
    prevPredictionRevealed.current = scoreReveal.predictionRevealed;
  }, [scoreReveal.predictionRevealed, scoreReveal.revealedPrediction]);

  // MOMENT 2: Red & White Confetti on Panel Score Reveal
  useEffect(() => {
    if (!prevPanelScoreRevealed.current && scoreReveal.panelScoreRevealed && scoreReveal.revealedPanelScore !== null) {
      try {
        confetti({
          particleCount: 80,
          spread: 75,
          origin: { x: 0.65, y: 0.55 },
          colors: ['#e50914', '#ffffff', '#e50914', '#ffffff', '#ff4d4d'],
        });
      } catch {}
    }
    prevPanelScoreRevealed.current = scoreReveal.panelScoreRevealed;
  }, [scoreReveal.panelScoreRevealed, scoreReveal.revealedPanelScore]);

  // MOMENT 3: Celebratory Red & White Confetti on Comparison / Verdict Reveal
  useEffect(() => {
    if (!prevComparisonRevealed.current && scoreReveal.comparisonRevealed) {
      try {
        confetti({
          particleCount: 110,
          spread: 90,
          origin: { x: 0.5, y: 0.6 },
          colors: ['#e50914', '#ffffff', '#e50914', '#ffffff'],
        });
      } catch {}
    }
    prevComparisonRevealed.current = scoreReveal.comparisonRevealed;
  }, [scoreReveal.comparisonRevealed]);

  return (
    <div className="relative w-full max-w-7xl mx-auto my-auto min-h-[78vh] flex flex-col justify-between py-6 px-6 select-none font-sans text-white">
      {/* 1. Performer Identity Header - Clean, High Impact */}
      <div className="border-b border-neutral-800 pb-5">
        <div className="text-xs uppercase tracking-widest text-[#e50914] font-bold mb-1">
          Act #{contestant.order} · Official Score Reveal
        </div>
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-none">
          {contestant.name}
        </h1>
        <div className="text-sm md:text-lg text-neutral-400 mt-2 font-medium">
          "{contestant.actTitle}" · {contestant.category} · {(contestant as any).branch || contestant.department}
        </div>
      </div>

      {/* 2. Main Dual Reveal Arena - Dramatic Numbers, Clear Visibility from Auditorium Back */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center my-auto py-8">
        {/* ========================================================
            SIDE A: CONTESTANT PREDICTED SCORE
           ======================================================== */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3">
          <div className="text-xs sm:text-sm uppercase tracking-widest text-neutral-400 font-bold">
            Contestant Self-Prediction
          </div>

          <AnimatePresence mode="wait">
            {scoreReveal.predictionRevealed && scoreReveal.revealedPrediction !== null ? (
              <motion.div
                key="prediction-shown"
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center md:items-start"
              >
                <div className="text-8xl sm:text-9xl md:text-[10rem] lg:text-[12rem] font-black text-white leading-none tracking-tighter drop-shadow-[0_10px_35px_rgba(255,255,255,0.15)]">
                  <CountUpNumber value={scoreReveal.revealedPrediction} />
                </div>
                <div className="text-xs sm:text-sm text-neutral-400 mt-3 font-medium">
                  Sealed backstage prior to performance
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="prediction-sealed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 flex flex-col items-center md:items-start"
              >
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-600 tracking-tight flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-neutral-600 animate-pulse" />
                  SEALED IN VAULT
                </div>
                <div className="text-xs sm:text-sm text-neutral-500 mt-2">
                  Awaiting producer stage reveal
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========================================================
            SIDE B: 5-EVALUATOR PANEL CONSENSUS RESULT
           ======================================================== */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3 md:border-l md:border-neutral-800 md:pl-12 lg:pl-20">
          <div className="text-xs sm:text-sm uppercase tracking-widest text-[#e50914] font-bold">
            Panel Consensus Result
          </div>

          <AnimatePresence mode="wait">
            {scoreReveal.panelScoreRevealed && scoreReveal.revealedPanelScore !== null ? (
              <motion.div
                key="panel-shown"
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center md:items-start w-full"
              >
                <div className="text-8xl sm:text-9xl md:text-[10rem] lg:text-[12rem] font-black text-[#e50914] leading-none tracking-tighter drop-shadow-[0_10px_45px_rgba(229,9,20,0.35)]">
                  <CountUpNumber value={scoreReveal.revealedPanelScore} />
                </div>
                <div className="text-xs sm:text-sm text-neutral-400 mt-3 font-medium">
                  Panel Average (Ceiling 0.5)
                </div>

                {/* Individual Evaluator Breakdown Strip */}
                {scoreReveal.revealedBreakdown && (
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 pt-4 border-t border-neutral-800/80 w-full text-xs sm:text-sm text-neutral-300">
                    {scoreReveal.revealedBreakdown.map((ev, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 bg-neutral-900/60 px-2.5 py-1 rounded">
                        <span className="text-neutral-400 font-medium">{ev.name.split(' ')[0]}:</span>
                        <strong className="text-white font-bold">{ev.score.toFixed(1)}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="panel-concealed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 flex flex-col items-center md:items-start"
              >
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-600 tracking-tight flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-neutral-600 animate-pulse" />
                  CONCEALED PANEL
                </div>
                <div className="text-xs sm:text-sm text-neutral-500 mt-2">
                  Awaiting producer stage reveal
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 3. Calibration Accuracy Result (Revealed on Moment 3) */}
      <AnimatePresence>
        {scoreReveal.comparisonRevealed && scoreReveal.difference !== null && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="border-t border-neutral-800 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-950/40 p-4 rounded-lg"
          >
            <div>
              <div className="text-xs uppercase tracking-widest text-[#e50914] font-bold">
                Calibration Verdict
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                {scoreReveal.difference <= 0.5
                  ? 'Latent Master — Near-Perfect Self-Calibration'
                  : scoreReveal.difference <= 1.5
                  ? 'Aligned Sensing — Strong Consensus Match'
                  : 'High Delta — Divergence in Calibration'}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-4xl sm:text-6xl font-black text-white tracking-tight">
                  {scoreReveal.difference.toFixed(1)}
                </span>
                <span className="text-xs text-neutral-400 block uppercase tracking-wider font-semibold">
                  Points Gap
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
