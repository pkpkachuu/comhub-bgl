import React from 'react';
import { motion } from 'motion/react';
import { LeaderboardEntry } from '../../types';
import { ComHubLogo } from '../common/ComHubLogo';

interface SlideLeaderboardProps {
  leaderboard?: LeaderboardEntry[];
  contestants?: any[];
}

export const SlideLeaderboard: React.FC<SlideLeaderboardProps> = ({ leaderboard = [] }) => {
  const eligible = leaderboard.filter((entry) => entry.isEligible);
  const unrevealed = leaderboard.filter((entry) => !entry.isEligible);

  return (
    <div className="relative w-full max-w-6xl mx-auto my-auto py-6 px-4 select-none font-sans text-white">
      {/* Top-Right ComHub Logo Sticker */}
      <div className="absolute top-0 right-4 sm:right-6">
        <ComHubLogo size={68} />
      </div>

      {/* Prominent Header Readable from Auditorium Back */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <span className="text-xs uppercase tracking-[0.25em] text-[#e50914] font-bold">
          LIVE AUDITORIUM STANDINGS
        </span>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white mt-1 tracking-tight leading-none">
          CALIBRATION LEADERBOARD
        </h1>
        <div className="w-20 h-1 bg-[#e50914] mx-auto mt-3 rounded-full" />
      </motion.div>

      {/* Main Leaderboard Table Container */}
      <div className="bg-[#111111] border border-neutral-800/80 rounded-lg overflow-hidden shadow-2xl">
        {/* Table Header with balanced explicit grid tracks */}
        <div className="grid grid-cols-[3.5rem_1.4fr_1.4fr_6.5rem_7.5rem_7rem] items-center bg-neutral-900/90 px-6 py-3.5 border-b border-neutral-800 text-xs sm:text-sm text-neutral-400 uppercase tracking-wider font-bold">
          <div className="text-center">Rank</div>
          <div className="text-left pr-2">Performer</div>
          <div className="text-left pr-2">Act & Branch</div>
          <div className="text-center">Prediction</div>
          <div className="text-center">Panel Result</div>
          <div className="text-center text-[#e50914] font-black">Δ (Points)</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-neutral-800/60 text-sm sm:text-base">
          {/* 1. OFFICIALLY REVEALED & RANKED ENTRIES (Smallest difference first, 1, 1, 3, 4) */}
          {eligible.map((entry, idx) => {
            const isTopRank = entry.rank === 1;
            const branchDisplay = entry.branch || entry.department;

            return (
              <motion.div
                key={entry.contestantId}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                className={`grid grid-cols-[3.5rem_1.4fr_1.4fr_6.5rem_7.5rem_7rem] items-center px-6 py-4 transition-colors ${
                  isTopRank
                    ? 'bg-[#22070c]/70 border-l-4 border-l-[#e50914]'
                    : 'bg-transparent hover:bg-neutral-800/30'
                }`}
              >
                {/* Competition Rank */}
                <div className="text-center font-black text-lg sm:text-xl">
                  {isTopRank ? (
                    <span className="text-[#e50914] drop-shadow-[0_0_12px_rgba(229,9,20,0.6)]">
                      #{entry.rank}
                    </span>
                  ) : (
                    <span className="text-white">#{entry.rank}</span>
                  )}
                </div>

                {/* Performer */}
                <div className="pr-2">
                  <div className="font-black text-white text-base sm:text-lg tracking-tight truncate">
                    {entry.name}
                  </div>
                  <div className="text-xs text-neutral-400 font-medium truncate">
                    {entry.category}
                  </div>
                </div>

                {/* Act Title & Branch */}
                <div className="text-xs sm:text-sm text-neutral-300 pr-2">
                  <div className="font-semibold text-white truncate">"{entry.actTitle}"</div>
                  <div className="text-xs text-neutral-400 truncate">{branchDisplay}</div>
                </div>

                {/* Self-Prediction */}
                <div className="text-center font-bold text-white text-base sm:text-lg">
                  {entry.prediction !== null ? entry.prediction.toFixed(1) : '—'}
                </div>

                {/* Panel Result */}
                <div className="text-center font-black text-[#e50914] text-base sm:text-lg">
                  {entry.panelScore !== null ? entry.panelScore.toFixed(1) : '—'}
                </div>

                {/* Δ (POINTS) - Center-aligned, adequate width, perfectly under heading */}
                <div className="text-center font-black text-[#e50914] text-lg sm:text-xl drop-shadow-[0_0_10px_rgba(229,9,20,0.4)]">
                  {entry.difference !== null ? entry.difference.toFixed(1) : '—'}
                </div>
              </motion.div>
            );
          })}

          {/* 2. UNREVEALED / PENDING ENTRIES (Scores sealed in vault, values strictly concealed) */}
          {unrevealed.map((entry, idx) => {
            const branchDisplay = entry.branch || entry.department;

            return (
              <motion.div
                key={entry.contestantId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (eligible.length + idx) * 0.04 }}
                className="grid grid-cols-[3.5rem_1.4fr_1.4fr_6.5rem_7.5rem_7rem] items-center px-6 py-3.5 bg-black/20 opacity-60 hover:opacity-80 transition-opacity"
              >
                {/* Rank Placeholder */}
                <div className="text-center font-bold text-neutral-600 text-sm">
                  —
                </div>

                {/* Performer */}
                <div className="pr-2">
                  <div className="font-bold text-neutral-300 text-sm sm:text-base truncate">
                    {entry.name}
                  </div>
                  <div className="text-xs text-neutral-500 font-medium truncate">
                    {entry.category}
                  </div>
                </div>

                {/* Act & Branch */}
                <div className="text-xs text-neutral-400 pr-2">
                  <div className="truncate font-medium text-neutral-300">"{entry.actTitle}"</div>
                  <div className="text-[11px] text-neutral-500 truncate">{branchDisplay}</div>
                </div>

                {/* Prediction Sealed */}
                <div className="text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Sealed
                </div>

                {/* Panel Result Sealed */}
                <div className="text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Pending
                </div>

                {/* Δ (Points) Pending */}
                <div className="text-center text-sm text-neutral-600 font-bold">
                  —
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Zero State if no entries exist */}
        {leaderboard.length === 0 && (
          <div className="py-12 text-center text-neutral-500 text-sm">
            No contestants registered in the lineup.
          </div>
        )}
      </div>
    </div>
  );
};
