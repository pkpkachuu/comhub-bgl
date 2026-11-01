import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import {
  Contestant,
  MicroInfluencer,
  EvaluatorProfile,
  EvaluatorId,
  SingleEvaluatorScore,
  ContestantPrediction,
  ShowState,
  RevealState,
  LeaderboardEntry,
  PublicPresentationState,
  AdminAllData,
  HomepageSettings,
} from './src/types';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

// Configurable persistent data and uploads directories for production deployment
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : process.cwd();
const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.resolve(process.cwd(), 'public', 'uploads');
const STATIC_UPLOADS_FALLBACK = path.resolve(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded images: first check persistent UPLOADS_DIR, fallback to bundled static assets in public/uploads
app.use('/uploads', express.static(UPLOADS_DIR));
if (path.resolve(UPLOADS_DIR) !== path.resolve(STATIC_UPLOADS_FALLBACK) && fs.existsSync(STATIC_UPLOADS_FALLBACK)) {
  app.use('/uploads', express.static(STATIC_UPLOADS_FALLBACK));
}

// Anti-cache middleware: prevents stale responses on multiple laptops and proxies
app.use('/api', (_req: Request, res: Response, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
  });
  next();
});

// Health check endpoints for deployment monitoring
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'BITS GOT LATENT',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    sseClientsCount: sseClients.length,
    activeContestantId: showState.activeContestantId,
    activeSlide: showState.activeSlide,
  });
});

app.get('/healthz', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

// -------------------------------------------------------------
// SEED DATA & IN-MEMORY STORE
// -------------------------------------------------------------
const DATA_FILE = path.resolve(DATA_DIR, '.bits_latent_store.json');
const BUNDLED_DATA_FILE = path.resolve(process.cwd(), '.bits_latent_store.json');

// If custom DATA_DIR is used and file does not exist there yet, copy bundled seed data
if (DATA_FILE !== BUNDLED_DATA_FILE && !fs.existsSync(DATA_FILE) && fs.existsSync(BUNDLED_DATA_FILE)) {
  try {
    fs.copyFileSync(BUNDLED_DATA_FILE, DATA_FILE);
    console.log(`Initialized persistent store at ${DATA_FILE} from bundled seed data.`);
  } catch (err) {
    console.error('Failed to copy bundled store to DATA_DIR:', err);
  }
}

// Helper to strictly validate half-step multiples (0.0, 0.5, 1.0, 1.5, ... 10.0)
export function isValidHalfStepScore(val: any): boolean {
  if (typeof val !== 'number' || isNaN(val)) return false;
  if (val < 0 || val > 10) return false;
  return Math.abs(val * 2 - Math.round(val * 2)) < 1e-5;
}

const INITIAL_EVALUATORS: EvaluatorProfile[] = [
  { id: 'jomedy', name: 'Jomedy', role: 'Judge', title: 'Guest Judge 01', passcode: 'jomedy', photoUrl: '/uploads/judge_jomedy.jpg', bio: 'Stand-up comedian, satirist, and digital entertainer.' },
  { id: 'priyanshu', name: 'Priyanshu', role: 'Judge', title: 'Guest Judge 02', passcode: 'priyanshu', photoUrl: '/uploads/judge_priyanshu.jpg', bio: 'Digital creator, observational comedian, and internet personality.' },
  { id: 'arbiter_1', name: 'ComHub Arbiter 1', role: 'Arbiter', title: 'ComHub Arbiter 01', passcode: 'arbiter1', photoUrl: '/uploads/arbiter_1.jpg', bio: 'Communications Hub lead arbiter and performance assessor.' },
  { id: 'arbiter_2', name: 'ComHub Arbiter 2', role: 'Arbiter', title: 'ComHub Arbiter 02', passcode: 'arbiter2', photoUrl: '/uploads/arbiter_2.jpg', bio: 'ComHub delegate evaluator and rhythm assessor.' },
  { id: 'arbiter_3', name: 'ComHub Arbiter 3', role: 'Arbiter', title: 'ComHub Arbiter 03', passcode: 'arbiter3', photoUrl: '/uploads/arbiter_3.jpg', bio: 'ComHub senior arbiter and stage presentation critic.' },
];

const INITIAL_CONTESTANTS: Contestant[] = [
  {
    id: 'c1',
    name: 'Aarav Sharma',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    actTitle: 'Sarcastic Code Roasts & Standup',
    category: 'Stand-Up Comedy',
    bio: 'Turns pull request rejections, hostel mess horror stories, and debugging misery into sharp observational punchlines.',
    photoUrl: '/uploads/contestant_aarav.jpg',
    photoFocalPosition: 'center',
    order: 1,
    isFeatured: true,
    isVisible: true,
    token: 'bgt-c1-9f2a',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c2',
    name: 'Priya Nair',
    department: 'Mechanical Engineering',
    year: '4th Year',
    actTitle: 'Acoustic Beatbox & Carnatic Fusion',
    category: 'Vocal Performance',
    bio: 'Blends ancient classical ragas with 140 BPM acoustic beatbox basslines, composed during lathe machine lab hours.',
    photoUrl: '/uploads/contestant_priya.jpg',
    photoFocalPosition: 'center',
    order: 2,
    isFeatured: true,
    isVisible: true,
    token: 'bgt-c2-4b7e',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c3',
    name: 'Rohan & Dev',
    department: 'Electrical & Electronics',
    year: '2nd Year',
    actTitle: 'The Quantum Mentalism Duo',
    category: 'Mentalism & Illusion',
    bio: 'Predicting your exact semester CGPA, unread WhatsApp messages, and forgotten childhood crushes.',
    photoUrl: '/uploads/contestant_rohan_dev.jpg',
    photoFocalPosition: 'center',
    order: 3,
    isFeatured: true,
    isVisible: true,
    token: 'bgt-c3-8c1d',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c4',
    name: 'Ananya Deshmukh',
    department: 'Chemical Engineering',
    year: '1st Year',
    actTitle: 'Flamenco Percussion & Spoken Word',
    category: 'Poetry & Rhythmic Tap',
    bio: 'A high-velocity spoken word monologue structured around rhythmic flamenco heel taps on a hollow wooden box.',
    photoUrl: '/uploads/contestant_ananya.jpg',
    photoFocalPosition: 'center',
    order: 4,
    isFeatured: true,
    isVisible: true,
    token: 'bgt-c4-3e9a',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_INFLUENCERS: MicroInfluencer[] = [
  {
    id: 'inf1',
    name: 'Jomedy',
    handle: '@jomedy',
    role: 'Guest Judge',
    bio: 'Stand-up comedian and content creator. Guest evaluator on the BITS GOT LATENT panel.',
    quote: '',
    photoUrl: '/uploads/judge_jomedy.jpg',
    socialUrl: 'https://instagram.com/jomedy',
    designation: 'Guest Judge 01',
    isVisible: true,
    isFeatured: true,
  },
  {
    id: 'inf2',
    name: 'Priyanshu',
    handle: '@priyanshu',
    role: 'Guest Judge',
    bio: 'Digital entertainer and satirist. Guest evaluator on the BITS GOT LATENT panel.',
    quote: '',
    photoUrl: '/uploads/judge_priyanshu.jpg',
    socialUrl: 'https://instagram.com/priyanshu',
    designation: 'Guest Judge 02',
    isVisible: true,
    isFeatured: true,
  },
];

const INITIAL_EVALUATOR_SCORES: Record<string, Partial<Record<EvaluatorId, SingleEvaluatorScore>>> = {
  c1: {
    jomedy: { score: 7.5, submittedAt: new Date().toISOString() },
    priyanshu: { score: 8.0, submittedAt: new Date().toISOString() },
    arbiter_1: { score: 7.0, submittedAt: new Date().toISOString() },
    arbiter_2: { score: 7.5, submittedAt: new Date().toISOString() },
    arbiter_3: { score: 8.0, submittedAt: new Date().toISOString() },
  },
  c2: {
    jomedy: { score: 8.5, submittedAt: new Date().toISOString() },
    priyanshu: { score: 9.0, submittedAt: new Date().toISOString() },
    arbiter_1: { score: 8.5, submittedAt: new Date().toISOString() },
    arbiter_2: { score: 9.0, submittedAt: new Date().toISOString() },
    arbiter_3: { score: 9.0, submittedAt: new Date().toISOString() },
  },
};

const INITIAL_PREDICTIONS: Record<string, ContestantPrediction> = {
  c1: {
    contestantId: 'c1',
    token: 'bgt-c1-9f2a',
    predictedScore: 7.5,
    submittedAt: new Date(Date.now() - 3600000).toISOString(),
    isLocked: true,
  },
  c2: {
    contestantId: 'c2',
    token: 'bgt-c2-4b7e',
    predictedScore: 9.0,
    submittedAt: new Date(Date.now() - 2400000).toISOString(),
    isLocked: true,
  },
  c3: {
    contestantId: 'c3',
    token: 'bgt-c3-8c1d',
    predictedScore: null,
    submittedAt: null,
    isLocked: false,
  },
  c4: {
    contestantId: 'c4',
    token: 'bgt-c4-3e9a',
    predictedScore: null,
    submittedAt: null,
    isLocked: false,
  },
};

const INITIAL_HOMEPAGE_SETTINGS: HomepageSettings = {
  heroBannerUrl: '/uploads/hero_stage.jpg',
  heroTitle: 'BITS GOT LATENT',
  heroDescription: 'Watch collegiate talents predict their own panel score. Five evaluators, zero compromise, pure calibration latency.',
  featuredContestantId: 'c1',
  rowVisibility: {
    featuredPerformers: true,
    allPerformers: true,
    guestJudges: true,
    competitionRules: true,
    standings: true,
  },
  rowOrder: ['featuredPerformers', 'allPerformers', 'guestJudges', 'competitionRules', 'standings'],
};

let contestants: Contestant[] = INITIAL_CONTESTANTS;
let microInfluencers: MicroInfluencer[] = INITIAL_INFLUENCERS;
let evaluators: EvaluatorProfile[] = INITIAL_EVALUATORS;
let evaluatorScores: Record<string, Partial<Record<EvaluatorId, SingleEvaluatorScore>>> = INITIAL_EVALUATOR_SCORES;
let contestantPredictions: Record<string, ContestantPrediction> = INITIAL_PREDICTIONS;
let homepageSettings: HomepageSettings = INITIAL_HOMEPAGE_SETTINGS;

let contestantRevealStates: Record<string, RevealState> = {
  c1: { predictionRevealed: false, panelScoreRevealed: false, comparisonRevealed: false },
  c2: { predictionRevealed: false, panelScoreRevealed: false, comparisonRevealed: false },
  c3: { predictionRevealed: false, panelScoreRevealed: false, comparisonRevealed: false },
  c4: { predictionRevealed: false, panelScoreRevealed: false, comparisonRevealed: false },
};

let showState: ShowState = {
  activeSlide: 'opening',
  activeContestantId: 'c1',
  revealState: {
    predictionRevealed: false,
    panelScoreRevealed: false,
    comparisonRevealed: false,
  },
  isOpeningPlayed: false,
  scoringFormula: 'equal_average',
  lastEventId: 'evt_init',
  updatedAt: new Date().toISOString(),
};

function persistData() {
  try {
    const payload = {
      contestants,
      microInfluencers,
      evaluators,
      evaluatorScores,
      contestantPredictions,
      contestantRevealStates,
      showState,
      homepageSettings,
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write store:', err);
  }
}

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed.contestants && parsed.contestants.length > 0) {
        // Ensure photoUrls are set to valid local assets if empty
        contestants = parsed.contestants.map((c: Contestant, idx: number) => {
          let photo = c.photoUrl;
          if (!photo) {
            const fallbackPhotos = [
              '/uploads/contestant_aarav.jpg',
              '/uploads/contestant_priya.jpg',
              '/uploads/contestant_rohan_dev.jpg',
              '/uploads/contestant_ananya.jpg',
            ];
            photo = fallbackPhotos[idx % fallbackPhotos.length];
          }
          return {
            ...c,
            photoUrl: photo,
            isVisible: c.isVisible !== undefined ? c.isVisible : true,
            isFeatured: c.isFeatured !== undefined ? c.isFeatured : true,
          };
        });
      }
      if (parsed.microInfluencers && parsed.microInfluencers.length > 0) {
        microInfluencers = parsed.microInfluencers.map((m: MicroInfluencer, idx: number) => {
          let photo = m.photoUrl;
          if (!photo) {
            photo = idx === 0 ? '/uploads/judge_jomedy.jpg' : '/uploads/judge_priyanshu.jpg';
          }
          return {
            ...m,
            photoUrl: photo,
            isVisible: m.isVisible !== undefined ? m.isVisible : true,
            isFeatured: m.isFeatured !== undefined ? m.isFeatured : true,
          };
        });
      }
      if (parsed.evaluators && parsed.evaluators.length > 0) {
        evaluators = parsed.evaluators.map((e: EvaluatorProfile, idx: number) => {
          let photo = e.photoUrl;
          if (!photo) {
            const photos = ['/uploads/judge_jomedy.jpg', '/uploads/judge_priyanshu.jpg', '/uploads/arbiter_1.jpg', '/uploads/arbiter_2.jpg', '/uploads/arbiter_3.jpg'];
            photo = photos[idx % photos.length];
          }
          return { ...e, photoUrl: photo };
        });
      }
      if (parsed.evaluatorScores) evaluatorScores = parsed.evaluatorScores;
      if (parsed.contestantPredictions) contestantPredictions = parsed.contestantPredictions;
      if (parsed.contestantRevealStates) contestantRevealStates = parsed.contestantRevealStates;
      // Guarantee each contestant has a revealState object
      contestants.forEach((c) => {
        if (!contestantRevealStates[c.id]) {
          contestantRevealStates[c.id] = {
            predictionRevealed: false,
            panelScoreRevealed: false,
            comparisonRevealed: false,
          };
        }
      });
      if (parsed.showState) showState = parsed.showState;
      if (parsed.homepageSettings) homepageSettings = { ...INITIAL_HOMEPAGE_SETTINGS, ...parsed.homepageSettings };
      console.log('Successfully loaded persisted show data.');
    }
  } catch (err) {
    console.error('Error loading store, using defaults:', err);
  }
}
loadData();

// Calculate panel score strictly out of 10 based on strict 5-evaluator rule:
// ONLY AFTER all 5 scores entered, compute arithmetic mean and round UP to next 0.5
function calculatePanelScore(contestantId: string): number | null {
  const scoresObj = evaluatorScores[contestantId];
  if (!scoresObj) return null;

  const validEvaluatorIds: EvaluatorId[] = ['jomedy', 'priyanshu', 'arbiter_1', 'arbiter_2', 'arbiter_3'];
  const enteredScores: number[] = [];

  for (const evId of validEvaluatorIds) {
    const s = scoresObj[evId];
    if (s && typeof s.score === 'number' && isValidHalfStepScore(s.score)) {
      enteredScores.push(s.score);
    }
  }

  // Strict rule: do not calculate average until all five evaluator scores are submitted
  if (enteredScores.length < 5) {
    return null;
  }

  const rawAverage = enteredScores.reduce((acc, curr) => acc + curr, 0) / 5;
  // Strict formula: round UP to next multiple of 0.5 using Math.ceil
  const finalPanelScore = Math.ceil(rawAverage * 2) / 2;
  return finalPanelScore;
}

// Build sanitized presentation state (Zero-Trust Score Privacy)
function buildPublicPresentationState(): PublicPresentationState {
  const sortedContestants = [...contestants]
    .filter((c) => c.isVisible !== false)
    .sort((a, b) => a.order - b.order);
  const activeContestant = sortedContestants.find((c) => c.id === showState.activeContestantId) || sortedContestants[0];

  const targetId = activeContestant ? activeContestant.id : '';
  const currentActReveal = contestantRevealStates[targetId] || {
    predictionRevealed: false,
    panelScoreRevealed: false,
    comparisonRevealed: false,
  };

  const hasRevealedPrediction = currentActReveal.predictionRevealed;
  const hasRevealedPanelScore = currentActReveal.panelScoreRevealed;
  const hasRevealedComparison = currentActReveal.comparisonRevealed;

  // Keep showState.revealState in sync with current act's reveal state
  showState.revealState = { ...currentActReveal };

  const realPrediction = contestantPredictions[targetId];
  const realPanelScore = targetId ? calculatePanelScore(targetId) : null;

  let revealedPrediction: number | null = null;
  let revealedPanelScore: number | null = null;
  let revealedBreakdown = null;
  let difference: number | null = null;
  let latencyTier: string | null = null;

  // MOMENT 1: CONTESTANT PREDICTION REVEAL (Strictly independent)
  if (hasRevealedPrediction) {
    if (realPrediction && realPrediction.predictedScore !== null && realPrediction.predictedScore !== undefined) {
      revealedPrediction = realPrediction.predictedScore;
    }
  }

  // MOMENT 2: PANEL SCORE REVEAL (Strictly independent)
  if (hasRevealedPanelScore && realPanelScore !== null) {
    revealedPanelScore = realPanelScore;
    const scores = evaluatorScores[targetId] || {};
    revealedBreakdown = evaluators.map((ev) => ({
      evaluatorId: ev.id,
      name: ev.name,
      role: ev.role,
      score: scores[ev.id]?.score ?? 0,
    }));
  }

  // MOMENT 3: COMPARISON & CALIBRATION VERDICT (Only when both have been revealed)
  if (hasRevealedComparison && revealedPrediction !== null && revealedPanelScore !== null) {
    difference = parseFloat(Math.abs(revealedPrediction - revealedPanelScore).toFixed(1));
    if (difference <= 0.5) {
      latencyTier = 'LATENT MASTER (Calibration Perfect)';
    } else if (difference <= 1.5) {
      latencyTier = 'ALIGNED SENSING (Very Close)';
    } else if (difference <= 3.0) {
      latencyTier = 'MODERATE GAP (Optimistic / Harsh)';
    } else {
      latencyTier = 'HIGH LATENCY DELTA (Wild Mismatch)';
    }
  }

  // ========================================================
  // CALIBRATION LEADERBOARD GENERATION (Competition Ranking: 1, 1, 3, 4)
  // Eligible ONLY when BOTH self-prediction AND panel score are officially revealed
  // ========================================================
  const eligibleEntries: LeaderboardEntry[] = [];
  const unrevealedEntries: LeaderboardEntry[] = [];

  for (const c of sortedContestants) {
    const rev = contestantRevealStates[c.id];
    const bothRevealed = !!(rev?.predictionRevealed && rev?.panelScoreRevealed);
    const pred = contestantPredictions[c.id]?.predictedScore;
    const panel = calculatePanelScore(c.id);

    if (bothRevealed && pred !== null && pred !== undefined && panel !== null) {
      const diff = parseFloat(Math.abs(pred - panel).toFixed(1));
      eligibleEntries.push({
        contestantId: c.id,
        name: c.name,
        displayName: c.displayName,
        actTitle: c.actTitle,
        category: c.category,
        department: c.department,
        branch: (c as any).branch || c.department,
        year: c.year,
        order: c.order,
        isEligible: true,
        rank: 1, // calculated dynamically below
        prediction: pred,
        panelScore: panel,
        difference: diff,
      });
    } else {
      // NEVER leak unrevealed prediction or panel score to public presentation
      unrevealedEntries.push({
        contestantId: c.id,
        name: c.name,
        displayName: c.displayName,
        actTitle: c.actTitle,
        category: c.category,
        department: c.department,
        branch: (c as any).branch || c.department,
        year: c.year,
        order: c.order,
        isEligible: false,
        rank: null,
        prediction: null,
        panelScore: null,
        difference: null,
      });
    }
  }

  // 1. Sort eligible contestants by smallest absolute difference first
  eligibleEntries.sort((a, b) => (a.difference ?? 0) - (b.difference ?? 0));

  // 2. Assign competition ranking: 1, 1, 3, 4
  for (let i = 0; i < eligibleEntries.length; i++) {
    if (i > 0 && eligibleEntries[i].difference === eligibleEntries[i - 1].difference) {
      eligibleEntries[i].rank = eligibleEntries[i - 1].rank;
    } else {
      eligibleEntries[i].rank = i + 1;
    }
  }

  // Unrevealed acts stay in original performance order
  unrevealedEntries.sort((a, b) => a.order - b.order);

  const leaderboard: LeaderboardEntry[] = [...eligibleEntries, ...unrevealedEntries];

  const publicContestants = sortedContestants.map((c) => ({
    id: c.id,
    name: c.name,
    displayName: c.displayName,
    department: c.department,
    branch: (c as any).branch || c.department,
    year: c.year,
    actTitle: c.actTitle,
    category: c.category,
    bio: c.bio,
    photoUrl: c.photoUrl,
    photoFocalPosition: c.photoFocalPosition,
    order: c.order,
    isFeatured: c.isFeatured,
    isVisible: c.isVisible,
    hasSubmitted: !!contestantPredictions[c.id]?.isLocked,
  }));

  const publicInfluencers = microInfluencers.filter((m) => m.isVisible !== false);

  const publicEvaluators = evaluators.map((e) => ({
    id: e.id,
    name: e.name,
    role: e.role,
    title: e.title,
    photoUrl: e.photoUrl,
  }));

  return {
    showState,
    activeContestant,
    contestants: publicContestants,
    microInfluencers: publicInfluencers,
    evaluators: publicEvaluators,
    homepageSettings,
    leaderboard,
    activeScoreReveal: {
      hasSubmission: !!realPrediction?.isLocked,
      predictionRevealed: hasRevealedPrediction,
      panelScoreRevealed: hasRevealedPanelScore,
      comparisonRevealed: hasRevealedComparison,
      revealedPrediction,
      revealedPanelScore,
      revealedBreakdown,
      difference,
      latencyTier,
    },
    updatedAt: new Date().toISOString(),
  };
}

// SSE Real-time Broadcast
interface SSEClient {
  id: string;
  res: Response;
}
let sseClients: SSEClient[] = [];

function broadcastEvent(eventType: string, payload: any) {
  const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  showState.lastEventId = eventId;
  persistData();

  // Guarantee every broadcast event carries the latest public presentation state
  if (!payload.publicState) {
    try {
      payload.publicState = buildPublicPresentationState();
    } catch {}
  }

  const dataString = `data: ${JSON.stringify({ eventId, eventType, payload, timestamp: Date.now() })}\n\n`;
  sseClients = sseClients.filter((client) => {
    try {
      if (client.res.writableEnded || client.res.destroyed) return false;
      client.res.write(dataString);
      if (typeof (client.res as any).flush === 'function') {
        (client.res as any).flush();
      }
      return true;
    } catch {
      return false;
    }
  });
}

// Aggressive 5s heartbeat to prevent proxy connection drops on Render, Cloudflare, or local Wi-Fi
setInterval(() => {
  sseClients = sseClients.filter((client) => {
    try {
      if (client.res.writableEnded || client.res.destroyed) return false;
      client.res.write(': heartbeat\n\n');
      if (typeof (client.res as any).flush === 'function') {
        (client.res as any).flush();
      }
      return true;
    } catch {
      return false;
    }
  });
}, 5000);

app.get('/api/events', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Critical: disables reverse-proxy buffering on Render & Nginx
    'Access-Control-Allow-Origin': '*',
  });
  res.write('\n');
  if (typeof (res as any).flush === 'function') {
    (res as any).flush();
  }

  const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  sseClients.push({ id: clientId, res });

  const initialPayload = JSON.stringify({
    eventId: `init_${Date.now()}`,
    eventType: 'SYNC_STATE',
    payload: { publicState: buildPublicPresentationState() },
    timestamp: Date.now(),
  });
  res.write(`data: ${initialPayload}\n\n`);
  if (typeof (res as any).flush === 'function') {
    (res as any).flush();
  }

  req.on('close', () => {
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
});

// -------------------------------------------------------------
// IMAGE UPLOAD ENDPOINT
// -------------------------------------------------------------
app.post('/api/upload-image', (req: Request, res: Response) => {
  try {
    const { imageBase64, fileName, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'No image data provided.' });
    }

    let buffer: Buffer;
    let ext = 'jpg';

    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const type = matches[1].toLowerCase();
      if (type.includes('png')) ext = 'png';
      else if (type.includes('webp')) ext = 'webp';
      else if (type.includes('jpeg') || type.includes('jpg')) ext = 'jpg';
      else return res.status(400).json({ error: 'Unsupported format. Allowed: JPG, PNG, WebP.' });
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(imageBase64, 'base64');
    }

    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds 10MB limit.' });
    }

    const cleanBaseName = (fileName || 'photo').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20);
    const uniqueFileName = `${cleanBaseName}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}.${ext}`;
    const destination = path.join(UPLOADS_DIR, uniqueFileName);

    fs.writeFileSync(destination, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;
    return res.json({ success: true, url: publicUrl, fileName: uniqueFileName });
  } catch (err: any) {
    console.error('Image upload failed:', err);
    return res.status(500).json({ error: err.message || 'Image upload failed.' });
  }
});

// -------------------------------------------------------------
// 1. PUBLIC PRESENTATION & HOMEPAGE ENDPOINTS
// -------------------------------------------------------------
app.get('/api/public/show-state', (_req: Request, res: Response) => {
  res.json(buildPublicPresentationState());
});

app.get('/api/public/contestants', (_req: Request, res: Response) => {
  const sorted = [...contestants]
    .filter((c) => c.isVisible !== false)
    .sort((a, b) => a.order - b.order)
    .map((c) => ({
      id: c.id,
      name: c.name,
      displayName: c.displayName,
      department: c.department,
      year: c.year,
      actTitle: c.actTitle,
      category: c.category,
      bio: c.bio,
      photoUrl: c.photoUrl,
      order: c.order,
      hasSubmitted: !!contestantPredictions[c.id]?.isLocked,
    }));
  res.json(sorted);
});

// -------------------------------------------------------------
// 2. CONTESTANT PORTAL: SECURE TOKEN-BASED SUBMISSION
// -------------------------------------------------------------
app.get('/api/contestant/verify-token', (req: Request, res: Response) => {
  const token = (req.query.token as string || '').trim();
  if (!token) {
    return res.status(400).json({ error: 'Contestant access token is required.' });
  }

  const contestant = contestants.find((c) => c.token === token);
  if (!contestant) {
    return res.status(404).json({ error: 'Invalid or expired access token. Please verify with backstage administration.' });
  }

  const prediction = contestantPredictions[contestant.id];
  return res.json({
    contestant: {
      id: contestant.id,
      name: contestant.name,
      department: contestant.department,
      year: contestant.year,
      actTitle: contestant.actTitle,
      category: contestant.category,
    },
    isSubmitted: !!prediction?.isLocked,
    existingScore: prediction?.isLocked ? prediction.predictedScore : null,
  });
});

app.post('/api/contestant/submit-token', (req: Request, res: Response) => {
  const { token, predictedScore } = req.body;
  if (!token || typeof predictedScore !== 'number') {
    return res.status(400).json({ error: 'Valid token and numerical score are required.' });
  }

  if (!isValidHalfStepScore(predictedScore)) {
    return res.status(400).json({
      error: `Invalid prediction score. Scores must be in increments of 0.5 between 0.0 and 10.0 (e.g. 7.0, 7.5, 8.0, 8.5). Received: ${predictedScore}`,
    });
  }

  const contestant = contestants.find((c) => c.token === token);
  if (!contestant) {
    return res.status(404).json({ error: 'Invalid contestant token.' });
  }

  const existing = contestantPredictions[contestant.id];
  if (existing && existing.isLocked) {
    return res.status(403).json({ error: 'Your predicted score has already been submitted and sealed.' });
  }

  contestantPredictions[contestant.id] = {
    contestantId: contestant.id,
    token,
    predictedScore: predictedScore,
    submittedAt: new Date().toISOString(),
    isLocked: true,
  };

  persistData();

  broadcastEvent('CONTESTANT_SUBMITTED', {
    contestantId: contestant.id,
    hasSubmitted: true,
  });

  return res.json({
    success: true,
    message: 'Your predicted score has been safely sealed in the vault. Good luck on stage!',
  });
});

// -------------------------------------------------------------
// 3. OPERATOR 5-EVALUATOR SCORING ENDPOINTS
// -------------------------------------------------------------
app.get('/api/operator/contestant-scores', (req: Request, res: Response) => {
  const contestantId = (req.query.contestantId as string) || showState.activeContestantId;
  const contestant = contestants.find((c) => c.id === contestantId) || contestants[0];

  if (!contestant) {
    return res.status(404).json({ error: 'Contestant not found' });
  }

  const scores = evaluatorScores[contestant.id] || {};
  const currentScores: Record<EvaluatorId, number | null> = {
    jomedy: scores.jomedy?.score ?? null,
    priyanshu: scores.priyanshu?.score ?? null,
    arbiter_1: scores.arbiter_1?.score ?? null,
    arbiter_2: scores.arbiter_2?.score ?? null,
    arbiter_3: scores.arbiter_3?.score ?? null,
  };

  const calculated = calculatePanelScore(contestant.id);

  return res.json({
    contestant: {
      id: contestant.id,
      name: contestant.name,
      department: contestant.department,
      year: contestant.year,
      actTitle: contestant.actTitle,
      category: contestant.category,
      order: contestant.order,
      photoUrl: contestant.photoUrl,
    },
    evaluators: evaluators.map((e) => ({
      id: e.id,
      name: e.name,
      role: e.role,
      title: e.title,
      photoUrl: e.photoUrl,
    })),
    scores: currentScores,
    isComplete: calculated !== null,
    calculatedPanelScore: calculated,
  });
});

app.post('/api/operator/save-scores', (req: Request, res: Response) => {
  const { contestantId, scores } = req.body;
  if (!contestantId || !scores || typeof scores !== 'object') {
    return res.status(400).json({ error: 'Contestant ID and scores object are required.' });
  }

  const contestant = contestants.find((c) => c.id === contestantId);
  if (!contestant) {
    return res.status(404).json({ error: 'Contestant not found.' });
  }

  const validEvaluatorIds: EvaluatorId[] = ['jomedy', 'priyanshu', 'arbiter_1', 'arbiter_2', 'arbiter_3'];

  if (!evaluatorScores[contestant.id]) {
    evaluatorScores[contestant.id] = {};
  }

  for (const [evKey, val] of Object.entries(scores)) {
    if (val !== null && val !== undefined && val !== '') {
      const numVal = Number(val);
      if (!isValidHalfStepScore(numVal)) {
        return res.status(400).json({
          error: `Invalid score for ${evKey}. Scores must be in increments of 0.5 between 0.0 and 10.0 (e.g. 7.0, 7.5, 8.0, 8.5). Received: ${val}`,
        });
      }
      if (validEvaluatorIds.includes(evKey as EvaluatorId)) {
        evaluatorScores[contestant.id][evKey as EvaluatorId] = {
          score: numVal,
          submittedAt: new Date().toISOString(),
          notes: '',
        };
      }
    }
  }

  persistData();

  broadcastEvent('PANEL_SCORES_UPDATED', {
    contestantId: contestant.id,
    calculatedPanelScore: calculatePanelScore(contestant.id),
  });

  return res.json({
    success: true,
    message: 'All evaluator scores recorded successfully.',
    calculatedPanelScore: calculatePanelScore(contestant.id),
  });
});

// -------------------------------------------------------------
// 4. ADMIN CONTROL ROOM & FULL CMS ENDPOINTS
// -------------------------------------------------------------
app.get('/api/admin/all-data', (_req: Request, res: Response) => {
  const sorted = [...contestants].sort((a, b) => a.order - b.order);

  const submissionStatus: Record<string, { hasSubmitted: boolean; isLocked: boolean; token: string; submittedAt: string | null }> = {};
  contestants.forEach((c) => {
    const p = contestantPredictions[c.id];
    submissionStatus[c.id] = {
      hasSubmitted: !!p?.isLocked,
      isLocked: !!p?.isLocked,
      token: c.token,
      submittedAt: p?.submittedAt || null,
    };
  });

  const evaluatorSubmissionProgress: Record<string, Record<EvaluatorId, boolean>> = {};
  const calculatedPanelAverages: Record<string, number | null> = {};

  contestants.forEach((c) => {
    const scores = evaluatorScores[c.id] || {};
    evaluatorSubmissionProgress[c.id] = {
      jomedy: !!scores.jomedy,
      priyanshu: !!scores.priyanshu,
      arbiter_1: !!scores.arbiter_1,
      arbiter_2: !!scores.arbiter_2,
      arbiter_3: !!scores.arbiter_3,
    };
    calculatedPanelAverages[c.id] = calculatePanelScore(c.id);
  });

  const adminData: AdminAllData = {
    contestants: sorted,
    microInfluencers,
    evaluators,
    homepageSettings,
    submissionStatus,
    evaluatorSubmissionProgress,
    calculatedPanelAverages,
    contestantRevealStates,
    showState,
    activePublicState: buildPublicPresentationState(),
  };

  res.json(adminData);
});

// A. Contestant CMS (Create / Edit)
app.post('/api/admin/contestants/upsert', (req: Request, res: Response) => {
  const data = req.body;
  if (!data.name || !data.actTitle) {
    return res.status(400).json({ error: 'Name and Act Title are required.' });
  }

  if (data.id) {
    const idx = contestants.findIndex((c) => c.id === data.id);
    if (idx !== -1) {
      contestants[idx] = {
        ...contestants[idx],
        ...data,
      };
    }
  } else {
    const newId = `c_${Date.now()}`;
    const token = `bgt-${newId.slice(-4)}-${crypto.randomBytes(2).toString('hex')}`;
    const newContestant: Contestant = {
      id: newId,
      name: data.name,
      displayName: data.displayName,
      department: data.department || 'BITS Pilani',
      year: data.year || '3rd Year',
      actTitle: data.actTitle,
      category: data.category || 'Talent Act',
      bio: data.bio || '',
      photoUrl: data.photoUrl || '/uploads/hero_stage.jpg',
      photoFocalPosition: data.photoFocalPosition || 'center',
      order: typeof data.order === 'number' ? data.order : contestants.length + 1,
      isFeatured: data.isFeatured !== undefined ? data.isFeatured : true,
      isVisible: data.isVisible !== undefined ? data.isVisible : true,
      token,
      createdAt: new Date().toISOString(),
    };
    contestants.push(newContestant);

    contestantPredictions[newId] = {
      contestantId: newId,
      token,
      predictedScore: null,
      submittedAt: null,
      isLocked: false,
    };

    contestantRevealStates[newId] = {
      predictionRevealed: false,
      panelScoreRevealed: false,
      comparisonRevealed: false,
    };
  }

  persistData();
  broadcastEvent('ROSTER_UPDATED', { publicState: buildPublicPresentationState() });
  res.json({ success: true, contestants });
});

// Delete Contestant
app.delete('/api/admin/contestants/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  contestants = contestants.filter((c) => c.id !== id);
  delete evaluatorScores[id];
  delete contestantPredictions[id];
  delete contestantRevealStates[id];
  persistData();
  broadcastEvent('ROSTER_UPDATED', { publicState: buildPublicPresentationState() });
  res.json({ success: true });
});

// Reorder Contestants
app.post('/api/admin/contestants/reorder', (req: Request, res: Response) => {
  const { orderedIds } = req.body;
  if (Array.isArray(orderedIds)) {
    orderedIds.forEach((id: string, index: number) => {
      const c = contestants.find((item) => item.id === id);
      if (c) c.order = index + 1;
    });
    contestants.sort((a, b) => a.order - b.order);
    persistData();
    broadcastEvent('ROSTER_UPDATED', { publicState: buildPublicPresentationState() });
  }
  res.json({ success: true, contestants });
});

// Regenerate single-use token or unlock contestant prediction
app.post('/api/admin/regenerate-token', (req: Request, res: Response) => {
  const { contestantId } = req.body;
  const contestant = contestants.find((c) => c.id === contestantId);
  if (!contestant) {
    return res.status(404).json({ error: 'Contestant not found.' });
  }

  const newToken = `bgt-${contestantId.slice(-4)}-${crypto.randomBytes(2).toString('hex')}`;
  contestant.token = newToken;

  contestantPredictions[contestantId] = {
    contestantId,
    token: newToken,
    predictedScore: null,
    submittedAt: null,
    isLocked: false,
  };

  persistData();
  broadcastEvent('TOKEN_REGENERATED', { contestantId });
  res.json({ success: true, token: newToken });
});

// B. Guest Judges CMS (Jomedy, Priyanshu)
app.post('/api/admin/guests/update', (req: Request, res: Response) => {
  const { id, name, handle, bio, photoUrl, socialUrl, designation, isVisible, isFeatured } = req.body;
  const guest = microInfluencers.find((g) => g.id === id);
  if (!guest) {
    return res.status(404).json({ error: 'Guest judge profile not found.' });
  }

  if (name !== undefined) guest.name = name;
  if (handle !== undefined) guest.handle = handle;
  if (bio !== undefined) guest.bio = bio;
  if (photoUrl !== undefined) guest.photoUrl = photoUrl;
  if (socialUrl !== undefined) guest.socialUrl = socialUrl;
  if (designation !== undefined) guest.designation = designation;
  if (isVisible !== undefined) guest.isVisible = isVisible;
  if (isFeatured !== undefined) guest.isFeatured = isFeatured;

  // Also sync name to evaluator table if matching
  if (id === 'inf1') {
    const e = evaluators.find((ev) => ev.id === 'jomedy');
    if (e) {
      if (name) e.name = name;
      if (photoUrl) e.photoUrl = photoUrl;
      if (bio) e.bio = bio;
    }
  } else if (id === 'inf2') {
    const e = evaluators.find((ev) => ev.id === 'priyanshu');
    if (e) {
      if (name) e.name = name;
      if (photoUrl) e.photoUrl = photoUrl;
      if (bio) e.bio = bio;
    }
  }

  persistData();
  broadcastEvent('INFLUENCERS_UPDATED', { microInfluencers });
  res.json({ success: true, guest, microInfluencers });
});

// C. ComHub Arbiters CMS
app.post('/api/admin/arbiters/update', (req: Request, res: Response) => {
  const { id, name, photoUrl, bio, designation } = req.body;
  const arbiter = evaluators.find((e) => e.id === id);
  if (!arbiter) {
    return res.status(404).json({ error: 'Arbiter not found.' });
  }

  if (name !== undefined) arbiter.name = name;
  if (photoUrl !== undefined) arbiter.photoUrl = photoUrl;
  if (bio !== undefined) arbiter.bio = bio;
  if (designation !== undefined) arbiter.designation = designation;

  persistData();
  broadcastEvent('EVALUATORS_UPDATED', { evaluators });
  res.json({ success: true, arbiter, evaluators });
});

// D. Homepage CMS
app.post('/api/admin/homepage-settings/update', (req: Request, res: Response) => {
  const updates = req.body;
  homepageSettings = {
    ...homepageSettings,
    ...updates,
  };

  persistData();
  broadcastEvent('HOMEPAGE_UPDATED', { homepageSettings, publicState: buildPublicPresentationState() });
  res.json({ success: true, homepageSettings });
});

// Set Active Contestant
app.post('/api/admin/set-active-contestant', (req: Request, res: Response) => {
  const { contestantId } = req.body;
  const contestant = contestants.find((c) => c.id === contestantId);
  if (!contestant) {
    return res.status(404).json({ error: 'Contestant not found.' });
  }

  showState.activeContestantId = contestantId;
  if (!contestantRevealStates[contestantId]) {
    contestantRevealStates[contestantId] = {
      predictionRevealed: false,
      panelScoreRevealed: false,
      comparisonRevealed: false,
    };
  }
  showState.revealState = { ...contestantRevealStates[contestantId] };
  showState.updatedAt = new Date().toISOString();

  persistData();
  broadcastEvent('CONTESTANT_SELECTED', {
    activeContestantId: contestantId,
    publicState: buildPublicPresentationState(),
  });

  res.json({ success: true, activeContestantId: contestantId });
});

// Reset reveals for current act (Part 2)
app.post('/api/admin/reset-act-reveals', (req: Request, res: Response) => {
  const { contestantId } = req.body;
  const targetId = contestantId || showState.activeContestantId;
  const contestant = contestants.find((c) => c.id === targetId);
  if (!contestant) {
    return res.status(404).json({ error: 'Selected act/contestant not found.' });
  }

  // Reset reveals ONLY for this contestant's act
  contestantRevealStates[contestant.id] = {
    predictionRevealed: false,
    panelScoreRevealed: false,
    comparisonRevealed: false,
  };

  // If this is the active contestant on stage, also sync showState
  if (showState.activeContestantId === contestant.id) {
    showState.revealState = {
      predictionRevealed: false,
      panelScoreRevealed: false,
      comparisonRevealed: false,
    };
  }

  showState.updatedAt = new Date().toISOString();
  persistData();

  const publicState = buildPublicPresentationState();
  broadcastEvent('ACT_REVEALS_RESET', {
    contestantId: contestant.id,
    showState,
    publicState,
  });

  return res.json({
    success: true,
    contestantId: contestant.id,
    message: `Reveals reset for Act #${contestant.order} (${contestant.name}). Submitted predictions and evaluator scores remain intact.`,
    publicState,
  });
});

// Update Show State (slide, active contestant, independent reveals)
app.post('/api/admin/show-state', (req: Request, res: Response) => {
  const { activeSlide, activeContestantId, revealState, isOpeningPlayed, actionType, resetRevealsForContestant } = req.body;

  if (activeSlide !== undefined) showState.activeSlide = activeSlide;
  if (activeContestantId !== undefined) {
    showState.activeContestantId = activeContestantId;
    if (resetRevealsForContestant) {
      contestantRevealStates[activeContestantId] = {
        predictionRevealed: false,
        panelScoreRevealed: false,
        comparisonRevealed: false,
      };
      showState.revealState = {
        predictionRevealed: false,
        panelScoreRevealed: false,
        comparisonRevealed: false,
      };
    }
  }
  if (revealState !== undefined) {
    showState.revealState = {
      ...showState.revealState,
      ...revealState,
    };
    if (showState.activeContestantId) {
      contestantRevealStates[showState.activeContestantId] = {
        ...(contestantRevealStates[showState.activeContestantId] || {
          predictionRevealed: false,
          panelScoreRevealed: false,
          comparisonRevealed: false,
        }),
        ...revealState,
      };
    }
  }
  if (isOpeningPlayed !== undefined) showState.isOpeningPlayed = isOpeningPlayed;

  showState.updatedAt = new Date().toISOString();
  persistData();

  const publicState = buildPublicPresentationState();
  broadcastEvent(actionType || 'SHOW_STATE_CHANGED', {
    showState,
    publicState,
  });

  res.json({ success: true, publicState });
});

// Reset show
app.post('/api/admin/reset-show', (_req: Request, res: Response) => {
  showState = {
    activeSlide: 'opening',
    activeContestantId: contestants[0]?.id || 'c1',
    revealState: {
      predictionRevealed: false,
      panelScoreRevealed: false,
      comparisonRevealed: false,
    },
    isOpeningPlayed: false,
    scoringFormula: 'equal_average',
    lastEventId: `reset_${Date.now()}`,
    updatedAt: new Date().toISOString(),
  };
  persistData();
  const publicState = buildPublicPresentationState();
  broadcastEvent('SHOW_RESET', { publicState });
  res.json({ success: true, publicState });
});

// Mount Vite or static server
async function startServer() {
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.PROD === 'true' ||
    (!process.env.NODE_ENV && fs.existsSync(path.resolve(process.cwd(), 'dist', 'index.html')));

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BITS GOT LATENT server running on http://0.0.0.0:${PORT} (mode: ${isProduction ? 'production' : 'development'})`);
  });
}

startServer();
