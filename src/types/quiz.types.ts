/**
 * Quiz domain types for application logic
 */

import type { Quiz, QuizQuestion, QuizOption, QuizSession, QuizResult } from './database.types';

// ============================================================================
// QUIZ CONFIG TYPES
// ============================================================================

export interface QuizConfig {
  allowBack?: boolean;
  showProgress?: boolean;
  randomizeOptions?: boolean;
  timeLimit?: number;
  [key: string]: unknown;
}

export interface ResultConfig {
  type: 'score' | 'segment' | 'category';
  segments?: ResultSegment[];
  categories?: ResultCategory[];
  scoreRange?: {
    min: number;
    max: number;
  };
}

export interface ResultSegment {
  id: string;
  label: string;
  description: string;
  minScore: number;
  maxScore: number;
  color?: string;
}

export interface ResultCategory {
  id: string;
  label: string;
  description: string;
  criteria: Record<string, unknown>;
}

export interface OfferMapping {
  [resultValue: string]: ProductOffer;
}

export interface ProductOffer {
  productId: string;
  productName: string;
  description: string;
  priceCents: number;
  currency: string;
  stripePriceId?: string;
  imageUrl?: string;
  features?: string[];
}

// ============================================================================
// QUIZ DEFINITION (with nested questions)
// ============================================================================

export interface QuizDefinition extends Omit<Quiz, 'result_config' | 'offer_mapping' | 'config'> {
  questions: QuizQuestionWithOptions[];
  config: QuizConfig;
  resultConfig: ResultConfig;
  offerMapping: OfferMapping;
}

export interface QuizQuestionWithOptions extends QuizQuestion {
  options: QuizOption[];
}

// ============================================================================
// SESSION WITH PROGRESS
// ============================================================================

export interface SessionWithProgress extends QuizSession {
  progress: {
    totalQuestions: number;
    answeredQuestions: number;
    percentComplete: number;
    currentQuestion: QuizQuestionWithOptions | null;
  };
  answers?: QuizAnswerData[];
  result?: QuizResult;
}

export interface QuizAnswerData {
  questionId: string;
  selectedOptionIds: string[];
  answerValue?: string;
  timeSpent?: number;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export type QuizEventType =
  | 'session_started'
  | 'question_viewed'
  | 'answer_saved'
  | 'quiz_completed'
  | 'result_viewed'
  | 'checkout_started'
  | 'payment_submitted'
  | 'payment_succeeded'
  | 'payment_failed';

export interface QuizEventData {
  type: QuizEventType;
  data: Record<string, unknown>;
  timestamp: string;
}

// ============================================================================
// PHASE 6: TIMELINE & PROJECTION (FUTURE)
// ============================================================================

export interface TimelinePoint {
  date: string; // ISO date
  score: number; // Projected score 0-60
  label: string; // e.g., "Week 1", "Week 4"
}

export interface ResultWithTimeline {
  // Current result data
  display_score_0_60?: number; // Score on 0-60 scale
  timeline_target_date?: string; // ISO date for goal
  timeline_series_points?: TimelinePoint[]; // Projection data for graph

  // Future: subscore breakdown
  subscore_physiological?: number;
  subscore_behavioral?: number;
  subscore_emotional?: number;
}
