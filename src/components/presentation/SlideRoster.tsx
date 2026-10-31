import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Clock } from 'lucide-react';
import { PublicContestant } from '../../types';

interface SlideRosterProps {
  contestants: PublicContestant[];
  activeContestantId: string;
}

export const SlideRoster: React.FC<SlideRosterProps> = ({ contestants, activeContestantId }) => {
  return (
    <div className="w-full max-w-5xl mx-auto my-auto py-6 text-white font-sans">
      {/* Kicker */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <span className="text-xs uppercase tracking-widest text-[#e50914] font-semibold">
          Tonight's Lineup · Order of Performance
        </span>
        <h2 className="text-4xl sm:text-6xl font-black text-white mt-1 tracking-tight">
          Contenders & Live Showcase
        </h2>
      </motion.div>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contestants.map((contestant, idx) => {
          const isActive = contestant.id === activeContestantId;
          return (
            <motion.div
              key={contestant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className={`p-4 rounded-md border transition-all ${
                isActive
                  ? 'bg-neutral-900 border-[#e50914] shadow-lg'
                  : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded overflow-hidden bg-neutral-800 flex-shrink-0 border border-neutral-700">
                  {contestant.photoUrl ? (
                    <img src={contestant.photoUrl} alt={contestant.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400 font-bold">
                      #{contestant.order}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white truncate">
                      {contestant.name}
                    </h3>
                    <span className="text-xs text-neutral-400">
                      Act #{contestant.order}
                    </span>
                  </div>
                  <div className="text-xs text-[#e50914] font-medium truncate">
                    "{contestant.actTitle}"
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1 truncate">
                    {contestant.category} · {contestant.branch || contestant.department}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                <span>{contestant.year}</span>
                <div>
                  {contestant.hasSubmitted ? (
                    <span className="text-green-400 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Prediction Sealed
                    </span>
                  ) : (
                    <span className="text-neutral-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Pending Vault
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
