-- Quiz Funnel Application - Initial Database Schema
-- Version: 1.0
-- Date: 2026-01-24
-- Description: Creates all 8 core tables with indexes and constraints

-- ============================================================================
-- TABLE 1: quizzes
-- ============================================================================
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  config JSONB DEFAULT '{}'::jsonb,
  version INTEGER DEFAULT 1,
  result_type TEXT NOT NULL CHECK (result_type IN ('score', 'segment', 'category')),
  result_config JSONB NOT NULL,
  offer_mapping JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for quizzes
CREATE INDEX idx_quizzes_slug ON quizzes(slug);
CREATE INDEX idx_quizzes_status ON quizzes(status);

-- ============================================================================
-- TABLE 2: quiz_questions
-- ============================================================================
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('single_choice', 'multiple_choice', 'scale')),
  question_text TEXT NOT NULL,
  question_subtext TEXT,
  branching_logic JSONB,
  weight NUMERIC DEFAULT 1.0,
  image_url TEXT,
  required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for quiz_questions
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id, order_index);

-- ============================================================================
-- TABLE 3: quiz_options
-- ============================================================================
CREATE TABLE quiz_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  option_text TEXT NOT NULL,
  option_value TEXT NOT NULL,
  score_value NUMERIC,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for quiz_options
CREATE INDEX idx_quiz_options_question_id ON quiz_options(question_id, order_index);

-- ============================================================================
-- TABLE 4: quiz_sessions
-- ============================================================================
CREATE TABLE quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  quiz_version INTEGER NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  current_question_index INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  completed_purchase BOOLEAN DEFAULT false,
  email TEXT,
  user_metadata JSONB DEFAULT '{}'::jsonb,
  user_agent TEXT,
  ip_address TEXT,
  referrer TEXT,
  utm_params JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- Indexes for quiz_sessions
CREATE UNIQUE INDEX idx_quiz_sessions_token ON quiz_sessions(session_token);
CREATE INDEX idx_quiz_sessions_quiz_id ON quiz_sessions(quiz_id);
CREATE INDEX idx_quiz_sessions_expires_at ON quiz_sessions(expires_at);

-- ============================================================================
-- TABLE 5: quiz_answers
-- ============================================================================
CREATE TABLE quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  selected_option_ids UUID[] NOT NULL,
  answer_value TEXT,
  answer_score NUMERIC,
  time_spent_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, question_id)
);

-- Indexes for quiz_answers
CREATE INDEX idx_quiz_answers_session_id ON quiz_answers(session_id);
CREATE INDEX idx_quiz_answers_question_id ON quiz_answers(question_id);

-- ============================================================================
-- TABLE 6: quiz_results
-- ============================================================================
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID UNIQUE NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  result_type TEXT NOT NULL,
  result_value TEXT NOT NULL,
  result_score NUMERIC,
  result_label TEXT,
  result_description TEXT,
  recommended_product_id TEXT,
  recommended_product_name TEXT,
  recommended_price_cents INTEGER,
  calculation_method TEXT,
  calculation_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for quiz_results
CREATE UNIQUE INDEX idx_quiz_results_session_id ON quiz_results(session_id);
CREATE INDEX idx_quiz_results_quiz_id ON quiz_results(quiz_id);

-- ============================================================================
-- TABLE 7: orders
-- ============================================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  result_id UUID REFERENCES quiz_results(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT DEFAULT 'usd',
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  stripe_customer_id TEXT,
  customer_email TEXT,
  customer_name TEXT,
  payment_method_type TEXT,
  card_last4 TEXT,
  card_brand TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
);

-- Indexes for orders
CREATE UNIQUE INDEX idx_orders_order_number ON orders(order_number);
CREATE UNIQUE INDEX idx_orders_payment_intent ON orders(stripe_payment_intent_id);
CREATE INDEX idx_orders_session_id ON orders(session_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ============================================================================
-- TABLE 8: quiz_events
-- ============================================================================
CREATE TABLE quiz_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES quiz_sessions(id) ON DELETE SET NULL,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for quiz_events
CREATE INDEX idx_quiz_events_session_id ON quiz_events(session_id);
CREATE INDEX idx_quiz_events_quiz_id ON quiz_events(quiz_id);
CREATE INDEX idx_quiz_events_type ON quiz_events(event_type);
CREATE INDEX idx_quiz_events_created_at ON quiz_events(created_at);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Total tables created: 8
-- Total indexes created: 18
-- Total check constraints: 5
-- Total foreign key constraints: 11
