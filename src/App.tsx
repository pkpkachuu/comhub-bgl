import { useState, useEffect } from 'react';
import { StreamingHomepage } from './components/streaming/StreamingHomepage';
import { PresentationMode } from './components/presentation/PresentationMode';
import { ContestantPortal } from './components/contestant/ContestantPortal';
import { AdminControlRoom } from './components/admin/AdminControlRoom';
import { JudgeScoringStation } from './components/judge/JudgeScoringStation';
import { Maximize2, Minimize2, Tv, ArrowLeft, Shield, Award, Key, Play } from 'lucide-react';

export type AppExperience = 'streaming' | 'admin' | 'judge' | 'contestant' | 'presentation';

export default function App() {
  const [currentExperience, setCurrentExperience] = useState<AppExperience>('streaming');
  const [isFullscreenProjector, setIsFullscreenProjector] = useState<boolean>(false);

  // Sync mode with URL hash, query param or token param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setCurrentExperience('contestant');
      return;
    }

    const mode = params.get('mode') as AppExperience;
    if (mode && ['streaming', 'presentation', 'contestant', 'admin', 'judge'].includes(mode)) {
      setCurrentExperience(mode);
      return;
    }

    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as AppExperience;
      if (['streaming', 'presentation', 'contestant', 'admin', 'judge'].includes(hash)) {
        setCurrentExperience(hash);
      }
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const switchMode = (mode: AppExperience) => {
    setCurrentExperience(mode);
    window.location.hash = mode;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOnStage = async (contestantId: string) => {
    try {
      await fetch('/api/admin/set-active-contestant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contestantId }),
      });
      switchMode('presentation');
    } catch (err) {
      console.error('Failed to select active contestant on stage:', err);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreenProjector(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreenProjector(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreenProjector(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-[#141414] text-white flex flex-col font-sans select-none">
      {/* If in public streaming experience, render Netflix-style Streaming Homepage directly */}
      {currentExperience === 'streaming' && (
        <StreamingHomepage
          onSwitchExperience={switchMode}
          onSelectOnStage={handleSelectOnStage}
        />
      )}

      {/* Operational Workspaces (Admin, Judge Scoring, Contestant Vault, Presentation) */}
      {currentExperience !== 'streaming' && (
        <>
          {!isFullscreenProjector && (
            <header className="sticky top-0 z-50 bg-[#101010]/95 backdrop-blur-md border-b border-[#262626] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xl">
              {/* Brand & Back to Streaming Link */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => switchMode('streaming')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#1e1e1e] hover:bg-[#282828] text-xs font-semibold text-[#e5e5e5] hover:text-white transition-colors border border-[#333333]"
                  title="Return to public Netflix browsing platform"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#e50914]" />
                  <span>Public Stream</span>
                </button>

                <div className="h-4 w-px bg-[#333333]" />

                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-bold text-[#e50914] tracking-wider leading-none">
                    BITS GOT LATENT
                  </span>
                  <span className="text-[10px] font-mono-numbers px-1.5 py-0.5 rounded bg-[#222222] text-[#808080] uppercase tracking-wider">
                    {currentExperience === 'admin'
                      ? 'Producer Control'
                      : currentExperience === 'judge'
                      ? '5-Evaluator Scoring Desk'
                      : currentExperience === 'contestant'
                      ? 'Contestant Vault'
                      : 'Live Stage Projector'}
                  </span>
                </div>
              </div>

              {/* Roles Navigation Switcher */}
              <nav aria-label="Operational role navigation" className="flex flex-wrap items-center gap-1 bg-[#1a1a1a] p-1 rounded-md border border-[#2b2b2b]">
                <button
                  onClick={() => switchMode('admin')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold tracking-wide transition-all ${
                    currentExperience === 'admin'
                      ? 'bg-[#e50914] text-white shadow-md'
                      : 'text-[#808080] hover:text-white hover:bg-[#242424]'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>

                <button
                  onClick={() => switchMode('judge')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold tracking-wide transition-all ${
                    currentExperience === 'judge'
                      ? 'bg-[#e50914] text-white shadow-md'
                      : 'text-[#808080] hover:text-white hover:bg-[#242424]'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Judge Desk</span>
                </button>

                <button
                  onClick={() => switchMode('contestant')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold tracking-wide transition-all ${
                    currentExperience === 'contestant'
                      ? 'bg-[#e50914] text-white shadow-md'
                      : 'text-[#808080] hover:text-white hover:bg-[#242424]'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Contestant Vault</span>
                </button>

                <button
                  onClick={() => switchMode('presentation')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold tracking-wide transition-all ${
                    currentExperience === 'presentation'
                      ? 'bg-[#e50914] text-white shadow-md'
                      : 'text-[#808080] hover:text-white hover:bg-[#242424]'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Live Stage</span>
                </button>
              </nav>

              {/* Fullscreen Projector button for Stage presentation */}
              <div className="flex items-center gap-2">
                {currentExperience === 'presentation' && (
                  <button
                    onClick={toggleFullscreen}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e50914] hover:bg-[#b81d24] text-white rounded text-xs font-semibold tracking-wide transition-colors shadow"
                    title="Enter clean full-screen mode for stage projector"
                  >
                    {isFullscreenProjector ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    <span>{isFullscreenProjector ? 'Exit Fullscreen' : 'Fullscreen Stage'}</span>
                  </button>
                )}
              </div>
            </header>
          )}

          {/* Floating Exit Button in Native Fullscreen */}
          {isFullscreenProjector && (
            <button
              onClick={toggleFullscreen}
              className="fixed top-4 right-4 z-50 px-3 py-1.5 bg-black/85 hover:bg-black border border-[#333333] rounded text-xs text-white font-mono-numbers shadow-2xl"
            >
              Exit Fullscreen [Esc]
            </button>
          )}

          {/* Operational Viewports */}
          <main className="flex-1 w-full relative">
            {currentExperience === 'admin' && <AdminControlRoom />}
            {currentExperience === 'judge' && <JudgeScoringStation />}
            {currentExperience === 'contestant' && <ContestantPortal />}
            {currentExperience === 'presentation' && <PresentationMode />}
          </main>
        </>
      )}
    </div>
  );
}
