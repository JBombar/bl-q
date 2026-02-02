/**
 * Post-Quiz Funnel Types
 * Used for screens A through F after quiz completion
 */

// Funnel screen identifiers
export type FunnelScreen = 'A' | 'B' | 'C1' | 'C2' | 'C3' | 'D' | 'E' | 'F' | 'complete';

// Stress stage (1-4 quartiles)
export type StressStage = 1 | 2 | 3 | 4;

// Time commitment options
export type TimeCommitmentMinutes = 5 | 10 | 15 | 20;

// Micro-commitment keys
export type MicroCommitmentKey = 'completer' | 'prioritizeSelf' | 'learnStress';

/**
 * Funnel metadata stored in quiz_sessions.user_metadata
 */
export interface FunnelMetadata {
  // Time commitment (Screen B)
  timeCommitmentMinutes?: TimeCommitmentMinutes;

  // Micro-commitments (Screens C1-C3)
  microCommitments?: {
    completer?: boolean;      // C1: "dokončí to, co začali"
    prioritizeSelf?: boolean; // C2: "dát sebe na první místo"
    learnStress?: boolean;    // C3: "naučit zvládat stres"
  };

  // Email (Screen D)
  email?: string;

  // Name (Screen E)
  firstName?: string;

  // Funnel tracking
  funnelStep?: FunnelScreen;
  funnelStartedAt?: string;   // ISO date
  funnelCompletedAt?: string; // ISO date
}

/**
 * Insight card types for Screen A
 */
export type InsightCardType = 'main_challenge' | 'trigger' | 'tough_period' | 'energy_level';

export interface InsightCard {
  cardType: InsightCardType;
  label: string;      // Czech label
  value: string;      // User's answer text
  icon: string;       // Icon key
}

/**
 * Insights data returned by /api/quiz/complete
 */
export interface QuizInsights {
  stressStage: StressStage;
  stageImagePath: string;
  stageTitle: string;
  stageDescription: string;
  insightCards: InsightCard[];
  normalizedScore: number;
  displayScore: number;      // 0-60 scale
  maxDisplayScore: number;   // 60
}

/**
 * Extended response from /api/quiz/complete
 */
export interface QuizCompleteResponse {
  result: {
    id: string;
    result_value: string;
    result_score: number;
    result_label: string;
    result_description: string;
    calculation_details: {
      normalizedScore: number;
      weightedScore: number;
      rawScore: number;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  offer: {
    productId?: string;
    productName?: string;
    priceCents?: number;
    [key: string]: unknown;
  };
  cached?: boolean;
  insights: QuizInsights;
  funnelState: FunnelMetadata | null;
}

/**
 * Request for /api/quiz/funnel
 */
export interface FunnelUpdateRequest {
  step: FunnelScreen;

  // Step-specific data (only include relevant field)
  timeCommitmentMinutes?: TimeCommitmentMinutes;  // Step B
  microCommitment?: {                              // Steps C1-C3
    key: MicroCommitmentKey;
    value: boolean;
  };
  email?: string;      // Step D
  firstName?: string;  // Step E
}

/**
 * Response from /api/quiz/funnel
 */
export interface FunnelUpdateResponse {
  success: boolean;
  funnelState: FunnelMetadata;
}

/**
 * Response from /api/quiz/send-plan-email
 */
export interface SendPlanEmailResponse {
  success: boolean;
  emailSent: boolean;
  mocked?: boolean;
  error?: string;
}

/**
 * Projection calculation result
 */
export interface ProjectionData {
  currentScore: number;       // Current normalized score (0-100)
  targetScore: number;        // Target after program (0-100)
  displayCurrentScore: number; // 0-60 scale
  displayTargetScore: number;  // 0-60 scale
  reductionPercent: number;   // e.g., 40 for 40% reduction
  targetDate: Date;           // 90 days from now
  timeCommitmentMinutes: TimeCommitmentMinutes;
}
