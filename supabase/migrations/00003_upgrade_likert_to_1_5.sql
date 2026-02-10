-- Migration: Upgrade Likert scale from 1-4 to 1-5
-- This migration:
-- 1. Updates the CHECK constraint to replace likert_1_4 with likert_1_5
-- 2. Converts all existing likert_1_4 questions to likert_1_5
-- 3. Adds a 5th option (score_value=4) to each Likert question
-- 4. Updates the High stress segment maxScore from 60 to 70

-- Step 1: Drop the old constraint
ALTER TABLE quiz_questions
  DROP CONSTRAINT IF EXISTS quiz_questions_question_type_check;

-- Step 2: Update existing likert_1_4 questions to likert_1_5
UPDATE quiz_questions
SET question_type = 'likert_1_5',
    updated_at = NOW()
WHERE question_type = 'likert_1_4';

-- Step 3: Add new constraint (likert_1_4 removed, likert_1_5 added)
ALTER TABLE quiz_questions
  ADD CONSTRAINT quiz_questions_question_type_check
  CHECK (question_type IN (
    'single_choice',
    'multiple_choice',
    'scale',
    'likert_1_5',
    'age_select',
    'info_trust',
    'education_insert',
    'validation_info'
  ));

-- Step 4: Insert 5th option for all likert_1_5 questions
INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
SELECT id, 4, '5', 'scale_5', 4
FROM quiz_questions
WHERE question_type = 'likert_1_5';

-- Step 5: Update High segment maxScore from 60 to 70
UPDATE quizzes
SET result_config = jsonb_set(
  result_config,
  '{segments,2,maxScore}',
  '70'
)
WHERE slug = 'stress-quiz';
