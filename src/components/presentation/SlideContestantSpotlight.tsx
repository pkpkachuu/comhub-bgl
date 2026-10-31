import React from 'react';
import { motion } from 'motion/react';
import { Contestant } from '../../types';

interface SlideContestantSpotlightProps {
  contestant: Contestant;
}

export const SlideContestantSpotlight: React.FC<SlideContestantSpotlightProps> = ({ contestant }) => {
  return (
    <div className="relative w-full max-w-7xl mx-auto my-auto min-h-[80vh] flex items-center justify-between px-6 py-8 select-none font-sans text-white">
      {/* Background Ambient Spotlight Glow */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black via-black/80 to-transparent z-10" />

      {/* Full-Bleed / Cinematic Stage Background Photo */}
      {contestant.photoUrl && (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <img
            src={contestant.photoUrl}
            alt={contestant.name}
            className="w-full h-full object-cover object-right-top filter brightness-75 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/90 to-transparent w-full md:w-3/4" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-[#141414]/60" />
        </div>
      )}

      {/* Cinematic Left Content (Overlaid Directly, No Boxed Card) */}
      <div className="relative z-20 max-w-2xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#e50914] font-semibold">
            <span>Act #{contestant.order}</span>
            <span>·</span>
            <span>Live Stage Spotlight</span>
            <span>·</span>
            <span className="text-white">{contestant.category}</span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tight leading-none">
            {contestant.name}
          </h1>

          <div className="text-xl sm:text-2xl text-neutral-300 font-medium pt-1">
            "{contestant.actTitle}"
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-4 text-neutral-300"
        >
          <div className="flex items-center gap-3 text-sm text-neutral-400">
            <span>{contestant.branch || contestant.department}</span>
            <span>·</span>
            <span>{contestant.year}</span>
          </div>

          <p className="text-base sm:text-lg text-neutral-300 leading-relaxed font-normal max-w-xl">
            {contestant.bio || 'Live stage act performing for five-evaluator consensus.'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="pt-4 border-t border-neutral-800 flex items-center gap-6 text-xs text-neutral-400"
        >
          <div>
            <span className="text-neutral-500 block uppercase tracking-wider text-[10px]">Contestant Prediction</span>
            <span className="text-green-400 font-semibold text-sm">Sealed in Vault</span>
          </div>
        </motion.div>
      </div>

      {/* Floating Portrait Cutout on Right for Desktop */}
      {contestant.photoUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-20 hidden lg:block w-80 aspect-[3/4] rounded-lg overflow-hidden shadow-2xl border border-neutral-800 mr-8"
        >
          <img src={contestant.photoUrl} alt={contestant.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-xs font-semibold text-white">
            {contestant.name}
          </div>
        </motion.div>
      )}
    </div>
  );
};
