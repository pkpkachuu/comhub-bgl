import React, { useEffect, useState } from 'react';
import { TheatricalStageFrame } from '../TheatricalStageFrame';
import { SlideOpening } from './SlideOpening';
import { SlideInfluencer } from './SlideInfluencer';
import { SlideRoster } from './SlideRoster';
import { SlideContestantSpotlight } from './SlideContestantSpotlight';
import { SlideScoreReveal } from './SlideScoreReveal';
import { SlideLeaderboard } from './SlideLeaderboard';
import { PublicPresentationState, SlideId } from '../../types';

interface PresentationModeProps {
  initialState?: PublicPresentationState | null;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({ initialState }) => {
  const [data, setData] = useState<PublicPresentationState | null>(initialState || null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch initial state, connect to SSE & run 1000ms fail-safe background poll
  useEffect(() => {
    let isMounted = true;

    const fetchState = async () => {
      try {
        const res = await fetch('/api/public/show-state');
        if (res.ok && isMounted) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch public show state:', err);
      }
    };

    // 1. Initial fetch immediately
    fetchState();

    // 2. Dual-fail-safe 1-second background polling
    // Guarantees Device 1 (Admin) and Device 2 (Projector) stay 100% in sync even if network packets drop
    const pollInterval = setInterval(fetchState, 1000);

    // 3. Instant SSE Real-time Synchronization (0ms latency)
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');

      eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.payload?.publicState) {
            if (isMounted) setData(message.payload.publicState);
          } else {
            fetchState();
          }
        } catch {
          fetchState();
        }
      };

      eventSource.onerror = () => {
        // SSE will reconnect automatically, while pollInterval maintains continuous sync
      };
    } catch (e) {
      console.warn('SSE initialization failed, fallback to 1s polling', e);
    }

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  // Keyboard shortcut for projector operator (Fullscreen toggle 'F')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
          setIsFullscreen(true);
        } else {
          document.exitFullscreen().catch(() => {});
          setIsFullscreen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!data) {
    return (
      <TheatricalStageFrame>
        <div className="flex flex-col items-center justify-center my-auto text-center">
          <div className="w-10 h-10 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin mb-4" />
          <div className="font-mono-numbers text-xs tracking-widest text-[#808080]">
            CONNECTING TO BROADCAST ENGINE...
          </div>
        </div>
      </TheatricalStageFrame>
    );
  }

  const { showState, activeContestant, contestants, microInfluencers, activeScoreReveal } = data;
  const activeSlide: SlideId = (showState?.activeSlide as SlideId) || 'opening';

  return (
    <div className="w-full h-full min-h-screen bg-[#141414] relative">


      {activeSlide === 'opening' ? (
        <SlideOpening />
      ) : (
        <TheatricalStageFrame curtainsOpen={true}>
          {activeSlide === 'influencer_1' && microInfluencers[0] && (
            <SlideInfluencer influencer={microInfluencers[0]} index={0} />
          )}

          {activeSlide === 'influencer_2' && microInfluencers[1] && (
            <SlideInfluencer influencer={microInfluencers[1]} index={1} />
          )}

          {activeSlide === 'roster' && (
            <SlideRoster contestants={contestants} activeContestantId={showState.activeContestantId} />
          )}

          {activeSlide === 'contestant_spotlight' && activeContestant && (
            <SlideContestantSpotlight contestant={activeContestant} />
          )}

          {activeSlide === 'score_reveal' && activeContestant && (
            <SlideScoreReveal contestant={activeContestant} scoreReveal={activeScoreReveal} />
          )}

          {activeSlide === 'leaderboard' && (
            <SlideLeaderboard leaderboard={data.leaderboard} contestants={contestants} />
          )}
        </TheatricalStageFrame>
      )}
    </div>
  );
};
