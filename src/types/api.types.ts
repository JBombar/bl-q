/**
 * API request and response types
 */

import type { QuizDefinition, SessionWithProgress, ProductOffer } from './quiz.types';
import type { QuizResult } from './database.types';

// ============================================================================
// QUIZ API
// ============================================================================

export interface StartQuizRequest {
  slug: string;
}

export interface StartQuizResponse {
  sessionId: string;
  quiz: QuizDefinition;
}

export interface SaveAnswerRequest {
  questionId: string;
  selectedOptionIds: string[];
  answerValue?: string;
  timeSpentSeconds?: number;
}

export interface SaveAnswerResponse {
  success: boolean;
  currentQuestionIndex: number;
}

export interface CompleteQuizRequest {
  answers: {
    questionId: string;
    selectedOptionIds: string[];
  }[];
}

export interface CompleteQuizResponse {
  result: QuizResult;
  offer: ProductOffer;
}

export interface GetSessionResponse {
  session: SessionWithProgress;
}

// ============================================================================
// PAYMENT API
// ============================================================================

export interface CreatePaymentIntentRequest {
  resultId: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  orderId: string;
  amount: number;
  currency: string;
}

export interface PaymentStatusResponse {
  orderId: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paidAt?: string;
}

// ============================================================================
// ANALYTICS API
// ============================================================================

export interface TrackEventRequest {
  eventType: string;
  eventData?: Record<string, unknown>;
}

export interface TrackEventResponse {
  success: boolean;
}

// ============================================================================
// ERROR RESPONSES
// ============================================================================

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}
