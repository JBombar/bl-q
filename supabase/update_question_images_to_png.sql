-- Update question images from WebP to PNG
-- Q03: Woman with stomach issue
UPDATE quiz_questions
SET image_url = '/quiz-assets/questions/q3_woman.png'
WHERE image_url = '/quiz-assets/questions/q3_woman.webp';

-- Q04: Woman thinking about stress
UPDATE quiz_questions
SET image_url = '/quiz-assets/questions/q4_woman.png'
WHERE image_url = '/quiz-assets/questions/q4_woman.webp';

-- Q11: Woman with concentration issues
UPDATE quiz_questions
SET image_url = '/quiz-assets/questions/q11_woman.png'
WHERE image_url = '/quiz-assets/questions/q11_woman.webp';

-- Verify the updates
SELECT question_key, question_text, image_url
FROM quiz_questions
WHERE image_url LIKE '/quiz-assets/questions/%'
ORDER BY order_index;
