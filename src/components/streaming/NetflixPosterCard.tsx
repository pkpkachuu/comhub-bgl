import React, { useState } from 'react';
import { Play, ChevronDown, CheckCircle } from 'lucide-react';
import { Contestant } from '../../types';

interface NetflixPosterCardProps {
  contestant: Contestant & { hasSubmitted?: boolean };
  onOpenDetails: (contestant: Contestant) => void;
  onWatchAct: (contestant: Contestant) => void;
}

export const NetflixPosterCard: React.FC<NetflixPosterCardProps> = ({
  contestant,
  onOpenDetails,
  onWatchAct,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative flex-none w-52 sm:w-60 md:w-68 lg:w-72 aspect-[16/10] rounded transition-all duration-300 group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onOpenDetails(contestant)}
    >
      {/* Base Poster Visual */}
      <div className="w-full h-full rounded overflow-hidden bg-neutral-900 border border-neutral-800 relative shadow-md">
        {contestant.photoUrl ? (
          <img
            src={contestant.photoUrl}
            alt={contestant.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col justify-between p-3.5 bg-gradient-to-b from-neutral-800 to-neutral-950">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="text-[#e50914] font-bold">Act #{contestant.order}</span>
              <span>{contestant.year}</span>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white line-clamp-1">
                {contestant.name}
              </h4>
              <p className="text-xs text-neutral-400 truncate mt-0.5">
                "{contestant.actTitle}"
              </p>
            </div>
            <div className="text-[11px] text-neutral-400 border-t border-neutral-800 pt-1 flex justify-between">
              <span>{contestant.branch || contestant.department}</span>
              <span className="text-[#e50914] font-medium">{contestant.category}</span>
            </div>
          </div>
        )}

        {/* Gradient Bottom Title Bar (Netflix-style) */}
        {contestant.photoUrl && (
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black via-black/75 to-transparent">
            <h4 className="text-base font-bold text-white leading-tight line-clamp-1">
              {contestant.name}
            </h4>
            <span className="text-xs text-neutral-300 font-medium block truncate">
              "{contestant.actTitle}"
            </span>
          </div>
        )}
      </div>

      {/* Netflix Expanded Poster Card on Hover (Desktop) */}
      {isHovered && (
        <div
          className="hidden md:flex flex-col absolute -top-8 -left-5 -right-5 z-50 bg-[#181818] rounded-md shadow-2xl border border-neutral-700 overflow-hidden transform scale-110 transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(contestant);
          }}
        >
          {/* Expanded Media Area */}
          <div className="w-full aspect-[16/10] bg-neutral-900 relative overflow-hidden">
            {contestant.photoUrl ? (
              <img
                src={contestant.photoUrl}
                alt={contestant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col justify-center items-center p-4 bg-gradient-to-tr from-neutral-900 to-neutral-800 text-center">
                <span className="text-xl font-bold text-white">{contestant.name}</span>
                <span className="text-xs text-[#e50914] mt-1">"{contestant.actTitle}"</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />
          </div>

          {/* Expanded Action Bar & Content */}
          <div className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onWatchAct(contestant);
                  }}
                  className="w-8 h-8 rounded-full bg-white hover:bg-neutral-200 text-black flex items-center justify-center transition-transform active:scale-90"
                  title="Watch on Stage"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDetails(contestant);
                  }}
                  className="w-8 h-8 rounded-full border border-neutral-500 hover:border-white text-white flex items-center justify-center transition-colors"
                  title="View More Info"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-neutral-400">
                {contestant.hasSubmitted ? (
                  <span className="text-green-400 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Vaulted
                  </span>
                ) : (
                  <span className="text-neutral-500">Pending Vault</span>
                )}
              </div>
            </div>

            {/* Performer Details */}
            <div>
              <h5 className="text-lg font-bold text-white leading-tight">
                {contestant.name}
              </h5>
              <p className="text-xs text-[#e50914] font-medium truncate mt-0.5">
                "{contestant.actTitle}"
              </p>
            </div>

            {/* Unboxed Metadata Line */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-300">
              <span className="font-semibold text-white">{contestant.category}</span>
              <span className="text-neutral-600">·</span>
              <span className="truncate">{contestant.branch || contestant.department}</span>
              <span className="text-neutral-600">·</span>
              <span>{contestant.year}</span>
            </div>

            {/* Bio snippet */}
            {contestant.bio && (
              <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                {contestant.bio}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
