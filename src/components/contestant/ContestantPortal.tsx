import React, { useState, useEffect } from 'react';
import { KeyRound, CheckCircle, AlertCircle, Lock } from 'lucide-react';

interface VerifiedContestantData {
  id: string;
  name: string;
  department: string;
  branch?: string;
  year: string;
  actTitle: string;
  category: string;
}

export const ContestantPortal: React.FC = () => {
  const [tokenInput, setTokenInput] = useState('');
  const [activeToken, setActiveToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedContestant, setVerifiedContestant] = useState<VerifiedContestantData | null>(null);
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);
  const [existingScore, setExistingScore] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State: strictly multiples of 0.5 between 0.0 and 10.0
  const [predictedScore, setPredictedScore] = useState<number>(7.5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Check URL query parameters for direct token (e.g. ?token=bgt-c1-9f2a)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setTokenInput(urlToken);
      verifyToken(urlToken);
    }
  }, []);

  const verifyToken = async (tokenToVerify?: string) => {
    const token = (tokenToVerify || tokenInput).trim();
    if (!token) {
      setErrorMsg('Please enter your unique contestant access token.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/contestant/verify-token?token=${encodeURIComponent(token)}`);
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Invalid or expired access token.');
        setVerifiedContestant(null);
      } else {
        setActiveToken(token);
        setVerifiedContestant(data.contestant);
        setIsAlreadySubmitted(data.isSubmitted);
        if (data.isSubmitted && data.existingScore !== null) {
          setExistingScore(data.existingScore);
          setSubmissionSuccess(true);
        }
      }
    } catch {
      setErrorMsg('Network error verifying token.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmitPrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedContestant || !activeToken) return;

    // Strict half-step validation on frontend
    if (predictedScore < 0 || predictedScore > 10) {
      setErrorMsg('Score must be between 0.0 and 10.0');
      return;
    }

    if (Math.abs(predictedScore * 2 - Math.round(predictedScore * 2)) > 1e-5) {
      setErrorMsg('Predicted score must be strictly in multiples of 0.5 (e.g. 7.0, 7.5, 8.0, 8.5).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/contestant/submit-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: activeToken,
          predictedScore: predictedScore,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to submit prediction.');
      } else {
        setSubmissionSuccess(true);
        setIsAlreadySubmitted(true);
        setExistingScore(predictedScore);
      }
    } catch {
      setErrorMsg('Network error submitting your prediction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickChip = (score: number) => {
    setPredictedScore(score);
  };

  const quickChipOptions = [
    5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0,
  ];

  return (
    <div className="min-h-screen bg-[#141414] text-white p-4 md:p-8 flex flex-col justify-between font-sans">
      {/* Brand Header */}
      <header className="max-w-xl w-full mx-auto text-center border-b border-neutral-800 pb-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-2xl font-bold text-[#e50914] tracking-tight">
            BITS GOT LATENT
          </span>
          <span className="text-xs px-2 py-0.5 bg-neutral-800 rounded text-neutral-400">
            VAULT
          </span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-white">
          Contestant Self-Prediction Portal
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Private Token Authentication · Strictly Multiples of 0.5 (0.0 – 10.0)
        </p>
      </header>

      {/* Main Container */}
      <main className="max-w-xl w-full mx-auto my-auto py-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 sm:p-8 shadow-2xl space-y-6">
          {/* STEP 1: TOKEN AUTHENTICATION */}
          {!verifiedContestant ? (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto text-[#e50914] shadow-md">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  Enter Your Access Token
                </h2>
                <p className="text-xs text-neutral-400">
                  Each performer receives a private, single-use access credential from the show director.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  verifyToken();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Access Token:
                  </label>
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value.trim())}
                    placeholder="e.g. bgt-c1-9f2a"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-4 py-3 text-center text-base text-white placeholder-neutral-600 focus:outline-none focus:border-[#e50914]"
                    autoFocus
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-950/80 border border-red-500 rounded text-xs text-red-200 text-center flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3 bg-[#e50914] hover:bg-[#b81d24] text-white font-bold text-xs uppercase tracking-widest rounded shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  {isVerifying ? 'Verifying Token...' : 'Verify Identity & Enter'}
                </button>
              </form>
            </div>
          ) : isAlreadySubmitted || submissionSuccess ? (
            /* STEP 2A: CONFIRMATION / SEALED PREDICTION */
            <div className="text-center space-y-6 py-2">
              <div className="w-16 h-16 rounded-full bg-green-950/80 border border-green-500 flex items-center justify-center mx-auto text-green-400 shadow-lg">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-green-400 font-bold block mb-1">
                  Prediction Sealed in Vault
                </span>
                <h2 className="text-2xl font-bold text-white">
                  {verifiedContestant.name}
                </h2>
                <div className="text-xs text-neutral-400 mt-1">
                  "{verifiedContestant.actTitle}" · {verifiedContestant.branch || verifiedContestant.department}
                </div>
              </div>

              {existingScore !== null && (
                <div className="p-5 bg-neutral-950 border border-neutral-800 rounded max-w-xs mx-auto">
                  <div className="text-xs text-neutral-400 uppercase tracking-wider">
                    Your Locked Prediction
                  </div>
                  <div className="text-5xl font-black text-[#e50914] mt-1">
                    {existingScore.toFixed(1)}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    Out of 10.0 (Multiples of 0.5)
                  </div>
                </div>
              )}

              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-400 leading-relaxed text-left space-y-1.5">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Lock className="w-4 h-4 text-[#e50914]" />
                  <span>Secrecy Guarantee</span>
                </div>
                <p>
                  Your predicted score is stored in the vault and cannot be altered. It will not be shown to the judges or audience until authorized on stage.
                </p>
              </div>
            </div>
          ) : (
            /* STEP 2B: SUBMIT PREDICTION */
            <div className="space-y-6">
              {/* Contestant Header */}
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#e50914] font-bold uppercase tracking-wider">
                    Verified Performer
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {verifiedContestant.name}
                  </h3>
                  <div className="text-xs text-neutral-400">
                    "{verifiedContestant.actTitle}" · {verifiedContestant.branch || verifiedContestant.department}
                  </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-green-950/80 border border-green-500 flex items-center justify-center text-green-400">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>

              {/* Scoring Form */}
              <form onSubmit={handleSubmitPrediction} className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                      Predict Your Panel Score (0.0 – 10.0):
                    </label>
                    <span className="text-2xl font-black text-[#e50914]">
                      {predictedScore.toFixed(1)} <span className="text-xs text-neutral-400">/ 10</span>
                    </span>
                  </div>

                  {/* Manual Step Input */}
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={predictedScore}
                    onChange={(e) => setPredictedScore(parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-4 py-2.5 text-center text-xl font-bold text-white focus:outline-none focus:border-[#e50914]"
                  />
                </div>

                {/* Quick Selection Chips */}
                <div>
                  <label className="block text-xs text-neutral-400 mb-2">
                    Quick Pick (0.5 Increments):
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {quickChipOptions.map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleQuickChip(val)}
                        className={`py-2 rounded text-xs transition-colors ${
                          predictedScore === val
                            ? 'bg-[#e50914] text-white font-bold'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                        }`}
                      >
                        {val.toFixed(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-950/80 border border-red-500 rounded text-xs text-red-200 text-center flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded text-[11px] text-neutral-400">
                  <strong>Notice:</strong> Once submitted, your prediction is permanently sealed and cannot be changed.
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#e50914] hover:bg-[#b81d24] text-white font-bold text-xs uppercase tracking-widest rounded shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sealing Prediction...' : 'Seal Prediction in Vault'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-xl w-full mx-auto text-center text-xs text-neutral-500 border-t border-neutral-800 pt-4">
        BITS Pilani · BITS GOT LATENT Live Production System
      </footer>
    </div>
  );
};
