import React from 'react';
import { MicroInfluencer } from '../../types';
import { ExternalLink } from 'lucide-react';

interface FeaturedGuestSectionProps {
  guests: MicroInfluencer[];
}

export const FeaturedGuestSection: React.FC<FeaturedGuestSectionProps> = ({ guests }) => {
  return (
    <section id="guests" className="px-4 md:px-12 my-10">
      <div className="mb-4">
        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Featured Evaluators & Guest Judges
        </h3>
        <p className="text-xs text-neutral-400">
          The official guest evaluators presiding over BITS GOT LATENT.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guests.map((guest) => (
          <div
            key={guest.id}
            className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 bg-neutral-900/80 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-all shadow-xl"
          >
            {/* Guest Photographic Portrait */}
            <div className="w-36 h-48 sm:w-40 sm:h-52 flex-shrink-0 bg-neutral-800 rounded-md overflow-hidden relative shadow-lg">
              {guest.photoUrl ? (
                <img
                  src={guest.photoUrl}
                  alt={guest.name}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex flex-col justify-center items-center bg-neutral-800 p-4 text-center">
                  <span className="text-xl font-bold text-white">{guest.name}</span>
                  <span className="text-xs text-[#e50914] mt-1">{guest.handle}</span>
                </div>
              )}
            </div>

            {/* Guest Talent Profile Content */}
            <div className="flex-1 space-y-2.5 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h4 className="text-2xl font-bold text-white tracking-tight">
                  {guest.name}
                </h4>
                {guest.socialUrl ? (
                  <a
                    href={guest.socialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#e50914] hover:underline font-semibold flex items-center justify-center sm:justify-start gap-1"
                  >
                    <span>{guest.handle}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-xs text-[#e50914] font-semibold">{guest.handle}</span>
                )}
              </div>

              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                {guest.designation || guest.role}
              </div>

              <p className="text-sm text-neutral-300 leading-relaxed pt-1">
                {guest.bio || 'Guest evaluator on the BITS GOT LATENT panel.'}
              </p>


            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
