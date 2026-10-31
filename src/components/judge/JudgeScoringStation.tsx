import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Save, RefreshCw } from 'lucide-react';
import { EvaluatorId } from '../../types';

interface ContestantSummary {
  id: string;
  name: string;
  department: string;
  branch?: string;
  year: string;
  actTitle: string;
  category: string;
  order: number;
  photoUrl: string;
}

interface EvaluatorInfo {
  id: EvaluatorId;
  name: string;
  role: 'Judge' | 'Arbiter';
  title: string;
  photoUrl?: string;
}

export const JudgeScoringStation: React.FC = () => {
  const [contestant, setContestant] = useState<ContestantSummary | null>(null);
  const [allContestants, setAllContestants] = useState<ContestantSummary[]>([]);
  const [evaluators, setEvaluators] = useState<EvaluatorInfo[]>([]);
  const [scores, setScores] = useState<Record<EvaluatorId, number | null>>({
    jomedy: null,
    priyanshu: null,
    arbiter_1: null,
    arbiter_2: null,
    arbiter_3: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const fetchScoresForContestant = async (contestantId?: string) => {
    setIsLoading(true);
    try {
      const url = contestantId
        ? `/api/operator/contestant-scores?contestantId=${contestantId}`
        : `/api/operator/contestant-scores`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setContestant(json.contestant);
        setEvaluators(json.evaluators);
        setScores({
          jomedy: json.scores?.jomedy ?? null,
          priyanshu: json.scores?.priyanshu ?? null,
          arbiter_1: json.scores?.arbiter_1 ?? null,
          arbiter_2: json.scores?.arbiter_2 ?? null,
          arbiter_3: json.scores?.arbiter_3 ?? null,
        });
      }

      const adminRes = await fetch('/api/public/show-state');
      if (adminRes.ok) {
        const adminJson = await adminRes.json();
        setAllContestants(adminJson.contestants || []);
      }
    } catch {
      setStatusMsg({ text: 'Failed to connect to scoring server.', isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScoresForContestant();
    const eventSource = new EventSource('/api/events');
    eventSource.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.eventType === 'SHOW_STATE_CHANGED' || msg.eventType === 'CONTESTANT_SELECTED') {
          fetchScoresForContestant();
        }
      } catch {}
    };
    return () => eventSource.close();
  }, []);

  const handleScoreChange = (evId: EvaluatorId, valStr: string) => {
    if (valStr === '') {
      setScores((prev) => ({ ...prev, [evId]: null }));
      return;
    }
    const num = parseFloat(valStr);
    if (!isNaN(num)) {
      setScores((prev) => ({ ...prev, [evId]: num }));
    }
  };

  const handleQuickChip = (evId: EvaluatorId, stepScore: number) => {
    setScores((prev) => ({ ...prev, [evId]: stepScore }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contestant) return;

    for (const [key, val] of Object.entries(scores)) {
      if (val !== null && val !== undefined) {
        if (val < 0 || val > 10) {
          setStatusMsg({ text: `Score for ${key} must be between 0.0 and 10.0.`, isError: true });
          return;
        }
        if (Math.abs(val * 2 - Math.round(val * 2)) > 1e-5) {
          setStatusMsg({
            text: `Invalid score (${val}) for ${key}. Scores must be in multiples of 0.5 (e.g. 7.0, 7.5, 8.0).`,
            isError: true,
          });
          return;
        }
      }
    }

    setIsSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/operator/save-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contestantId: contestant.id,
          scores,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setStatusMsg({ text: 'All evaluator scores successfully saved to the show database!' });
      } else {
        setStatusMsg({ text: json.error || 'Failed to save scores.', isError: true });
      }
    } catch {
      setStatusMsg({ text: 'Network error saving scores.', isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  const allScoresList = Object.values(scores).filter((s): s is number => s !== null);
  const isAllFiveEntered = allScoresList.length === 5;
  const rawAverage = isAllFiveEntered
    ? allScoresList.reduce((acc, curr) => acc + curr, 0) / 5
    : null;
  const finalPanelScore = rawAverage !== null
    ? Math.ceil(rawAverage * 2) / 2
    : null;

  const quickChipValues = [5.0, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0];

  return (
    <div className="min-h-screen bg-[#141414] text-white p-4 md:p-8 flex flex-col justify-between font-sans">
      <div className="max-w-7xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#e50914] tracking-tight">
                BITS GOT LATENT
              </span>
              <span className="text-xs px-2 py-0.5 bg-neutral-800 rounded text-neutral-400">
                SCORING DESK
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white mt-1">
              Five-Evaluator Panel Scoring Desk
            </h1>
            <p className="text-xs text-neutral-400">
              Single-laptop operator workflow for live production.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchScoresForContestant(contestant?.id)}
              disabled={isLoading}
              className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors"
              title="Refresh scores from server"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {statusMsg && (
          <div
            className={`p-3.5 rounded text-xs font-semibold flex items-center gap-2.5 ${
              statusMsg.isError
                ? 'bg-red-950/80 border border-red-500 text-red-200'
                : 'bg-green-950/80 border border-green-500 text-green-200'
            }`}
          >
            {statusMsg.isError ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Active Contestant Card & Switcher */}
        {contestant && (
          <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded overflow-hidden bg-neutral-800 flex-shrink-0 border border-neutral-700">
                {contestant.photoUrl ? (
                  <img src={contestant.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">Act #{contestant.order}</div>
                )}
              </div>
              <div>
                <div className="text-[11px] text-[#e50914] font-bold uppercase tracking-wider">
                  Active Performer on Stage (Act #{contestant.order})
                </div>
                <h2 className="text-2xl font-bold text-white leading-tight mt-0.5">
                  {contestant.name}
                </h2>
                <div className="text-xs text-neutral-400 mt-0.5">
                  "{contestant.actTitle}" · {contestant.category} · {contestant.branch || contestant.department} ({contestant.year})
                </div>
              </div>
            </div>

            {/* Quick Act Switcher */}
            {allContestants.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-neutral-400 whitespace-nowrap">Switch Act:</label>
                <select
                  value={contestant.id}
                  onChange={(e) => fetchScoresForContestant(e.target.value)}
                  className="bg-neutral-800 border border-neutral-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#e50914]"
                >
                  {allContestants.map((c) => (
                    <option key={c.id} value={c.id}>
                      Act #{c.order} — {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* 5 Evaluator Scoring Form — Unified Coherent Interface Aligned on the Same Horizontal Level */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-stretch">
            {evaluators.map((ev) => {
              const currentScore = scores[ev.id];
              const isFilled = currentScore !== null && currentScore !== undefined;

              return (
                <div
                  key={ev.id}
                  className={`p-3.5 rounded-lg border transition-all flex flex-col justify-between ${
                    isFilled
                      ? 'bg-neutral-900 border-neutral-700 shadow-md'
                      : 'bg-neutral-900/60 border-neutral-800'
                  }`}
                >
                  {/* Evaluator Identity Block (Uniform Vertical Alignment) */}
                  <div className="border-b border-neutral-800/80 pb-2.5 mb-2.5">
                    <div className="flex items-center justify-between mb-1 h-5">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 truncate">
                        {ev.role === 'Judge' ? 'Guest Judge' : 'ComHub Arbiter'}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-sm sm:text-base truncate leading-tight h-6 flex items-center">
                      {ev.name}
                    </h3>
                    <p className="text-[11px] text-neutral-400 truncate h-4 leading-none">
                      {ev.title}
                    </p>
                  </div>

                  {/* Prominent Evaluator Score Display */}
                  <div className="h-16 flex items-baseline justify-center gap-1 my-1.5 bg-neutral-950/80 border border-neutral-800 rounded-md py-2">
                    <span className="text-3xl font-black text-white font-mono-numbers tracking-tight">
                      {isFilled ? currentScore?.toFixed(1) : '—'}
                    </span>
                    <span className="text-xs text-neutral-500 font-bold">/ 10</span>
                  </div>

                  {/* Manual Step 0.5 Input Field */}
                  <div className="my-2">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={currentScore !== null && currentScore !== undefined ? currentScore : ''}
                      onChange={(e) => handleScoreChange(ev.id, e.target.value)}
                      placeholder="0.0 - 10.0"
                      className="w-full text-center bg-neutral-950 border border-neutral-700 rounded px-2 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-[#e50914] transition-colors"
                    />
                    <span className="block text-center text-[10px] text-neutral-500 uppercase tracking-wider mt-1 font-semibold">
                      Score Input (0.5 Step)
                    </span>
                  </div>

                  {/* Quick 0.5-Increment Chips in a Compact Grid */}
                  <div className="grid grid-cols-2 gap-1 pt-1.5 mt-auto border-t border-neutral-800/60">
                    {quickChipValues.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleQuickChip(ev.id, chip)}
                        className={`py-1 text-[11px] font-bold rounded transition-colors text-center ${
                          currentScore === chip
                            ? 'bg-[#e50914] text-white shadow'
                            : 'bg-neutral-800/90 hover:bg-neutral-700 text-neutral-300'
                        }`}
                      >
                        {chip.toFixed(1)}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mathematical Consensus Preview */}
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-neutral-400 block font-semibold">
                Scoring Engine Result (Ceiling Rounding UP to next 0.5)
              </span>
              <div className="text-xs text-neutral-300 mt-0.5">
                {isAllFiveEntered ? (
                  <span>
                    Raw average: <strong className="text-white">{rawAverage?.toFixed(2)}</strong> → Ceiled panel score:{' '}
                    <strong className="text-[#e50914]">{finalPanelScore?.toFixed(1)} / 10</strong>
                  </span>
                ) : (
                  <span className="text-neutral-500 italic">
                    Requires all 5 evaluator scores to calculate the final rounded panel score ({allScoresList.length}/5 entered).
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#e50914] hover:bg-[#b81d24] text-white font-bold text-sm rounded shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Scores...' : 'Save Evaluator Scores'}</span>
            </button>
          </div>
        </form>

        <div className="p-3 bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-500">
          <strong>Confidentiality Enforced:</strong> Contestant self-predictions are never queried or displayed on this scoring station. Scores are committed directly to the backstage store for authorized stage reveals.
        </div>
      </div>
    </div>
  );
};
