import React, { useState, useEffect } from 'react';
import { NetflixTopNav } from './NetflixTopNav';
import { NetflixHeroBanner } from './NetflixHeroBanner';
import { NetflixContentRow } from './NetflixContentRow';
import { NetflixPosterCard } from './NetflixPosterCard';
import { ContestantDetailModal } from './ContestantDetailModal';
import { FeaturedGuestSection } from './FeaturedGuestSection';
import { CompetitionRulesRow } from './CompetitionRulesRow';
import { PublicPresentationState, Contestant, PublicContestant } from '../../types';

interface StreamingHomepageProps {
  onSwitchExperience: (exp: 'streaming' | 'admin' | 'judge' | 'contestant' | 'presentation') => void;
  onSelectOnStage: (contestantId: string) => void;
  onWatchLive?: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

export const StreamingHomepage: React.FC<StreamingHomepageProps> = ({
  onSwitchExperience,
  onSelectOnStage,
  onWatchLive,
  onToggleFullscreen,
  isFullscreen,
}) => {
  const [data, setData] = useState<PublicPresentationState | null>(null);
  const [currentTab, setCurrentTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null);

  const fetchState = async () => {
    try {
      const res = await fetch('/api/public/show-state');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch public show state:', err);
    }
  };

  useEffect(() => {
    fetchState();
    const eventSource = new EventSource('/api/events');
    eventSource.onmessage = () => {
      fetchState();
    };
    return () => eventSource.close();
  }, []);

  const handleNavigateTab = (tab: string) => {
    setCurrentTab(tab);
    if (tab === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(tab);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const contestantsList: PublicContestant[] = data?.contestants || [];
  const filteredContestants = contestantsList.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.actTitle.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      (c.branch || c.department).toLowerCase().includes(q)
    );
  });

  const featuredId = data?.homepageSettings?.featuredContestantId;
  const featured =
    (featuredId && contestantsList.find((c) => c.id === featuredId)) ||
    data?.activeContestant ||
    contestantsList[0] ||
    null;

  const rowVis = data?.homepageSettings?.rowVisibility || {
    featuredPerformers: true,
    allPerformers: true,
    guestJudges: true,
    competitionRules: true,
    standings: true,
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col font-sans select-none overflow-x-hidden">
      {/* 1. TOP STREAMING NAVIGATION */}
      <NetflixTopNav
        currentTab={currentTab}
        onNavigateTab={handleNavigateTab}
        onSwitchExperience={onSwitchExperience}
        onWatchLive={onWatchLive}
        onToggleFullscreen={onToggleFullscreen}
        isFullscreen={isFullscreen}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 2. CINEMATIC HERO BANNER (Drives from Homepage CMS Settings) */}
      <NetflixHeroBanner
        homepageSettings={data?.homepageSettings}
        featuredContestant={featured as unknown as Contestant}
        onWatchLive={onWatchLive || (() => onSwitchExperience('presentation'))}
        onExploreContestants={() => handleNavigateTab('contestants')}
        onOpenDetails={(c) => setSelectedContestant(c)}
      />

      {/* 3. HORIZONTAL CONTENT ROWS (Authentic Netflix Desktop Browsing) */}
      <div className="relative z-20 -mt-16 md:-mt-24 space-y-8 pb-16">
        {/* Row 1: Featured Contestants */}
        {rowVis.featuredPerformers && (
          <NetflixContentRow
            id="contestants"
            title="Featured Performers"
            subtitle="Prime time collegiate acts on stage"
          >
            {filteredContestants.slice(0, 4).map((c) => (
              <NetflixPosterCard
                key={c.id}
                contestant={c as unknown as Contestant}
                onOpenDetails={(item) => setSelectedContestant(item)}
                onWatchAct={(item) => {
                  onSelectOnStage(item.id);
                  onSwitchExperience('presentation');
                }}
              />
            ))}
          </NetflixContentRow>
        )}

        {/* Row 2: All Contestants Roster */}
        {rowVis.allPerformers && (
          <NetflixContentRow
            title="Meet The Performers"
            subtitle="All contenders competing for calibration honors"
          >
            {filteredContestants.map((c) => (
              <NetflixPosterCard
                key={`all-${c.id}`}
                contestant={c as unknown as Contestant}
                onOpenDetails={(item) => setSelectedContestant(item)}
                onWatchAct={(item) => {
                  onSelectOnStage(item.id);
                  onSwitchExperience('presentation');
                }}
              />
            ))}
          </NetflixContentRow>
        )}

        {/* Row 3: Featured Guests & Evaluators */}
        {rowVis.guestJudges && data?.microInfluencers && data.microInfluencers.length > 0 && (
          <FeaturedGuestSection guests={data.microInfluencers} />
        )}

        {/* Row 4: Competition Rules & Calibration */}
        {rowVis.competitionRules && <CompetitionRulesRow />}

        {/* Row 5: Live Standings (when available) */}
        {rowVis.standings && (
          <section id="standings" className="px-4 md:px-12 my-10">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  Live Standings & Calibration Accuracy
                </h3>
                <p className="text-xs text-neutral-400">
                  Ranked by minimal delta between self-predicted score and panel consensus.
                </p>
              </div>
              <button
                onClick={() => onSwitchExperience('presentation')}
                className="text-xs text-[#e50914] hover:underline font-semibold"
              >
                View Fullscreen Broadcast →
              </button>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-md overflow-hidden shadow-lg">
              <div className="grid grid-cols-12 bg-neutral-800/80 px-4 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                <div className="col-span-1">Rank</div>
                <div className="col-span-4">Performer</div>
                <div className="col-span-3">Act & Department</div>
                <div className="col-span-2 text-right">Self-Prediction</div>
                <div className="col-span-2 text-right">Panel Result</div>
              </div>

              <div className="divide-y divide-neutral-800/60">
                {contestantsList.map((contestant, idx) => (
                  <div
                    key={`standings-${contestant.id}`}
                    className="grid grid-cols-12 px-4 py-3.5 items-center hover:bg-neutral-800/40 transition-colors"
                  >
                    <div className="col-span-1 font-bold text-white text-sm">
                      {idx === 0 ? <span className="text-[#e50914]">#01</span> : `#0${idx + 1}`}
                    </div>
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded overflow-hidden bg-neutral-800 flex-shrink-0">
                        {contestant.photoUrl ? (
                          <img src={contestant.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : null}
                      </div>
                      <div>
                        <span className="font-semibold text-white text-sm block">
                          {contestant.name}
                        </span>
                        <span className="text-xs text-neutral-400">{contestant.category}</span>
                      </div>
                    </div>
                    <div className="col-span-3 text-xs text-neutral-300">
                      <div className="truncate font-medium">{contestant.actTitle}</div>
                      <div className="text-[11px] text-neutral-500 truncate">{contestant.branch || contestant.department}</div>
                    </div>
                    <div className="col-span-2 text-right text-xs text-neutral-400">
                      {contestant.hasSubmitted ? (
                        <span className="text-green-400 font-semibold">Vaulted</span>
                      ) : (
                        <span className="text-neutral-500">Pending</span>
                      )}
                    </div>
                    <div className="col-span-2 text-right text-xs font-bold text-[#e50914]">
                      On Stage
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* 4. TITLE DETAIL MODAL */}
      <ContestantDetailModal
        contestant={selectedContestant}
        onClose={() => setSelectedContestant(null)}
        onSelectOnStage={(id) => {
          onSelectOnStage(id);
          onSwitchExperience('presentation');
        }}
      />

      {/* 5. FOOTER */}
      <footer className="mt-auto border-t border-neutral-800 bg-[#0f0f0f] px-4 md:px-12 py-8 text-xs text-neutral-500 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-xl font-bold text-[#e50914] tracking-tight">
            BITS GOT LATENT
          </span>
          <div className="flex items-center gap-6">
            <button onClick={() => onSwitchExperience('admin')} className="hover:text-white transition-colors">
              Producer Admin
            </button>
            <button onClick={() => onSwitchExperience('judge')} className="hover:text-white transition-colors">
              Judge Scoring
            </button>
            <button onClick={() => onSwitchExperience('contestant')} className="hover:text-white transition-colors">
              Contestant Vault
            </button>
            <button onClick={() => onSwitchExperience('presentation')} className="hover:text-white transition-colors">
              Live Stage
            </button>
          </div>
        </div>
        <p className="text-[11px] text-neutral-500">
          BITS Pilani · Collegiate Live Talent & Calibration Production Suite. Built with React & Express.
        </p>
      </footer>
    </div>
  );
};
