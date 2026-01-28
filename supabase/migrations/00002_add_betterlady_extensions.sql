-- ============================================================================
-- Migration: Add BetterLady quiz extensions
-- ============================================================================
-- This migration adds BetterLady-specific fields to quiz_questions table
-- and updates the question_type enum to include new types

-- Add new question types to the CHECK constraint
ALTER TABLE quiz_questions DROP CONSTRAINT IF EXISTS quiz_questions_question_type_check;
ALTER TABLE quiz_questions ADD CONSTRAINT quiz_questions_question_type_check
  CHECK (question_type IN (
    'single_choice',
    'multiple_choice',
    'scale',
    'likert_1_4',
    'age_select',
    'info_trust',
    'education_insert',
    'validation_info'
  ));

-- Add BetterLady-specific columns
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS question_key TEXT;
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS section_label TEXT;
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS scale_left_label TEXT;
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS scale_right_label TEXT;
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS helper_text TEXT;

-- Add index for question_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_quiz_questions_question_key ON quiz_questions(question_key);
