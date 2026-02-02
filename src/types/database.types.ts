/**
 * Database Types - Re-exports from Supabase generated types
 */

// Re-export all types from supabase.ts
export type { Database, Json, Tables, TablesInsert, TablesUpdate, Enums, CompositeTypes } from './supabase';

// Import Database for convenience aliases
import type { Database } from './supabase';

// ============================================================================
// Convenience Type Aliases
// ============================================================================

// Core Tables - Row types
export type Quiz = Database['public']['Tables']['quizzes']['Row'];
export type QuizQuestion = Database['public']['Tables']['quiz_questions']['Row'];
export type QuizOption = Database['public']['Tables']['quiz_options']['Row'];
export type QuizSession = Database['public']['Tables']['quiz_sessions']['Row'];
export type QuizAnswer = Database['public']['Tables']['quiz_answers']['Row'];
export type QuizResult = Database['public']['Tables']['quiz_results']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type QuizEvent = Database['public']['Tables']['quiz_events']['Row'];
export type Customer = Database['public']['Tables']['customers']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];

// Insert types
export type QuizInsert = Database['public']['Tables']['quizzes']['Insert'];
export type QuizQuestionInsert = Database['public']['Tables']['quiz_questions']['Insert'];
export type QuizOptionInsert = Database['public']['Tables']['quiz_options']['Insert'];
export type QuizSessionInsert = Database['public']['Tables']['quiz_sessions']['Insert'];
export type QuizAnswerInsert = Database['public']['Tables']['quiz_answers']['Insert'];
export type QuizResultInsert = Database['public']['Tables']['quiz_results']['Insert'];
export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type QuizEventInsert = Database['public']['Tables']['quiz_events']['Insert'];
export type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert'];

// Update types
export type QuizUpdate = Database['public']['Tables']['quizzes']['Update'];
export type QuizQuestionUpdate = Database['public']['Tables']['quiz_questions']['Update'];
export type QuizOptionUpdate = Database['public']['Tables']['quiz_options']['Update'];
export type QuizSessionUpdate = Database['public']['Tables']['quiz_sessions']['Update'];
export type QuizAnswerUpdate = Database['public']['Tables']['quiz_answers']['Update'];
export type QuizResultUpdate = Database['public']['Tables']['quiz_results']['Update'];
export type OrderUpdate = Database['public']['Tables']['orders']['Update'];
export type QuizEventUpdate = Database['public']['Tables']['quiz_events']['Update'];
export type CustomerUpdate = Database['public']['Tables']['customers']['Update'];
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update'];
