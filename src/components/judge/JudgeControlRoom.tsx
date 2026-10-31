import React, { useState, useEffect } from 'react';
import { EvaluatorProfile, EvaluatorId } from '../../types';

interface ActiveContestantData {
  id: string;
  name: string;
  department: string;
  year: string;
  actTitle: string;
  category: string;
  bio: string;
  photoUrl: string;
  order: number;
}

export const JudgeControlRoom: React.FC = () => {
  const [evaluator, setEvaluator] = useState<EvaluatorProfile | null>(null);
  const [selectedEvaluatorId, setSelectedEvaluatorId] = useState<EvaluatorId>('jomedy');
  const [passcode, setPasscode] = useState('jomedy');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Active Contestant & Scoring
  const [activeContestant, setActiveContestant] = useState<ActiveContestantData | null>(null);
  const [score, setScore] = useState<number>(7.5);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [hasSubmittedForActive, setHasSubmittedForActive] = useState(false);

  const evaluatorsList: { id: EvaluatorId; label: string; defaultPass: string; role: string }[] = [
    { id: 'jomedy', label: 'Jomedy (Judge 1)', defaultPass: 'jomedy', role: 'Celebrity Judge' },
    { id: 'priyanshu', label: 'Priyanshu (Judge 2)', defaultPass: 'priyanshu', role: 'Celebrity Judge' },
    { id: 'arbiter_1', label: 'Arbiter 1 (Club Rep)', defaultPass: 'arbiter1', role: 'Club Arbiter' },
    { id: 'arbiter_2', label: 'Arbiter 2 (Club Rep)', defaultPass: 'arbiter2', role: 'Club Arbiter' },
    { id: 'arbiter_3', label: 'Arbiter 3 (Club Rep)', defaultPass: 'arbiter3', role: 'Club Arbiter' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch('/api/evaluator/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluatorId: selectedEvaluatorId,
          passcode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Authentication failed.');
      } else {
        setEvaluator(data.evaluator);
        fetchActiveContestant(data.evaluator.id);
      }
    } catch {
      setLoginError('Server connection error.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const fetchActiveContestant = async (evId: string) => {
    try {
      const res = await fetch(`/api/evaluator/active-contestant?evaluatorId=${evId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveContestant(data.activeContestant);
        if (data.ownScore !== null) {
          setScore(data.ownScore);
          setHasSubmittedForActive(true);
        } else {
          setScore(7.5);
          setHasSubmittedForActive(false);
        }
      }
    } catch (err) {
      console.error('Error fetching active contestant:', err);
    }
  };

  useEffect(() => {
    if (evaluator) {
      fetchActiveContestant(evaluator.id);
      const eventSource = new EventSource('/api/events');
      eventSource.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.eventType === 'SHOW_STATE_CHANGED' || msg.eventType === 'CONTESTANT_SELECTED') {
            fetchActiveContestant(evaluator.id);
          }
        } catch {}
      };
      return () => eventSource.close();
    }
  }, [evaluator]);

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluator || !activeContestant) return;

    if (score < 0 || score > 10) {
      setStatusMsg('Score must be strictly between 0.0 and 10.0');
      return;
    }

    setIsSubmitting(true);
    setStatusMsg('');

    try {
      const res = await fetch('/api/evaluator/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluatorId: evaluator.id,
          passcode,
          contestantId: activeContestant.id,
          score: Number(score),
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setHasSubmittedForActive(true);
        setStatusMsg(`Score of ${score.toFixed(1)} / 10 successfully recorded!`);
      } else {
        setStatusMsg(data.error || 'Failed to submit score.');
      }
    } catch {
      setStatusMsg('Network error submitting score.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0206] text-[#f7eedb] p-4 md:p-8 flex flex-col justify-between font-sans">
      {/* Victorian Header */}
      <header className="max-w-2xl w-full mx-auto text-center border-b border-[#8c6d1f]/40 pb-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-[#d4af37]" />
          <span className="font-cinzel text-xs tracking-[0.3em] uppercase text-[#d4af37] font-bold">
            BITS GOT LATENT • EVALUATOR CHAMBER
          </span>
          <div className="w-2 h-2 rounded-full bg-[#d4af37]" />
        </div>
        <h1 className="font-serif-theatre text-3xl md:text-4xl font-bold text-[#fff8e7]">
          Independent Scoring Room
        </h1>
        <p className="text-xs text-[#f7eedb]/70 font-mono-numbers mt-1">
          Strict 10-Point Scale • Zero-Knowledge Secrecy Enforced
        </p>
      </header>

      {/* Main Workspace */}
      <main className="max-w-2xl w-full mx-auto my-auto py-6">
        {!evaluator ? (
          /* =========================================
              EVALUATOR LOGIN / CREDENTIAL VERIFICATION
             ========================================= */
          <div className="bg-[#18040c] border-2 border-[#d4af37]/50 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full border-2 border-[#d4af37] bg-[#290513] flex items-center justify-center mx-auto shadow-md">
                <span className="text-2xl">⚖️</span>
              </div>
              <h2 className="font-serif-theatre text-2xl font-bold text-[#fff8e7]">
                Evaluator Authentication
              </h2>
              <p className="text-xs text-[#f7eedb]/75">
                Select your judge or arbiter identity and enter your assigned security credential.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-cinzel text-[#d4af37] uppercase tracking-wider mb-1 font-bold">
                  Evaluator Identity:
                </label>
                <select
                  value={selectedEvaluatorId}
                  onChange={(e) => {
                    const id = e.target.value as EvaluatorId;
                    setSelectedEvaluatorId(id);
                    const found = evaluatorsList.find((ev) => ev.id === id);
                    if (found) setPasscode(found.defaultPass);
                  }}
                  className="w-full bg-[#0a0104] border border-[#8c6d1f] rounded-lg px-3 py-2.5 text-sm text-[#f7e7b4] font-bold focus:outline-none focus:border-[#d4af37]"
                >
                  {evaluatorsList.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.label} — {ev.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-cinzel text-[#d4af37] uppercase tracking-wider mb-1 font-bold">
                  Security Passcode / Key:
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full bg-[#0a0104] border border-[#8c6d1f] rounded-lg px-3 py-2 text-sm text-[#f7e7b4] font-mono-numbers focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              {loginError && (
                <div className="p-3 bg-red-950/80 border border-red-500 rounded-lg text-xs text-red-200 text-center font-mono-numbers">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-gradient-to-r from-[#d4af37] via-[#f7e7b4] to-[#d4af37] text-black font-cinzel font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg hover:brightness-110 active:brightness-95 transition-all"
              >
                {isLoggingIn ? 'Authenticating...' : 'Enter Evaluator Scoring Station'}
              </button>
            </form>
          </div>
        ) : (
          /* =========================================
              ACTIVE SCORING STATION FOR LOGGED IN EVALUATOR
             ========================================= */
          <div className="bg-[#18040c] border-2 border-[#d4af37]/60 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Authenticated Evaluator Profile Header */}
            <div className="flex items-center justify-between border-b border-[#8c6d1f]/40 pb-4">
              <div>
                <span className="font-cinzel text-[11px] text-[#d4af37] uppercase tracking-widest block font-bold">
                  Logged In As:
                </span>
                <h2 className="font-serif-theatre text-2xl font-bold text-[#fff8e7]">
                  {evaluator.name}
                </h2>
                <span className="text-xs text-[#f7eedb]/70 font-mono-numbers">
                  {evaluator.role} • {evaluator.title}
                </span>
              </div>

              <button
                onClick={() => setEvaluator(null)}
                className="px-3 py-1 bg-[#250612] hover:bg-[#3d091e] border border-[#8c6d1f]/50 rounded text-xs text-[#f7eedb]/70 hover:text-white font-mono-numbers"
              >
                Sign Out
              </button>
            </div>

            {/* Currently Active Performer on Stage */}
            {activeContestant ? (
              <div className="p-5 bg-gradient-to-b from-[#240510] to-[#140207] border border-[#d4af37]/40 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-cinzel text-xs text-[#d4af37] uppercase tracking-wider font-bold">
                    Currently On Stage (Act 0{activeContestant.order})
                  </span>
                  <span className="px-2 py-0.5 bg-[#0a0104] border border-[#d4af37]/40 rounded text-[11px] text-[#f7e7b4] font-mono-numbers">
                    {activeContestant.category}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif-theatre text-2xl md:text-3xl font-bold text-[#fff8e7]">
                      {activeContestant.name}
                    </h3>
                    <div className="font-cinzel text-sm text-[#d4af37] font-semibold">
                      "{activeContestant.actTitle}"
                    </div>
                    <div className="text-xs text-[#f7eedb]/70 mt-1">
                      {(activeContestant as any).branch || activeContestant.department} • {activeContestant.year}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#f7eedb]/80 italic pt-2 border-t border-[#8c6d1f]/30">
                  "{activeContestant.bio}"
                </p>
              </div>
            ) : (
              <div className="text-center py-6 text-stone-400 text-xs font-mono-numbers">
                Waiting for the show producer to activate a performer on stage...
              </div>
            )}

            {/* Scoring Form (Strictly 0 to 10 Scale) */}
            {activeContestant && (
              <form onSubmit={handleSubmitScore} className="space-y-6 pt-2">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-cinzel text-xs text-[#d4af37] uppercase tracking-wider font-bold">
                      Your Score (0.0 to 10.0):
                    </label>
                    <span className="font-mono-numbers text-3xl font-black text-[#f7e7b4]">
                      {score.toFixed(1)} <span className="text-sm text-[#f7eedb]/60">/ 10</span>
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={score}
                    onChange={(e) => setScore(parseFloat(e.target.value))}
                    className="w-full h-3 bg-[#2a0815] rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
                  />

                  <div className="flex justify-between text-[11px] font-mono-numbers text-[#f7eedb]/50 mt-1">
                    <span>0.0 (Unmitigated Flop)</span>
                    <span>5.0 (Average)</span>
                    <span>10.0 (Supreme Masterpiece)</span>
                  </div>
                </div>

                {/* Direct Number Input */}
                <div>
                  <label className="block text-xs text-[#f7eedb]/70 mb-1">
                    Or type exact score (e.g. 7.5, 8.2, 9.0):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={score}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) setScore(Math.min(10, Math.max(0, val)));
                    }}
                    className="w-full bg-[#0a0104] border-2 border-[#d4af37] rounded-xl px-4 py-2.5 text-center font-mono-numbers text-2xl font-bold text-[#f7e7b4] focus:outline-none"
                  />
                </div>

                {/* Optional Evaluator Notes */}
                <div>
                  <label className="block text-xs text-[#d4af37] font-cinzel uppercase tracking-wider mb-1">
                    Private Evaluator Remarks (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="Brief feedback or notes on execution..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#0a0104] border border-[#8c6d1f] rounded-lg px-3 py-2 text-xs text-[#fff8e7] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                {statusMsg && (
                  <div className="p-3 bg-gradient-to-r from-[#2a0715] via-[#480c23] to-[#2a0715] border border-[#d4af37] rounded-lg text-xs text-[#fff8e7] font-semibold text-center font-mono-numbers">
                    {statusMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-[#d4af37] via-[#f7e7b4] to-[#d4af37] text-black font-cinzel font-bold text-sm uppercase tracking-widest rounded-xl shadow-xl hover:brightness-110 active:brightness-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting
                    ? 'Submitting Score...'
                    : hasSubmittedForActive
                    ? 'Update My Recorded Score'
                    : 'Submit Score (0 - 10)'}
                </button>
              </form>
            )}

            {/* Strict Privacy Notice */}
            <div className="p-3 bg-[#110106] border border-[#8c6d1f]/30 rounded-lg text-[11px] text-[#f7eedb]/70 flex items-start gap-2">
              <span className="text-[#d4af37]">🛡️</span>
              <span>
                <strong>Confidential Evaluation:</strong> You are voting independently. You cannot see contestant predictions or other evaluators' unrevealed scores until the public reveal on stage.
              </span>
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-2xl w-full mx-auto text-center text-[11px] text-[#f7eedb]/50 border-t border-[#8c6d1f]/20 pt-4">
        BITS Pilani • BITS GOT LATENT Live Production System
      </footer>
    </div>
  );
};
