import React from 'react';
import { motion } from 'motion/react';
import { MicroInfluencer } from '../../types';

interface SlideInfluencerProps {
  influencer: MicroInfluencer;
  index: number;
}

export const SlideInfluencer: React.FC<SlideInfluencerProps> = ({ influencer, index }) => {
  return (
    <div className="relative w-full max-w-7xl mx-auto my-auto min-h-[80vh] flex items-center justify-between px-6 py-8 select-none font-sans text-white">
      {/* Background Photo Gradient Scrim */}
      {influencer.photoUrl && (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <img
            src={influencer.photoUrl}
            alt={influencer.name}
            className="w-full h-full object-cover object-right-top filter brightness-70 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/90 to-transparent w-full md:w-3/4" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-[#141414]/60" />
        </div>
      )}

      {/* Direct Editorial Content */}
      <div className="relative z-20 max-w-2xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#e50914] font-semibold">
            <span>Official Evaluator</span>
            <span>·</span>
            <span>Guest Judge 0{index + 1}</span>
            <span>·</span>
            <span className="text-white">{influencer.handle}</span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tight leading-none">
            {influencer.name}
          </h1>

          <div className="text-lg sm:text-xl text-neutral-300 font-medium">
            {influencer.role}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-4"
        >
          <p className="text-base sm:text-lg text-neutral-300 leading-relaxed font-normal max-w-xl">
            {influencer.bio || 'Guest evaluator on the BITS GOT LATENT official evaluation panel.'}
          </p>
        </motion.div>


      </div>

      {/* Right Side Portrait Frame */}
      {influencer.photoUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-20 hidden lg:block w-80 aspect-[3/4] rounded-lg overflow-hidden shadow-2xl border border-neutral-800 mr-8"
        >
          <img src={influencer.photoUrl} alt={influencer.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-xs font-semibold text-white">
            {influencer.name} · {influencer.handle}
          </div>
        </motion.div>
      )}
    </div>
  );
};
