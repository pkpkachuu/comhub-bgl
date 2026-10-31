export interface Contestant {
  id: string;
  name: string;
  displayName?: string;
  department: string;
  branch?: string;
  year: string;
  actTitle: string;
  category: string;
  bio: string;
  photoUrl: string;
  photoFocalPosition?: 'center' | 'top' | 'bottom';
  order: number;
  isFeatured?: boolean;
  isVisible?: boolean;
  token: string; // Unique private submission token
  createdAt: string;
}

export interface MicroInfluencer {
  id: string;
  name: string;
  handle: string;
  role: string;
  bio: string;
  quote?: string;
  photoUrl: string;
  socialUrl?: string;
  designation?: string;
  isVisible?: boolean;
  isFeatured?: boolean;
}

export type EvaluatorId = 'jomedy' | 'priyanshu' | 'arbiter_1' | 'arbiter_2' | 'arbiter_3';

export interface EvaluatorProfile {
  id: EvaluatorId;
  name: string;
  role: 'Judge' | 'Arbiter';
  title: string;
  passcode: string;
  photoUrl?: string;
  bio?: string;
  designation?: string;
}

export interface SingleEvaluatorScore {
  score: number; // Strictly 0.0 to 10.0 in increments of 0.5
  submittedAt: string;
  notes?: string;
}

export interface ContestantEvaluatorScores {
  contestantId: string;
  scores: Partial<Record<EvaluatorId, SingleEvaluatorScore>>;
  calculatedAverage: number | null; // Calculated out of 10
  isFinalized: boolean;
  updatedAt: string;
}

export interface ContestantPrediction {
  contestantId: string;
  token: string;
  predictedScore: number | null; // Strictly 0.0 to 10.0 (SEALED from admin & evaluators)
  submittedAt: string | null;
  isLocked: boolean;
}

export interface RevealState {
  predictionRevealed: boolean;
  panelScoreRevealed: boolean;
  comparisonRevealed: boolean;
}

export type SlideId =
  | 'opening'
  | 'influencer_1'
  | 'influencer_2'
  | 'roster'
  | 'contestant_spotlight'
  | 'score_reveal'
  | 'leaderboard';

export interface ShowState {
  activeSlide: SlideId;
  activeContestantId: string;
  revealState: RevealState;
  isOpeningPlayed: boolean;
  scoringFormula: 'equal_average' | 'judges_60_arbiters_40';
  lastEventId: string;
  updatedAt: string;
}

export interface PublicContestant {
  id: string;
  name: string;
  displayName?: string;
  department: string;
  branch?: string;
  year: string;
  actTitle: string;
  category: string;
  bio: string;
  photoUrl: string;
  photoFocalPosition?: 'center' | 'top' | 'bottom';
  order: number;
  isFeatured?: boolean;
  isVisible?: boolean;
  hasSubmitted?: boolean;
}

export interface HomepageSettings {
  heroBannerUrl: string;
  heroTitle: string;
  heroDescription: string;
  featuredContestantId: string;
  rowVisibility: {
    featuredPerformers: boolean;
    allPerformers: boolean;
    guestJudges: boolean;
    competitionRules: boolean;
    standings: boolean;
  };
  rowOrder: string[];
}

export interface LeaderboardEntry {
  contestantId: string;
  name: string;
  displayName?: string;
  actTitle: string;
  category: string;
  department: string;
  branch?: string;
  year: string;
  order: number;
  isEligible: boolean; // true only if BOTH prediction and panel score are officially revealed
  rank: number | null; // Competition rank (1, 1, 3, 4...), null if unrevealed
  prediction: number | null; // strictly null if unrevealed
  panelScore: number | null; // strictly null if unrevealed
  difference: number | null; // Math.abs(prediction - panelScore), strictly null if unrevealed
}

export interface PublicPresentationState {
  showState: ShowState;
  activeContestant: Contestant;
  contestants: PublicContestant[];
  microInfluencers: MicroInfluencer[];
  evaluators: { id: EvaluatorId; name: string; role: 'Judge' | 'Arbiter'; title: string; photoUrl?: string }[];
  homepageSettings: HomepageSettings;
  leaderboard: LeaderboardEntry[];
  activeScoreReveal: {
    hasSubmission: boolean;
    predictionRevealed: boolean;
    panelScoreRevealed: boolean;
    comparisonRevealed: boolean;
    revealedPrediction: number | null; // out of 10, null if unrevealed
    revealedPanelScore: number | null; // out of 10, null if unrevealed
    revealedBreakdown: { evaluatorId: EvaluatorId; name: string; role: string; score: number }[] | null;
    difference: number | null; // Delta out of 10
    latencyTier: string | null;
  };
  updatedAt: string;
}

export interface AdminAllData {
  contestants: Contestant[];
  microInfluencers: MicroInfluencer[];
  evaluators: EvaluatorProfile[];
  homepageSettings: HomepageSettings;
  submissionStatus: Record<string, { hasSubmitted: boolean; isLocked: boolean; token: string; submittedAt: string | null }>;
  evaluatorSubmissionProgress: Record<string, Record<EvaluatorId, boolean>>;
  calculatedPanelAverages: Record<string, number | null>; // out of 10
  contestantRevealStates: Record<string, RevealState>;
  showState: ShowState;
  activePublicState: PublicPresentationState;
}
