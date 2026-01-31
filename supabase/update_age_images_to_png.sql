-- Update age gate images from WebP to PNG (higher quality)
UPDATE quiz_options
SET image_url = '/quiz-assets/age/age1.png'
WHERE image_url = '/quiz-assets/age/age1.webp';

UPDATE quiz_options
SET image_url = '/quiz-assets/age/age2.png'
WHERE image_url = '/quiz-assets/age/age2.webp';

UPDATE quiz_options
SET image_url = '/quiz-assets/age/age3.png'
WHERE image_url = '/quiz-assets/age/age3.webp';

UPDATE quiz_options
SET image_url = '/quiz-assets/age/age4.png'
WHERE image_url = '/quiz-assets/age/age4.webp';

-- Update trust screen image from WebP to PNG (higher quality)
UPDATE quiz_questions
SET image_url = '/quiz-assets/trust/trust_image.png'
WHERE image_url = '/quiz-assets/trust/trust_image.webp';
