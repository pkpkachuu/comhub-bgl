import React from 'react';
import { X, Play, CheckCircle } from 'lucide-react';
import { Contestant } from '../../types';

interface ContestantDetailModalProps {
  contestant: (Contestant & { hasSubmitted?: boolean }) | null;
  onClose: () => void;
  onSelectOnStage: (contestantId: string) => void;
}

export const ContestantDetailModal: React.FC<ContestantDetailModalProps> = ({
  contestant,
  onClose,
  onSelectOnStage,
}) => {
  if (!contestant) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#181818] rounded-lg shadow-2xl border border-neutral-700 text-white font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors border border-white/20"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Visual Area with Real Photo */}
        <div className="relative w-full aspect-[16/9] max-h-[360px] bg-neutral-900 overflow-hidden">
          {contestant.photoUrl ? (
            <img
              src={contestant.photoUrl}
              alt={contestant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col justify-center items-center p-6 bg-gradient-to-tr from-neutral-900 to-neutral-800 text-center">
              <span className="text-3xl sm:text-5xl font-black text-white">
                {contestant.name}
              </span>
              <span className="text-sm text-[#e50914] font-semibold mt-2">
                "{contestant.actTitle}"
              </span>
            </div>
          )}

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-transparent to-transparent" />

          {/* Overlay Title & Action */}
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-[#e50914] font-bold">
                Act #{contestant.order} · {contestant.category}
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight mt-1">
                {contestant.name}
              </h2>
              <div className="text-sm sm:text-base text-neutral-300 mt-1 font-medium">
                "{contestant.actTitle}"
              </div>
            </div>

            <button
              onClick={() => {
                onSelectOnStage(contestant.id);
                onClose();
              }}
              className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-neutral-200 text-black font-bold text-sm rounded shadow-lg transition-transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Broadcast Act</span>
            </button>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-300 border-b border-neutral-800 pb-5">
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase">Branch</span>
              <span className="text-white font-medium">{contestant.branch || contestant.department}</span>
            </div>
            <span className="text-neutral-700">|</span>
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase">Academic Year</span>
              <span className="text-white font-medium">{contestant.year}</span>
            </div>
            <span className="text-neutral-700">|</span>
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase">Category</span>
              <span className="text-[#e50914] font-medium">{contestant.category}</span>
            </div>
          </div>

          {/* Performance Biography */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
              Performance Synopsis & Bio
            </h4>
            <p className="text-sm md:text-base text-neutral-200 leading-relaxed font-normal">
              {contestant.bio || 'Official contestant on BITS GOT LATENT live showcase.'}
            </p>
          </div>

          {/* Prediction Status Callout */}
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-md flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-white">
                Contestant Self-Prediction Vault
              </div>
              <div className="text-xs text-neutral-400 mt-0.5">
                The performer submits their confidential score (multiples of 0.5) prior to stage entrance.
              </div>
            </div>

            <div className="text-xs">
              {contestant.hasSubmitted ? (
                <span className="text-green-400 font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  SEALED IN VAULT
                </span>
              ) : (
                <span className="text-neutral-500">
                  AWAITING TOKEN ENTRY
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
