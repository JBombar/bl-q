/**
 * Database table types matching Supabase schema
 * Generated from: supabase/migrations/00001_initial_schema.sql
 */

// ============================================================================
// QUIZZES
// ============================================================================

export interface Quiz {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  config: Record<string, unknown>;
  version: number;
  result_type: 'score' | 'segment' | 'category';
  result_config: Record<string, unknown>;
  offer_mapping: Record<string, unknown>;
  status: 'draft' | 'active' | 'archived';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuizInsert {
  id?: string;
  slug: string;
  title: string;
  description?: string | null;
  config?: Record<string, unknown>;
  version?: number;
  result_type: 'score' | 'segment' | 'category';
  result_config: Record<string, unknown>;
  offer_mapping: Record<string, unknown>;
  status?: 'draft' | 'active' | 'archived';
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface QuizUpdate {
  slug?: string;
  title?: string;
  description?: string | null;
  config?: Record<string, unknown>;
  version?: number;
  result_type?: 'score' | 'segment' | 'category';
  result_config?: Record<string, unknown>;
  offer_mapping?: Record<string, unknown>;
  status?: 'draft' | 'active' | 'archived';
  published_at?: string | null;
  updated_at?: string;
}

// ============================================================================
// QUIZ QUESTIONS
// ============================================================================

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  order_index: number;
  question_type: 'single_choice' | 'multiple_choice' | 'scale' | 'likert_1_4' | 'age_select' | 'info_trust' | 'education_insert' | 'validation_info';
  question_text: string;
  question_subtext: string | null;
  branching_logic: Record<string, unknown> | null;
  weight: number;
  image_url: string | null;
  required: boolean;
  created_at: string;
  updated_at: string;
  // BetterLady quiz extensions
  question_key: string | null;
  section_label: string | null;
  scale_left_label: string | null;
  scale_right_label: string | null;
  helper_text: string | null;
}

export interface QuizQuestionInsert {
  id?: string;
  quiz_id: string;
  order_index: number;
  question_type: 'single_choice' | 'multiple_choice' | 'scale' | 'likert_1_4' | 'age_select' | 'info_trust' | 'education_insert' | 'validation_info';
  question_text: string;
  question_subtext?: string | null;
  branching_logic?: Record<string, unknown> | null;
  weight?: number;
  image_url?: string | null;
  required?: boolean;
  created_at?: string;
  updated_at?: string;
  question_key?: string | null;
  section_label?: string | null;
  scale_left_label?: string | null;
  scale_right_label?: string | null;
  helper_text?: string | null;
}

export interface QuizQuestionUpdate {
  quiz_id?: string;
  order_index?: number;
  question_type?: 'single_choice' | 'multiple_choice' | 'scale' | 'likert_1_4' | 'age_select' | 'info_trust' | 'education_insert' | 'validation_info';
  question_text?: string;
  question_subtext?: string | null;
  branching_logic?: Record<string, unknown> | null;
  weight?: number;
  image_url?: string | null;
  required?: boolean;
  updated_at?: string;
  question_key?: string | null;
  section_label?: string | null;
  scale_left_label?: string | null;
  scale_right_label?: string | null;
  helper_text?: string | null;
}

// ============================================================================
// QUIZ OPTIONS
// ============================================================================

export interface QuizOption {
  id: string;
  question_id: string;
  order_index: number;
  option_text: string;
  option_value: string;
  score_value: number | null;
  image_url: string | null;
  created_at: string;
}

export interface QuizOptionInsert {
  id?: string;
  question_id: string;
  order_index: number;
  option_text: string;
  option_value: string;
  score_value?: number | null;
  image_url?: string | null;
  created_at?: string;
}

export interface QuizOptionUpdate {
  question_id?: string;
  order_index?: number;
  option_text?: string;
  option_value?: string;
  score_value?: number | null;
  image_url?: string | null;
}

// ============================================================================
// QUIZ SESSIONS
// ============================================================================

export interface QuizSession {
  id: string;
  quiz_id: string;
  quiz_version: number;
  session_token: string;
  current_question_index: number;
  completed_at: string | null;
  completed_purchase: boolean;
  email: string | null;
  user_metadata: Record<string, unknown>;
  user_agent: string | null;
  ip_address: string | null;
  referrer: string | null;
  utm_params: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface QuizSessionInsert {
  id?: string;
  quiz_id: string;
  quiz_version: number;
  session_token: string;
  current_question_index?: number;
  completed_at?: string | null;
  completed_purchase?: boolean;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
  user_agent?: string | null;
  ip_address?: string | null;
  referrer?: string | null;
  utm_params?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
  expires_at?: string;
}

export interface QuizSessionUpdate {
  quiz_version?: number;
  current_question_index?: number;
  completed_at?: string | null;
  completed_purchase?: boolean;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
  user_agent?: string | null;
  ip_address?: string | null;
  referrer?: string | null;
  utm_params?: Record<string, unknown> | null;
  updated_at?: string;
  expires_at?: string;
}

// ============================================================================
// QUIZ ANSWERS
// ============================================================================

export interface QuizAnswer {
  id: string;
  session_id: string;
  question_id: string;
  selected_option_ids: string[];
  answer_value: string | null;
  answer_score: number | null;
  time_spent_seconds: number | null;
  created_at: string;
  updated_at: string;
}

export interface QuizAnswerInsert {
  id?: string;
  session_id: string;
  question_id: string;
  selected_option_ids: string[];
  answer_value?: string | null;
  answer_score?: number | null;
  time_spent_seconds?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface QuizAnswerUpdate {
  selected_option_ids?: string[];
  answer_value?: string | null;
  answer_score?: number | null;
  time_spent_seconds?: number | null;
  updated_at?: string;
}

// ============================================================================
// QUIZ RESULTS
// ============================================================================

export interface QuizResult {
  id: string;
  session_id: string;
  quiz_id: string;
  result_type: string;
  result_value: string;
  result_score: number | null;
  result_label: string | null;
  result_description: string | null;
  recommended_product_id: string | null;
  recommended_product_name: string | null;
  recommended_price_cents: number | null;
  calculation_method: string | null;
  calculation_details: Record<string, unknown> | null;
  created_at: string;
}

export interface QuizResultInsert {
  id?: string;
  session_id: string;
  quiz_id: string;
  result_type: string;
  result_value: string;
  result_score?: number | null;
  result_label?: string | null;
  result_description?: string | null;
  recommended_product_id?: string | null;
  recommended_product_name?: string | null;
  recommended_price_cents?: number | null;
  calculation_method?: string | null;
  calculation_details?: Record<string, unknown> | null;
  created_at?: string;
}

export interface QuizResultUpdate {
  result_type?: string;
  result_value?: string;
  result_score?: number | null;
  result_label?: string | null;
  result_description?: string | null;
  recommended_product_id?: string | null;
  recommended_product_name?: string | null;
  recommended_price_cents?: number | null;
  calculation_method?: string | null;
  calculation_details?: Record<string, unknown> | null;
}

// ============================================================================
// ORDERS
// ============================================================================

export interface Order {
  id: string;
  session_id: string;
  result_id: string | null;
  order_number: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  product_id: string;
  product_name: string;
  amount_cents: number;
  currency: string;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  stripe_customer_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  payment_method_type: string | null;
  card_last4: string | null;
  card_brand: string | null;
  created_at: string;
  paid_at: string | null;
  refunded_at: string | null;
}

export interface OrderInsert {
  id?: string;
  session_id: string;
  result_id?: string | null;
  order_number: string;
  status?: 'pending' | 'paid' | 'failed' | 'refunded';
  product_id: string;
  product_name: string;
  amount_cents: number;
  currency?: string;
  stripe_payment_intent_id?: string | null;
  stripe_charge_id?: string | null;
  stripe_customer_id?: string | null;
  customer_email?: string | null;
  customer_name?: string | null;
  payment_method_type?: string | null;
  card_last4?: string | null;
  card_brand?: string | null;
  created_at?: string;
  paid_at?: string | null;
  refunded_at?: string | null;
}

export interface OrderUpdate {
  result_id?: string | null;
  status?: 'pending' | 'paid' | 'failed' | 'refunded';
  product_id?: string;
  product_name?: string;
  amount_cents?: number;
  currency?: string;
  stripe_payment_intent_id?: string | null;
  stripe_charge_id?: string | null;
  stripe_customer_id?: string | null;
  customer_email?: string | null;
  customer_name?: string | null;
  payment_method_type?: string | null;
  card_last4?: string | null;
  card_brand?: string | null;
  paid_at?: string | null;
  refunded_at?: string | null;
}

// ============================================================================
// QUIZ EVENTS
// ============================================================================

export interface QuizEvent {
  id: string;
  session_id: string | null;
  quiz_id: string | null;
  event_type: string;
  event_data: Record<string, unknown>;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface QuizEventInsert {
  id?: string;
  session_id?: string | null;
  quiz_id?: string | null;
  event_type: string;
  event_data?: Record<string, unknown>;
  user_agent?: string | null;
  ip_address?: string | null;
  created_at?: string;
}

export interface QuizEventUpdate {
  session_id?: string | null;
  quiz_id?: string | null;
  event_type?: string;
  event_data?: Record<string, unknown>;
  user_agent?: string | null;
  ip_address?: string | null;
}

// ============================================================================
// DATABASE TYPES COLLECTION
// ============================================================================

export interface Database {
  public: {
    Tables: {
      quizzes: {
        Row: Quiz;
        Insert: QuizInsert;
        Update: QuizUpdate;
      };
      quiz_questions: {
        Row: QuizQuestion;
        Insert: QuizQuestionInsert;
        Update: QuizQuestionUpdate;
      };
      quiz_options: {
        Row: QuizOption;
        Insert: QuizOptionInsert;
        Update: QuizOptionUpdate;
      };
      quiz_sessions: {
        Row: QuizSession;
        Insert: QuizSessionInsert;
        Update: QuizSessionUpdate;
      };
      quiz_answers: {
        Row: QuizAnswer;
        Insert: QuizAnswerInsert;
        Update: QuizAnswerUpdate;
      };
      quiz_results: {
        Row: QuizResult;
        Insert: QuizResultInsert;
        Update: QuizResultUpdate;
      };
      orders: {
        Row: Order;
        Insert: OrderInsert;
        Update: OrderUpdate;
      };
      quiz_events: {
        Row: QuizEvent;
        Insert: QuizEventInsert;
        Update: QuizEventUpdate;
      };
    };
  };
}
