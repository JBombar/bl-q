-- ============================================================================
-- TEST QUIZ SEED DATA (FIXED)
-- Creates "stress-quiz" with 10 questions for testing
-- ============================================================================

-- Delete existing test quiz if present (cascades to questions and options)
DELETE FROM quizzes WHERE slug = 'stress-quiz';

-- Insert quiz and all related data in single transaction
WITH quiz_insert AS (
  INSERT INTO quizzes (slug, title, description, result_type, result_config, offer_mapping, status, version)
  VALUES (
    'stress-quiz',
    'Stress Assessment Quiz',
    'Discover your stress level and get personalized recommendations',
    'segment',
    '{
      "segments": [
        {"id": "low", "label": "Low Stress", "description": "Your stress levels are well-managed. You have good coping mechanisms.", "minScore": 0, "maxScore": 33},
        {"id": "medium", "label": "Moderate Stress", "description": "You have some stress to address. Consider implementing stress management techniques.", "minScore": 34, "maxScore": 66},
        {"id": "high", "label": "High Stress", "description": "Your stress levels need immediate attention. Professional support is recommended.", "minScore": 67, "maxScore": 100}
      ]
    }'::jsonb,
    '{
      "low": {"productId": "prod_relaxation", "productName": "Relaxation Guide", "description": "Basic stress relief techniques and mindfulness exercises", "priceCents": 1999, "currency": "usd"},
      "medium": {"productId": "prod_stress_management", "productName": "Stress Management Course", "description": "Comprehensive 4-week stress management program", "priceCents": 4999, "currency": "usd"},
      "high": {"productId": "prod_coaching", "productName": "Personal Coaching Session", "description": "One-on-one stress coaching with certified professional", "priceCents": 9999, "currency": "usd"}
    }'::jsonb,
    'active',
    1
  )
  RETURNING id
),

-- Question 1
q1 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_text, weight)
  SELECT id, 0, 'single_choice', 'How often do you feel overwhelmed by daily tasks?', 1.0
  FROM quiz_insert
  RETURNING id
),
q1_options AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'Rarely or never', 'rarely', 0 FROM q1
  UNION ALL
  SELECT id, 1, 'Occasionally', 'occasionally', 3.33 FROM q1
  UNION ALL
  SELECT id, 2, 'Frequently', 'frequently', 6.66 FROM q1
  UNION ALL
  SELECT id, 3, 'Almost always', 'always', 10 FROM q1
  RETURNING id
),

-- Question 2
q2 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_text, weight)
  SELECT id, 1, 'single_choice', 'How well do you sleep at night?', 1.0
  FROM quiz_insert
  RETURNING id
),
q2_options AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'Very well, I sleep soundly', 'well', 0 FROM q2
  UNION ALL
  SELECT id, 1, 'Fairly well, with occasional disruptions', 'fair', 3.33 FROM q2
  UNION ALL
  SELECT id, 2, 'Poorly, I often wake up', 'poor', 6.66 FROM q2
  UNION ALL
  SELECT id, 3, 'Very poorly, I struggle to sleep', 'very_poor', 10 FROM q2
  RETURNING id
),

-- Question 3
q3 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_text, weight)
  SELECT id, 2, 'single_choice', 'How frequently do you experience physical tension (headaches, muscle pain)?', 1.0
  FROM quiz_insert
  RETURNING id
),
q3_options AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'Rarely or never', 'rarely', 0 FROM q3
  UNION ALL
  SELECT id, 1, 'Once or twice a week', 'sometimes', 3.33 FROM q3
  UNION ALL
  SELECT id, 2, 'Several times a week', 'often', 6.66 FROM q3
  UNION ALL
  SELECT id, 3, 'Daily', 'daily', 10 FROM q3
  RETURNING id
),

-- Question 4
q4 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_text, weight)
  SELECT id, 3, 'single_choice', 'How do you handle unexpected changes or challenges?', 1.0
  FROM quiz_insert
  RETURNING id
),
q4_options AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'I adapt easily and stay calm', 'adapt_well', 0 FROM q4
  UNION ALL
  SELECT id, 1, 'I manage but feel some stress', 'manage', 3.33 FROM q4
  UNION ALL
  SELECT id, 2, 'I find it difficult and stressful', 'difficult', 6.66 FROM q4
  UNION ALL
  SELECT id, 3, 'I become very anxious and overwhelmed', 'overwhelmed', 10 FROM q4
  RETURNING id
),

-- Question 5
q5 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_text, weight)
  SELECT id, 4, 'single_choice', 'How often do you take breaks during work or daily activities?', 1.0
  FROM quiz_insert
  RETURNING id
),
q5_options AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'Regularly throughout the day', 'regular', 0 FROM q5
  UNION ALL
  SELECT id, 1, 'Occasionally when needed', 'occasional', 3.33 FROM q5
  UNION ALL
  SELECT id, 2, 'Rarely, I push through', 'rarely', 6.66 FROM q5
  UNION ALL
  SELECT id, 3, 'Never, I don''t have time', 'never', 10 FROM q5
  RETURNING id
),

-- Question 6
q6 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_text, weight)
  SELECT id, 5, 'single_choice', 'How would you rate your energy levels throughout the day?', 1.0
  FROM quiz_insert
  RETURNING id
),
q6_options AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'High energy all day', 'high', 0 FROM q6
  UNION ALL
  SELECT id, 1, 'Moderate, with some dips', 'moderate', 3.33 FROM q6
  UNION ALL
  SELECT id, 2, 'Low energy most of the time', 'low', 6.66 FROM q6
  UNION ALL
  SELECT id, 3, 'Exhausted constantly', 'exhausted', 10 FROM q6
  RETURNING id
),

-- Question 7
q7 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_text, weight)
  SELECT id, 6, 'single_choice', 'How easily can you focus and concentrate on tasks?', 1.0
  FROM quiz_insert
  RETURNING id
),
q7_options AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'Very easily, I stay focused', 'easy', 0 FROM q7
  UNION ALL
  SELECT id, 1, 'Fairly well, with minor distractions', 'fair', 3.33 FROM q7
  UNION ALL
  SELECT id, 2, 'With difficulty, I get distracted often', 'difficult', 6.66 FROM q7
  UNION ALL
  SELECT id, 3, 'Very difficult, I can''t concentrate', 'very_difficult', 10 FROM q7
  RETURNING id
),

-- Question 8
q8 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_text, weight)
  SELECT id, 7, 'single_choice', 'How often do you engage in relaxation or stress-relief activities?', 1.0
  FROM quiz_insert
  RETURNING id
),
q8_options AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'Daily or almost daily', 'daily', 0 FROM q8
  UNION ALL
  SELECT id, 1, 'A few times a week', 'weekly', 3.33 FROM q8
  UNION ALL
  SELECT id, 2, 'Once a week or less', 'rarely', 6.66 FROM q8
  UNION ALL
  SELECT id, 3, 'Never, I don''t make time', 'never', 10 FROM q8
  RETURNING id
),

-- Question 9
q9 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_text, weight)
  SELECT id, 8, 'single_choice', 'How satisfied are you with your work-life balance?', 1.0
  FROM quiz_insert
  RETURNING id
),
q9_options AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'Very satisfied, good balance', 'satisfied', 0 FROM q9
  UNION ALL
  SELECT id, 1, 'Somewhat satisfied, could be better', 'somewhat', 3.33 FROM q9
  UNION ALL
  SELECT id, 2, 'Dissatisfied, poor balance', 'dissatisfied', 6.66 FROM q9
  UNION ALL
  SELECT id, 3, 'Very dissatisfied, no balance', 'very_dissatisfied', 10 FROM q9
  RETURNING id
),

-- Question 10
q10 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_text, weight)
  SELECT id, 9, 'single_choice', 'How confident do you feel in managing stressful situations?', 1.0
  FROM quiz_insert
  RETURNING id
),
q10_options AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'Very confident', 'confident', 0 FROM q10
  UNION ALL
  SELECT id, 1, 'Somewhat confident', 'somewhat_confident', 3.33 FROM q10
  UNION ALL
  SELECT id, 2, 'Not very confident', 'not_confident', 6.66 FROM q10
  UNION ALL
  SELECT id, 3, 'Not confident at all', 'no_confidence', 10 FROM q10
  RETURNING id
)

-- Final SELECT to verify and return summary
SELECT
  'Test quiz created successfully' as status,
  (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = (SELECT id FROM quiz_insert)) as question_count,
  (SELECT COUNT(*) FROM quiz_options WHERE question_id IN (SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM quiz_insert))) as option_count;
