import React, { useState, useEffect, useRef } from 'react';
import {
  Contestant,
  MicroInfluencer,
  EvaluatorProfile,
  EvaluatorId,
  ShowState,
  SlideId,
  AdminAllData,
  HomepageSettings,
} from '../../types';
import {
  Shield,
  Users,
  Award,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Key,
  Play,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Layout,
  Star,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

export const AdminControlRoom: React.FC = () => {
  const [data, setData] = useState<AdminAllData | null>(null);
  const [activeTab, setActiveTab] = useState<'director' | 'contestants' | 'guests' | 'arbiters' | 'homepage'>('director');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Contestant Editing / Creation State
  const [editingContestant, setEditingContestant] = useState<Partial<Contestant> | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const contestantFileRef = useRef<HTMLInputElement>(null);

  // Guest Judge Editing State
  const [editingGuest, setEditingGuest] = useState<MicroInfluencer | null>(null);
  const guestFileRef = useRef<HTMLInputElement>(null);

  // ComHub Arbiter Editing State
  const [editingArbiter, setEditingArbiter] = useState<EvaluatorProfile | null>(null);
  const arbiterFileRef = useRef<HTMLInputElement>(null);

  // Homepage Settings State
  const [homepageForm, setHomepageForm] = useState<HomepageSettings | null>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);

  // Act-specific reveal reset confirmation state
  const [actToResetConfirm, setActToResetConfirm] = useState<Contestant | null>(null);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin/all-data');
      if (res.ok) {
        const json: AdminAllData = await res.json();
        setData(json);
        if (!homepageForm && json.homepageSettings) {
          setHomepageForm(json.homepageSettings);
        }
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const eventSource = new EventSource('/api/events');
    eventSource.onmessage = () => {
      fetchAdminData();
    };
    return () => eventSource.close();
  }, []);

  const showFeedback = (text: string, isError: boolean = false) => {
    setStatusMessage({ text, isError });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Image upload helper
  const handleFileUpload = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
        reject(new Error('Only JPG, PNG and WebP files are supported.'));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        reject(new Error('Image must be under 10MB.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await fetch('/api/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: reader.result as string,
              fileName: file.name,
            }),
          });
          const json = await res.json();
          if (res.ok && json.url) {
            resolve(json.url);
          } else {
            reject(new Error(json.error || 'Upload failed'));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('File reading error'));
      reader.readAsDataURL(file);
    });
  };

  // ==========================================
  // STAGE DIRECTOR CONTROLS
  // ==========================================
  const sendShowStateUpdate = async (updates: Partial<ShowState> & { actionType?: string; resetRevealsForContestant?: boolean }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/show-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        showFeedback('Command transmitted to stage broadcast.');
        fetchAdminData();
      }
    } catch {
      showFeedback('Error broadcasting show update.', true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectContestant = (contestantId: string) => {
    sendShowStateUpdate({
      activeContestantId: contestantId,
      resetRevealsForContestant: true,
      actionType: 'CONTESTANT_SELECTED',
    });
  };

  const handleRevealPrediction = () => {
    sendShowStateUpdate({
      revealState: {
        ...(data?.showState.revealState || { panelScoreRevealed: false, comparisonRevealed: false }),
        predictionRevealed: true,
      },
      actionType: 'REVEAL_PREDICTION',
    });
  };

  const handleRevealPanelScore = () => {
    sendShowStateUpdate({
      revealState: {
        ...(data?.showState.revealState || { predictionRevealed: false, comparisonRevealed: false }),
        panelScoreRevealed: true,
      },
      actionType: 'REVEAL_PANEL_SCORE',
    });
  };

  const handleRevealComparison = () => {
    sendShowStateUpdate({
      revealState: {
        ...(data?.showState.revealState || { predictionRevealed: true, panelScoreRevealed: true }),
        comparisonRevealed: true,
      },
      actionType: 'REVEAL_COMPARISON',
    });
  };

  // PART 2: Reset Reveals for Current Act
  const handleOpenResetActConfirm = () => {
    if (!activeContestant) {
      showFeedback('No active act selected.', true);
      return;
    }
    setActToResetConfirm(activeContestant);
  };

  const executeResetActReveals = async (contestantId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/reset-act-reveals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contestantId }),
      });
      if (res.ok) {
        const json = await res.json();
        showFeedback(json.message || 'Reveals reset for current act.');
        fetchAdminData();
      } else {
        const err = await res.json();
        showFeedback(err.error || 'Failed to reset act reveals.', true);
      }
    } catch {
      showFeedback('Network error while resetting act reveals.', true);
    } finally {
      setIsLoading(false);
      setActToResetConfirm(null);
    }
  };

  // ==========================================
  // CONTESTANT CMS HANDLERS
  // ==========================================
  const handleSaveContestant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContestant || !editingContestant.name || !editingContestant.actTitle) {
      showFeedback('Performer Name and Act Title are required.', true);
      return;
    }

    try {
      const res = await fetch('/api/admin/contestants/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingContestant),
      });
      if (res.ok) {
        showFeedback(editingContestant.id ? 'Performer updated successfully.' : 'New performer added to lineup.');
        setEditingContestant(null);
        fetchAdminData();
      } else {
        const err = await res.json();
        showFeedback(err.error || 'Failed to save contestant.', true);
      }
    } catch {
      showFeedback('Network error saving contestant.', true);
    }
  };

  const handleDeleteContestant = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}" from the roster?`)) return;

    try {
      const res = await fetch(`/api/admin/contestants/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showFeedback(`Deleted performer: ${name}`);
        fetchAdminData();
      }
    } catch {
      showFeedback('Failed to delete contestant.', true);
    }
  };

  const handleMoveContestant = async (index: number, direction: 'up' | 'down') => {
    if (!data) return;
    const list = [...data.contestants];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    try {
      const res = await fetch('/api/admin/contestants/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: list.map((c) => c.id) }),
      });
      if (res.ok) {
        fetchAdminData();
        showFeedback('Roster order updated.');
      }
    } catch {
      showFeedback('Failed to reorder roster.', true);
    }
  };

  const handleRegenerateToken = async (contestantId: string) => {
    try {
      const res = await fetch('/api/admin/regenerate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contestantId }),
      });
      if (res.ok) {
        const json = await res.json();
        showFeedback(`Generated new access token: ${json.token}`);
        fetchAdminData();
      }
    } catch {
      showFeedback('Failed to regenerate token.', true);
    }
  };

  // ==========================================
  // GUEST JUDGE CMS HANDLERS
  // ==========================================
  const handleSaveGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuest) return;

    try {
      const res = await fetch('/api/admin/guests/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingGuest),
      });
      if (res.ok) {
        showFeedback(`Updated guest judge: ${editingGuest.name}`);
        setEditingGuest(null);
        fetchAdminData();
      }
    } catch {
      showFeedback('Failed to update guest judge.', true);
    }
  };

  // ==========================================
  // COMHUB ARBITER CMS HANDLERS
  // ==========================================
  const handleSaveArbiter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArbiter) return;

    try {
      const res = await fetch('/api/admin/arbiters/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingArbiter),
      });
      if (res.ok) {
        showFeedback(`Updated arbiter: ${editingArbiter.name}`);
        setEditingArbiter(null);
        fetchAdminData();
      }
    } catch {
      showFeedback('Failed to update arbiter.', true);
    }
  };

  // ==========================================
  // HOMEPAGE SETTINGS HANDLERS
  // ==========================================
  const handleSaveHomepage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homepageForm) return;

    try {
      const res = await fetch('/api/admin/homepage-settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homepageForm),
      });
      if (res.ok) {
        showFeedback('Homepage settings saved and broadcasted.');
        fetchAdminData();
      }
    } catch {
      showFeedback('Failed to save homepage settings.', true);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#808080]">Loading Admin Content Suite...</span>
        </div>
      </div>
    );
  }

  const activeContestant = data.contestants.find((c) => c.id === data.showState.activeContestantId) || data.contestants[0];

  return (
    <div className="min-h-screen bg-[#141414] text-white p-4 md:p-8 flex flex-col font-sans select-none">
      <div className="max-w-6xl w-full mx-auto space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262626] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-2xl text-[#e50914] tracking-tight">BITS GOT LATENT</span>
              <span className="text-xs px-2 py-0.5 bg-[#222222] rounded text-[#808080]">PRODUCER CMS</span>
            </div>
            <p className="text-xs text-[#808080] mt-0.5">
              Live broadcast director, contestant roster CMS, guest judge profiles, and public homepage controls.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminData}
              className="p-2 bg-[#222222] hover:bg-[#2c2c2c] rounded text-[#808080] hover:text-white transition-colors"
              title="Refresh Show Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div
            className={`p-3 rounded text-xs font-medium flex items-center gap-2 ${
              statusMessage.isError
                ? 'bg-red-950/80 border border-red-500 text-red-200'
                : 'bg-green-950/80 border border-green-500 text-green-200'
            }`}
          >
            {statusMessage.isError ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Main Workspace Tabs */}
        <nav className="flex items-center gap-1 border-b border-[#262626] pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('director')}
            className={`px-4 py-2 rounded text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'director' ? 'bg-[#e50914] text-white' : 'text-[#808080] hover:text-white hover:bg-[#202020]'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>1. Stage Director & Reveals</span>
          </button>

          <button
            onClick={() => setActiveTab('contestants')}
            className={`px-4 py-2 rounded text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'contestants' ? 'bg-[#e50914] text-white' : 'text-[#808080] hover:text-white hover:bg-[#202020]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>2. Contestant Roster CMS</span>
          </button>

          <button
            onClick={() => setActiveTab('guests')}
            className={`px-4 py-2 rounded text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'guests' ? 'bg-[#e50914] text-white' : 'text-[#808080] hover:text-white hover:bg-[#202020]'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>3. Guest Judges (Jomedy & Priyanshu)</span>
          </button>

          <button
            onClick={() => setActiveTab('arbiters')}
            className={`px-4 py-2 rounded text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'arbiters' ? 'bg-[#e50914] text-white' : 'text-[#808080] hover:text-white hover:bg-[#202020]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>4. ComHub Arbiters (3 Profiles)</span>
          </button>

          <button
            onClick={() => setActiveTab('homepage')}
            className={`px-4 py-2 rounded text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'homepage' ? 'bg-[#e50914] text-white' : 'text-[#808080] hover:text-white hover:bg-[#202020]'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>5. Homepage & Hero CMS</span>
          </button>
        </nav>

        {/* ========================================================
            TAB 1: LIVE STAGE DIRECTOR & REVEAL CONTROLS
           ======================================================== */}
        {activeTab === 'director' && (
          <div className="space-y-6">
            {/* Active Performer on Stage Banner */}
            <div className="p-5 bg-[#1a1a1a] border border-[#2b2b2b] rounded-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded overflow-hidden bg-[#242424] flex-shrink-0">
                  {activeContestant?.photoUrl ? (
                    <img src={activeContestant.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[#808080]">No Photo</div>
                  )}
                </div>
                <div>
                  <div className="text-[11px] text-[#e50914] font-bold uppercase tracking-wider">
                    CURRENTLY ON STAGE (ACT #{activeContestant?.order})
                  </div>
                  <h2 className="text-2xl font-bold text-white leading-tight">{activeContestant?.name}</h2>
                  <div className="text-xs text-[#b3b3b3]">
                    "{activeContestant?.actTitle}" · {activeContestant?.category} · {activeContestant?.branch || activeContestant?.department}
                  </div>
                </div>
              </div>

              {/* Reveal Status */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`px-2 py-1 rounded ${data.showState.revealState.predictionRevealed ? 'bg-green-950 text-green-300 border border-green-800' : 'bg-[#222222] text-[#808080]'}`}>
                  Prediction: {data.showState.revealState.predictionRevealed ? 'REVEALED' : 'SEALED'}
                </span>
                <span className={`px-2 py-1 rounded ${data.showState.revealState.panelScoreRevealed ? 'bg-green-950 text-green-300 border border-green-800' : 'bg-[#222222] text-[#808080]'}`}>
                  Panel Score: {data.showState.revealState.panelScoreRevealed ? 'REVEALED' : 'SEALED'}
                </span>
                <span className={`px-2 py-1 rounded ${data.showState.revealState.comparisonRevealed ? 'bg-green-950 text-green-300 border border-green-800' : 'bg-[#222222] text-[#808080]'}`}>
                  Verdict: {data.showState.revealState.comparisonRevealed ? 'REVEALED' : 'SEALED'}
                </span>
              </div>
            </div>

            {/* Stage Slide Controls */}
            <div className="p-5 bg-[#181818] border border-[#262626] rounded-md space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Projector Slide Navigator</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {[
                  { id: 'opening', label: 'Opening Titles' },
                  { id: 'influencer_1', label: 'Jomedy Profile' },
                  { id: 'influencer_2', label: 'Priyanshu Profile' },
                  { id: 'roster', label: 'Roster Lineup' },
                  { id: 'contestant_spotlight', label: 'Act Spotlight' },
                  { id: 'score_reveal', label: 'Score Reveal Arena' },
                  { id: 'leaderboard', label: 'Leaderboard' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => sendShowStateUpdate({ activeSlide: s.id as SlideId })}
                    className={`p-3 rounded text-xs font-semibold text-center transition-all ${
                      data.showState.activeSlide === s.id
                        ? 'bg-[#e50914] text-white shadow-lg'
                        : 'bg-[#202020] text-[#b3b3b3] hover:text-white hover:bg-[#282828]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Independent Score Reveal Triggers */}
            <div className="p-5 bg-[#181818] border border-[#262626] rounded-md space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Independent Live Score Reveal Console
                </h3>
                <p className="text-xs text-[#808080] mt-0.5">
                  The producer triggers each reveal moment independently on stage. Vault values are decrypted only when authorized.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={handleRevealPrediction}
                  disabled={data.showState.revealState.predictionRevealed}
                  className={`p-4 rounded border text-left transition-all ${
                    data.showState.revealState.predictionRevealed
                      ? 'bg-green-950/40 border-green-800 text-green-300 opacity-60'
                      : 'bg-[#202020] hover:bg-[#282828] border-[#333333] text-white'
                  }`}
                >
                  <div className="text-xs text-[#808080] uppercase">Moment 1</div>
                  <div className="font-bold text-base mt-1">1. Reveal Contestant Prediction</div>
                  <div className="text-xs text-[#808080] mt-1">Decrypts sealed self-score on stage</div>
                </button>

                <button
                  onClick={handleRevealPanelScore}
                  disabled={data.showState.revealState.panelScoreRevealed}
                  className={`p-4 rounded border text-left transition-all ${
                    data.showState.revealState.panelScoreRevealed
                      ? 'bg-green-950/40 border-green-800 text-green-300 opacity-60'
                      : 'bg-[#202020] hover:bg-[#282828] border-[#333333] text-white'
                  }`}
                >
                  <div className="text-xs text-[#808080] uppercase">Moment 2</div>
                  <div className="font-bold text-base mt-1">2. Reveal Panel Consensus</div>
                  <div className="text-xs text-[#808080] mt-1">Reveals 5-evaluator rounded ceiling score</div>
                </button>

                <button
                  onClick={handleRevealComparison}
                  disabled={data.showState.revealState.comparisonRevealed}
                  className={`p-4 rounded border text-left transition-all ${
                    data.showState.revealState.comparisonRevealed
                      ? 'bg-green-950/40 border-green-800 text-green-300 opacity-60'
                      : 'bg-[#202020] hover:bg-[#282828] border-[#333333] text-white'
                  }`}
                >
                  <div className="text-xs text-[#808080] uppercase">Moment 3</div>
                  <div className="font-bold text-base mt-1">3. Reveal Calibration Gap</div>
                  <div className="text-xs text-[#808080] mt-1">Calculates latency delta & confetti</div>
                </button>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleOpenResetActConfirm}
                  className="px-3.5 py-2 bg-neutral-900 hover:bg-red-950/60 border border-neutral-700 hover:border-red-600 rounded text-xs text-neutral-300 hover:text-white transition-all font-semibold flex items-center gap-2"
                  title={`Reset reveals for currently selected act (${activeContestant?.name || 'none'})`}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-red-500" />
                  <span>Reset Reveals for Current Act</span>
                </button>
              </div>
            </div>

            {/* Modal: Confirm Act Reveal Reset */}
            {actToResetConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="w-full max-w-lg bg-[#181818] border border-neutral-700 rounded-lg p-6 space-y-5 shadow-2xl">
                  <div className="flex items-center gap-3 text-red-500">
                    <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">
                      Reset Reveals for Current Act
                    </h3>
                  </div>

                  <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded space-y-1">
                    <div className="text-xs uppercase tracking-wider text-[#e50914] font-bold">
                      Selected Performer (Act #{actToResetConfirm.order})
                    </div>
                    <div className="text-xl font-bold text-white">{actToResetConfirm.name}</div>
                    <div className="text-xs text-neutral-400">
                      "{actToResetConfirm.actTitle}" · {actToResetConfirm.category} · {actToResetConfirm.branch || actToResetConfirm.department}
                    </div>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    <p>
                      This will reset the stage reveal states (<strong className="text-white">predictionRevealed = false</strong> and <strong className="text-white">panelScoreRevealed = false</strong>) for this act only.
                    </p>
                    <p className="text-green-400 font-medium">
                      ✓ All submitted predictions, individual evaluator scores, and calculated panel averages will remain 100% intact.
                    </p>
                    <p className="text-neutral-400">
                      This performer will be temporarily removed from the ranked Calibration Leaderboard until both scores are officially revealed again. Other acts are completely unaffected.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => setActToResetConfirm(null)}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded text-xs font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => executeResetActReveals(actToResetConfirm.id)}
                      className="px-4 py-2 bg-[#e50914] hover:bg-[#b80710] text-white rounded text-xs font-bold transition-colors flex items-center gap-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isLoading ? 'Resetting...' : 'Confirm & Reset Reveals'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Select Active Performer */}
            <div className="p-5 bg-[#181818] border border-[#262626] rounded-md space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Select Active Act on Stage</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {data.contestants.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectContestant(c.id)}
                    className={`p-3 rounded border cursor-pointer transition-all flex items-center gap-3 ${
                      data.showState.activeContestantId === c.id
                        ? 'bg-[#22070d] border-[#e50914]'
                        : 'bg-[#1e1e1e] border-[#2c2c2c] hover:border-[#404040]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded bg-[#2a2a2a] overflow-hidden flex-shrink-0">
                      {c.photoUrl ? (
                        <img src={c.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-[#808080]">Act #{c.order}</div>
                      )}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate">{c.name}</div>
                      <div className="text-[11px] text-[#808080] truncate">"{c.actTitle}"</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: CONTESTANT ROSTER CMS
           ======================================================== */}
        {activeTab === 'contestants' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Performer Lineup Management</h3>
                <p className="text-xs text-[#808080]">
                  Create, edit, upload photos, reorder, and manage private prediction tokens.
                </p>
              </div>

              <button
                onClick={() =>
                  setEditingContestant({
                    name: '',
                    department: 'Computer Science',
                    year: '3rd Year',
                    actTitle: '',
                    category: 'Stand-Up Comedy',
                    bio: '',
                    photoUrl: '',
                    photoFocalPosition: 'center',
                    order: data.contestants.length + 1,
                    isFeatured: true,
                    isVisible: true,
                  })
                }
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#e50914] hover:bg-[#b81d24] text-white rounded text-xs font-bold transition-all shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Performer</span>
              </button>
            </div>

            {/* Contestants Table / Cards */}
            <div className="bg-[#181818] border border-[#262626] rounded-md overflow-hidden">
              <div className="divide-y divide-[#262626]">
                {data.contestants.map((c, index) => {
                  const subStatus = data.submissionStatus[c.id];
                  return (
                    <div key={c.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#1e1e1e] transition-colors">
                      <div className="flex items-center gap-4">
                        {/* Order & Reorder Controls */}
                        <div className="flex flex-col items-center gap-1 text-[#808080]">
                          <button
                            onClick={() => handleMoveContestant(index, 'up')}
                            disabled={index === 0}
                            className="p-1 hover:text-white disabled:opacity-20"
                            title="Move Up in Roster"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-white">#{c.order}</span>
                          <button
                            onClick={() => handleMoveContestant(index, 'down')}
                            disabled={index === data.contestants.length - 1}
                            className="p-1 hover:text-white disabled:opacity-20"
                            title="Move Down in Roster"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Performer Thumbnail */}
                        <div className="w-14 h-14 rounded bg-[#242424] overflow-hidden flex-shrink-0 border border-[#333333]">
                          {c.photoUrl ? (
                            <img src={c.photoUrl} alt={c.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-[#808080]">No Photo</div>
                          )}
                        </div>

                        {/* Information */}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white">{c.name}</h4>
                            {c.isFeatured && (
                              <span className="text-[10px] text-amber-400 border border-amber-400/40 px-1.5 rounded">Featured</span>
                            )}
                            {c.isVisible === false && (
                              <span className="text-[10px] text-red-400 border border-red-400/40 px-1.5 rounded">Hidden</span>
                            )}
                          </div>
                          <div className="text-xs text-[#b3b3b3]">
                            "{c.actTitle}" · {c.category} · {c.branch || c.department} ({c.year})
                          </div>
                          <div className="text-[11px] text-[#808080] mt-0.5">
                            Private Token: <code className="text-[#e50914] bg-black/40 px-1.5 py-0.5 rounded">{c.token}</code>
                            <span className="ml-2">
                              {subStatus?.hasSubmitted ? (
                                <strong className="text-green-400">Vaulted (Sealed)</strong>
                              ) : (
                                <span className="text-[#808080]">Pending Submission</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRegenerateToken(c.id)}
                          className="px-2.5 py-1.5 bg-[#252525] hover:bg-[#303030] rounded text-xs text-[#b3b3b3] hover:text-white transition-colors"
                          title="Generate new submission token"
                        >
                          Reset Token
                        </button>
                        <button
                          onClick={() => setEditingContestant(c)}
                          className="px-3 py-1.5 bg-[#262626] hover:bg-[#333333] rounded text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteContestant(c.id, c.name)}
                          className="p-1.5 text-[#808080] hover:text-red-400 rounded transition-colors"
                          title="Delete Contestant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: GUEST JUDGES CMS (JOMEDY & PRIYANSHU)
           ======================================================== */}
        {activeTab === 'guests' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Guest Judges Management</h3>
              <p className="text-xs text-[#808080]">
                Configure real photographs, social handles, verified names and descriptions for Jomedy and Priyanshu.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.microInfluencers.map((guest) => (
                <div key={guest.id} className="p-5 bg-[#181818] border border-[#282828] rounded-md space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-24 rounded bg-[#242424] overflow-hidden flex-shrink-0 border border-[#333333]">
                      {guest.photoUrl ? (
                        <img src={guest.photoUrl} alt={guest.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#808080]">No Photo</div>
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] text-[#e50914] font-bold uppercase">{guest.role}</div>
                      <h4 className="text-xl font-bold text-white">{guest.name}</h4>
                      <div className="text-xs text-[#808080]">{guest.handle}</div>
                      {guest.designation && <div className="text-xs text-[#b3b3b3] mt-0.5">{guest.designation}</div>}
                    </div>
                  </div>

                  <p className="text-xs text-[#d4d4d4] leading-relaxed line-clamp-3">
                    {guest.bio || 'Guest evaluator on the BITS GOT LATENT panel.'}
                  </p>

                  <div className="pt-2 border-t border-[#262626] flex items-center justify-between">
                    <span className="text-[11px] text-[#808080]">
                      {guest.isVisible !== false ? 'Visible on Public Stream' : 'Hidden from Public Stream'}
                    </span>
                    <button
                      onClick={() => setEditingGuest(guest)}
                      className="px-3.5 py-1.5 bg-[#262626] hover:bg-[#333333] rounded text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Profile</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: COMHUB ARBITER PROFILES CMS
           ======================================================== */}
        {activeTab === 'arbiters' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">ComHub Arbiters Management</h3>
              <p className="text-xs text-[#808080]">
                Configure the 3 Communications Hub arbiter names, designations, and portrait photographs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.evaluators
                .filter((e) => e.role === 'Arbiter')
                .map((arbiter) => (
                  <div key={arbiter.id} className="p-4 bg-[#181818] border border-[#282828] rounded-md space-y-3">
                    <div className="w-full aspect-[4/3] rounded bg-[#242424] overflow-hidden border border-[#333333]">
                      {arbiter.photoUrl ? (
                        <img src={arbiter.photoUrl} alt={arbiter.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#808080]">No Photo</div>
                      )}
                    </div>
                    <div>
                      <div className="text-[10px] text-[#808080] uppercase tracking-wider font-semibold">ComHub Arbiter</div>
                      <h4 className="text-base font-bold text-white">{arbiter.name}</h4>
                      <p className="text-xs text-[#b3b3b3] mt-0.5 line-clamp-2">
                        {arbiter.bio || 'Communications Hub evaluator presiding over live calibration.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#262626]">
                      <button
                        onClick={() => setEditingArbiter(arbiter)}
                        className="w-full py-1.5 bg-[#262626] hover:bg-[#333333] rounded text-xs font-semibold text-white transition-colors"
                      >
                        Edit Arbiter Profile
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: HOMEPAGE & HERO SETTINGS CMS
           ======================================================== */}
        {activeTab === 'homepage' && homepageForm && (
          <form onSubmit={handleSaveHomepage} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Public Homepage & Hero Controls</h3>
                <p className="text-xs text-[#808080]">
                  Customize the Netflix desktop hero banner, title, synopsis, and horizontal row visibility.
                </p>
              </div>

              <button
                type="submit"
                className="px-5 py-2 bg-[#e50914] hover:bg-[#b81d24] text-white rounded text-xs font-bold transition-all shadow"
              >
                Save Homepage Settings
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hero Banner Image */}
              <div className="p-5 bg-[#181818] border border-[#282828] rounded-md space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Cinematic Hero Banner Image</h4>
                <div className="w-full aspect-[16/9] rounded overflow-hidden bg-black relative border border-[#333333]">
                  {homepageForm.heroBannerUrl ? (
                    <img src={homepageForm.heroBannerUrl} alt="Hero Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[#808080]">No Banner Image</div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="file"
                    ref={heroFileRef}
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const url = await handleFileUpload(file);
                        setHomepageForm((prev) => (prev ? { ...prev, heroBannerUrl: url } : null));
                        showFeedback('Hero banner image uploaded.');
                      } catch (err: any) {
                        showFeedback(err.message, true);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => heroFileRef.current?.click()}
                    className="px-3 py-1.5 bg-[#262626] hover:bg-[#333333] rounded text-xs font-semibold text-white flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Banner</span>
                  </button>
                  <input
                    type="text"
                    value={homepageForm.heroBannerUrl}
                    onChange={(e) => setHomepageForm((prev) => (prev ? { ...prev, heroBannerUrl: e.target.value } : null))}
                    placeholder="or paste image URL"
                    className="flex-1 bg-[#121212] border border-[#333333] rounded px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Hero Text Content */}
              <div className="p-5 bg-[#181818] border border-[#282828] rounded-md space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Hero Text & Headline</h4>

                <div>
                  <label className="text-xs text-[#808080] block mb-1">Headline Title</label>
                  <input
                    type="text"
                    value={homepageForm.heroTitle}
                    onChange={(e) => setHomepageForm((prev) => (prev ? { ...prev, heroTitle: e.target.value } : null))}
                    className="w-full bg-[#121212] border border-[#333333] rounded px-3 py-1.5 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#808080] block mb-1">Synopsis / Tagline</label>
                  <textarea
                    rows={3}
                    value={homepageForm.heroDescription}
                    onChange={(e) => setHomepageForm((prev) => (prev ? { ...prev, heroDescription: e.target.value } : null))}
                    className="w-full bg-[#121212] border border-[#333333] rounded px-3 py-1.5 text-xs text-white"
                  />
                </div>


              </div>
            </div>

            {/* Row Visibility Toggles */}
            <div className="p-5 bg-[#181818] border border-[#282828] rounded-md space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Content Rows Visibility</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { key: 'featuredPerformers', label: 'Featured Performers Row' },
                  { key: 'allPerformers', label: 'Meet The Performers Roster' },
                  { key: 'guestJudges', label: 'Featured Guest Judges Section' },
                  { key: 'competitionRules', label: 'Competition Rules & Mechanics' },
                  { key: 'standings', label: 'Live Calibration Standings Table' },
                ].map((row) => (
                  <label key={row.key} className="flex items-center gap-2.5 p-3 bg-[#1e1e1e] border border-[#2c2c2c] rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={homepageForm.rowVisibility[row.key as keyof typeof homepageForm.rowVisibility]}
                      onChange={(e) =>
                        setHomepageForm((prev) =>
                          prev
                            ? {
                                ...prev,
                                rowVisibility: {
                                  ...prev.rowVisibility,
                                  [row.key]: e.target.checked,
                                },
                              }
                            : null
                        )
                      }
                      className="rounded accent-[#e50914]"
                    />
                    <span className="text-xs text-white font-medium">{row.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </form>
        )}
      </div>

      {/* ========================================================
          MODAL: EDIT / CREATE CONTESTANT
         ======================================================== */}
      {editingContestant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#181818] border border-[#333333] rounded-lg max-w-xl w-full p-6 text-white space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#282828] pb-3">
              <h3 className="font-bold text-lg text-white">
                {editingContestant.id ? 'Edit Performer Profile' : 'Add New Performer'}
              </h3>
              <button onClick={() => setEditingContestant(null)} className="text-[#808080] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveContestant} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#808080] block mb-1">Performer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editingContestant.name || ''}
                    onChange={(e) => setEditingContestant({ ...editingContestant, name: e.target.value })}
                    className="w-full bg-[#121212] border border-[#333333] rounded px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#808080] block mb-1">Act Title *</label>
                  <input
                    type="text"
                    required
                    value={editingContestant.actTitle || ''}
                    onChange={(e) => setEditingContestant({ ...editingContestant, actTitle: e.target.value })}
                    className="w-full bg-[#121212] border border-[#333333] rounded px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-[#808080] block mb-1">Category / Genre</label>
                  <input
                    type="text"
                    value={editingContestant.category || ''}
                    onChange={(e) => setEditingContestant({ ...editingContestant, category: e.target.value })}
                    className="w-full bg-[#121212] border border-[#333333] rounded px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#808080] block mb-1">Branch</label>
                  <input
                    type="text"
                    value={editingContestant.branch || editingContestant.department || ''}
                    onChange={(e) => setEditingContestant({ ...editingContestant, department: e.target.value, branch: e.target.value })}
                    className="w-full bg-[#121212] border border-[#333333] rounded px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#808080] block mb-1">Batch Year</label>
                  <input
                    type="text"
                    value={editingContestant.year || ''}
                    onChange={(e) => setEditingContestant({ ...editingContestant, year: e.target.value })}
                    className="w-full bg-[#121212] border border-[#333333] rounded px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Photo Upload & Preview */}
              <div className="space-y-2 border-t border-[#262626] pt-3">
                <label className="text-xs text-[#808080] block">Performer Photograph</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-24 rounded bg-black overflow-hidden border border-[#383838] flex-shrink-0">
                    {editingContestant.photoUrl ? (
                      <img src={editingContestant.photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-[#808080]">No Photo</div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <input
                      type="file"
                      ref={contestantFileRef}
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploadingPhoto(true);
                        try {
                          const url = await handleFileUpload(file);
                          setEditingContestant((prev) => (prev ? { ...prev, photoUrl: url } : null));
                          showFeedback('Photograph uploaded successfully.');
                        } catch (err: any) {
                          showFeedback(err.message, true);
                        } finally {
                          setIsUploadingPhoto(false);
                        }
                      }}
                    />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => contestantFileRef.current?.click()}
                        disabled={isUploadingPhoto}
                        className="px-3 py-1.5 bg-[#262626] hover:bg-[#333333] rounded text-xs text-white font-semibold flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingPhoto ? 'Uploading...' : 'Upload Image'}</span>
                      </button>

                      {editingContestant.photoUrl && (
                        <button
                          type="button"
                          onClick={() => setEditingContestant({ ...editingContestant, photoUrl: '' })}
                          className="px-2.5 py-1.5 text-xs text-red-400 hover:text-red-300"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={editingContestant.photoUrl || ''}
                      onChange={(e) => setEditingContestant({ ...editingContestant, photoUrl: e.target.value })}
                      placeholder="or paste image URL"
                      className="w-full bg-[#121212] border border-[#333333] rounded px-3 py-1 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="text-xs text-[#808080] block mb-1">Performance Synopsis & Biography</label>
                <textarea
                  rows={3}
                  value={editingContestant.bio || ''}
                  onChange={(e) => setEditingContestant({ ...editingContestant, bio: e.target.value })}
                  className="w-full bg-[#121212] border border-[#333333] rounded px-3 py-1.5 text-xs text-white"
                />
              </div>

              {/* Order & Toggles */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#262626] pt-3">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingContestant.isFeatured !== false}
                      onChange={(e) => setEditingContestant({ ...editingContestant, isFeatured: e.target.checked })}
                      className="rounded accent-[#e50914]"
                    />
                    <span>Featured on Home</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingContestant.isVisible !== false}
                      onChange={(e) => setEditingContestant({ ...editingContestant, isVisible: e.target.checked })}
                      className="rounded accent-[#e50914]"
                    />
                    <span>Visible in Public Stream</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingContestant(null)}
                    className="px-4 py-2 bg-[#222222] hover:bg-[#2c2c2c] rounded text-xs font-semibold text-[#808080] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#e50914] hover:bg-[#b81d24] text-white rounded text-xs font-bold"
                  >
                    Save Performer
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: EDIT GUEST JUDGE PROFILE
         ======================================================== */}
      {editingGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#181818] border border-[#333333] rounded-lg max-w-lg w-full p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-[#282828] pb-3">
              <h3 className="font-bold text-lg text-white">Edit Guest Judge Profile</h3>
              <button onClick={() => setEditingGuest(null)} className="text-[#808080] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveGuest} className="space-y-4">
              <div>
                <label className="text-xs text-[#808080] block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingGuest.name}
                  onChange={(e) => setEditingGuest({ ...editingGuest, name: e.target.value })}
                  className="w-full bg-[#121212] border border-[#333333] rounded px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#808080] block mb-1">Social Handle</label>
                  <input
                    type="text"
                    value={editingGuest.handle}
                    onChange={(e) => setEditingGuest({ ...editingGuest, handle: e.target.value })}
                    className="w-full bg-[#121212] border border-[#333333] rounded px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#808080] block mb-1">Designation</label>
                  <input
                    type="text"
                    value={editingGuest.designation || ''}
                    onChange={(e) => setEditingGuest({ ...editingGuest, designation: e.target.value })}
                    className="w-full bg-[#121212] border border-[#333333] rounded px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2 border-t border-[#262626] pt-3">
                <label className="text-xs text-[#808080] block">Judge Portrait Photograph</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 rounded bg-black overflow-hidden border border-[#383838] flex-shrink-0">
                    {editingGuest.photoUrl ? (
                      <img src={editingGuest.photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-[#808080]">No Photo</div>
                    )}
                  </div>
                  <div className="space-y-2 flex-1">
                    <input
                      type="file"
                      ref={guestFileRef}
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await handleFileUpload(file);
                          setEditingGuest((prev) => (prev ? { ...prev, photoUrl: url } : null));
                          showFeedback('Judge photo updated.');
                        } catch (err: any) {
                          showFeedback(err.message, true);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => guestFileRef.current?.click()}
                      className="px-3 py-1.5 bg-[#262626] hover:bg-[#333333] rounded text-xs text-white font-semibold flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload New Portrait</span>
                    </button>
                    <input
                      type="text"
                      value={editingGuest.photoUrl || ''}
                      onChange={(e) => setEditingGuest({ ...editingGuest, photoUrl: e.target.value })}
                      placeholder="or enter image URL"
                      className="w-full bg-[#121212] border border-[#333333] rounded px-3 py-1 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-[#808080] block mb-1">Biography</label>
                <textarea
                  rows={3}
                  value={editingGuest.bio}
                  onChange={(e) => setEditingGuest({ ...editingGuest, bio: e.target.value })}
                  className="w-full bg-[#121212] border border-[#333333] rounded px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#262626] pt-3">
                <button
                  type="button"
                  onClick={() => setEditingGuest(null)}
                  className="px-4 py-2 bg-[#222222] hover:bg-[#2c2c2c] rounded text-xs text-[#808080] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#e50914] hover:bg-[#b81d24] text-white rounded text-xs font-bold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: EDIT COMBHUB ARBITER PROFILE
         ======================================================== */}
      {editingArbiter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#181818] border border-[#333333] rounded-lg max-w-lg w-full p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-[#282828] pb-3">
              <h3 className="font-bold text-lg text-white">Edit ComHub Arbiter</h3>
              <button onClick={() => setEditingArbiter(null)} className="text-[#808080] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveArbiter} className="space-y-4">
              <div>
                <label className="text-xs text-[#808080] block mb-1">Arbiter Name</label>
                <input
                  type="text"
                  required
                  value={editingArbiter.name}
                  onChange={(e) => setEditingArbiter({ ...editingArbiter, name: e.target.value })}
                  className="w-full bg-[#121212] border border-[#333333] rounded px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-[#808080] block mb-1">Designation</label>
                <input
                  type="text"
                  value={editingArbiter.designation || ''}
                  onChange={(e) => setEditingArbiter({ ...editingArbiter, designation: e.target.value })}
                  className="w-full bg-[#121212] border border-[#333333] rounded px-3 py-1.5 text-xs text-white"
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-2 border-t border-[#262626] pt-3">
                <label className="text-xs text-[#808080] block">Arbiter Photograph</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 rounded bg-black overflow-hidden border border-[#383838] flex-shrink-0">
                    {editingArbiter.photoUrl ? (
                      <img src={editingArbiter.photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-[#808080]">No Photo</div>
                    )}
                  </div>
                  <div className="space-y-2 flex-1">
                    <input
                      type="file"
                      ref={arbiterFileRef}
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await handleFileUpload(file);
                          setEditingArbiter((prev) => (prev ? { ...prev, photoUrl: url } : null));
                          showFeedback('Arbiter photo updated.');
                        } catch (err: any) {
                          showFeedback(err.message, true);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => arbiterFileRef.current?.click()}
                      className="px-3 py-1.5 bg-[#262626] hover:bg-[#333333] rounded text-xs text-white font-semibold flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>
                    <input
                      type="text"
                      value={editingArbiter.photoUrl || ''}
                      onChange={(e) => setEditingArbiter({ ...editingArbiter, photoUrl: e.target.value })}
                      placeholder="or enter image URL"
                      className="w-full bg-[#121212] border border-[#333333] rounded px-3 py-1 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-[#808080] block mb-1">Biography</label>
                <textarea
                  rows={3}
                  value={editingArbiter.bio || ''}
                  onChange={(e) => setEditingArbiter({ ...editingArbiter, bio: e.target.value })}
                  className="w-full bg-[#121212] border border-[#333333] rounded px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#262626] pt-3">
                <button
                  type="button"
                  onClick={() => setEditingArbiter(null)}
                  className="px-4 py-2 bg-[#222222] hover:bg-[#2c2c2c] rounded text-xs text-[#808080] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#e50914] hover:bg-[#b81d24] text-white rounded text-xs font-bold"
                >
                  Save Arbiter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
