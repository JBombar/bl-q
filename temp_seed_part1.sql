-- ============================================================================
-- BETTERLADY STRESS QUIZ SEED DATA
-- Language: Czech
-- Total screens: 36 (2 special + 28 questions + 5 inserts + 1 validation)
-- ============================================================================

-- Insert quiz record
WITH quiz_insert AS (
  INSERT INTO quizzes (
    slug,
    title,
    description,
    result_type,
    result_config,
    offer_mapping,
    status,
    version,
    config
  ) VALUES (
    'stress-quiz',
    'Test stresu Better Lady',
    'Je tvůj nervový systém přehlcený? Zjisti to pomocí našeho testu.',
    'segment',
    '{
      "segments": [
        {"id": "low", "label": "Nízký stres (0-20)", "description": "Tvůj stres je pod kontrolou.", "minScore": 0, "maxScore": 20},
        {"id": "medium", "label": "Střední stres (21-40)", "description": "Máš mírné známky stresu.", "minScore": 21, "maxScore": 40},
        {"id": "high", "label": "Vysoký stres (41-60)", "description": "Tvůj stres potřebuje pozornost.", "minScore": 41, "maxScore": 60}
      ]
    }'::jsonb,
    '{
      "low": {"productId": "prod_low_stress", "productName": "Základní program", "description": "Základní techniky pro udržení klidu", "priceCents": 1990, "currency": "czk"},
      "medium": {"productId": "prod_medium_stress", "productName": "Pokročilý program", "description": "Komplexní řešení pro snížení stresu", "priceCents": 3990, "currency": "czk"},
      "high": {"productId": "prod_high_stress", "productName": "Prémiový program", "description": "Intenzivní program pro vysoký stres", "priceCents": 5990, "currency": "czk"}
    }'::jsonb,
    'active',
    1,
    '{}'::jsonb
  )
  RETURNING id
),

-- ============================================================================
-- SPECIAL SCREENS
-- ============================================================================

-- Screen 0: Age gate
screen_age AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, question_text, question_subtext, section_label)
  SELECT id, 0, 'age_select', 'age_gate', 'Je tvůj nervový systém přehlcený?', 'Vyber svůj věk a začni', NULL
  FROM quiz_insert
  RETURNING id
),
age_options AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value, image_url)
  SELECT id, 0, 'Věk: 18–29', 'age_18_29', 0, '/quiz-assets/age/age1.webp' FROM screen_age
  UNION ALL SELECT id, 1, 'Věk: 30–39', 'age_30_39', 0, '/quiz-assets/age/age2.webp' FROM screen_age
  UNION ALL SELECT id, 2, 'Věk: 40–49', 'age_40_49', 0, '/quiz-assets/age/age3.webp' FROM screen_age
  UNION ALL SELECT id, 3, 'Věk: 50+', 'age_50_plus', 0, '/quiz-assets/age/age4.webp' FROM screen_age
  RETURNING id
),

-- Screen 1: Trust
screen_trust AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, question_text, question_subtext, image_url)
  SELECT id, 1, 'info_trust', 'trust', 'Více než 8500 žen', 'důvěřuje Better Lady', '/quiz-assets/trust/trust_image.webp'
  FROM quiz_insert
  RETURNING id
),

-- ============================================================================
-- SECTION: Osobní profil (Questions 2-5)
-- ============================================================================

-- Screen 2: Q01
q01 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, section_label, question_text)
  SELECT id, 2, 'single_choice', 'q01', 'Osobní profil', 'Jak často se cítíš ve stresu nebo nervózní?'
  FROM quiz_insert
  RETURNING id
),
q01_opts AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'Nikdy', 'never', 0 FROM q01
  UNION ALL SELECT id, 1, 'Málokdy', 'rarely', 1 FROM q01
  UNION ALL SELECT id, 2, 'Často', 'often', 2 FROM q01
  UNION ALL SELECT id, 3, 'Pořád', 'always', 3 FROM q01
  RETURNING id
),

-- Screen 3: Q02
q02 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, section_label, question_text)
  SELECT id, 3, 'single_choice', 'q02', 'Osobní profil', 'Co tě obvykle nejvíc stresuje?'
  FROM quiz_insert
  RETURNING id
),
q02_opts AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'Peníze', 'money', 1 FROM q02
  UNION ALL SELECT id, 1, 'Vztahy', 'relationships', 1 FROM q02
  UNION ALL SELECT id, 2, 'Můj vzhled', 'appearance', 1 FROM q02
  UNION ALL SELECT id, 3, 'Zdraví', 'health', 1 FROM q02
  UNION ALL SELECT id, 4, 'Práce', 'work', 1 FROM q02
  UNION ALL SELECT id, 5, 'Rodinné povinnosti', 'family', 1 FROM q02
  RETURNING id
),

-- Screen 4: Q03 (with image)
q03 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, section_label, question_text, image_url)
  SELECT id, 4, 'single_choice', 'q03', 'Osobní profil', 'Cítíš, že se ti při strachu nebo špatné zprávě svírá žaludek?', '/quiz-assets/questions/q3_woman.webp'
  FROM quiz_insert
  RETURNING id
),
q03_opts AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'Nikdy', 'never', 0 FROM q03
  UNION ALL SELECT id, 1, 'Málokdy', 'rarely', 1 FROM q03
  UNION ALL SELECT id, 2, 'Často', 'often', 2 FROM q03
  UNION ALL SELECT id, 3, 'Nevím', 'unknown', 1 FROM q03
  RETURNING id
),

-- Screen 5: Q04 (likert scale with image)
q04 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, section_label, question_text, question_subtext, scale_left_label, scale_right_label, image_url)
  SELECT id, 5, 'likert_1_4', 'q04', 'Osobní profil', 'Souhlasíš s následujícím tvrzením?', '„Mám pocit, že stres mi brání v dosažení mého skutečného potenciálu."', 'Rozhodně nesouhlasím', 'Rozhodně souhlasím', '/quiz-assets/questions/q4_woman.webp'
  FROM quiz_insert
  RETURNING id
),
q04_opts AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, '1', 'scale_1', 0 FROM q04
  UNION ALL SELECT id, 1, '2', 'scale_2', 1 FROM q04
  UNION ALL SELECT id, 2, '3', 'scale_3', 2 FROM q04
  UNION ALL SELECT id, 3, '4', 'scale_4', 3 FROM q04
  RETURNING id
),

-- Screen 6: E01 (educational insert)
e01 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, question_text, question_subtext)
  SELECT id, 6, 'education_insert', 'e01',
    'Cesta k vnitřnímu klidu začíná pochopením, že tvé tělo pracuje pro tebe',
    'Většina žen si myslí, že jejich stres je způsoben nedostatkem peněz na účtu nebo nedostatkem disciplíny v plánování. Pravdou je, že tvůj mozek funguje v režimu přežití. Stres je v našem životě pořád — nemůžeš zastavit déšť, aby tvé napadalo, ale můžeš si vzít „deštník", abys nezmokla. V tomto stavu tvé tělo neustále hledá hrozbu, i když jsi v bezpečí doma. Není to tvá chyba. Je to biologická reakce, kterou nelze „přemýšlet". Musím ji „přeprogramovat" pomocí nástrojů, které mluví přímo k tvému nervovému systému.'
  FROM quiz_insert
  RETURNING id
),

-- ============================================================================
-- SECTION: Psychický stav (Questions 7-11)
-- ============================================================================

-- Screen 7: Q05
q05 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, section_label, question_text)
  SELECT id, 7, 'single_choice', 'q05', 'Psychický stav', 'Které období pro tebe bylo v životě nejtěžší?'
  FROM quiz_insert
  RETURNING id
),
q05_opts AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'To současné', 'current', 3 FROM q05
  UNION ALL SELECT id, 1, 'Posledních pár let', 'recent_years', 2 FROM q05
  UNION ALL SELECT id, 2, 'Většina mého života', 'most_life', 3 FROM q05
  UNION ALL SELECT id, 3, 'Moje dětství', 'childhood', 2 FROM q05
  UNION ALL SELECT id, 4, 'Střídá se to', 'varies', 2 FROM q05
  UNION ALL SELECT id, 5, 'Cítím se dobře', 'feel_good', 0 FROM q05
  RETURNING id
),

-- Screen 8: Q06 (multi-choice)
q06 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, section_label, question_text, helper_text)
  SELECT id, 8, 'multiple_choice', 'q06', 'Psychický stav', 'Co obvykle děláš, když je ti těžko?', 'Vyber vše, co sedí'
  FROM quiz_insert
  RETURNING id
),
q06_opts AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'Snažím se být pořád něčím zaměstnaná', 'stay_busy', 1 FROM q06
  UNION ALL SELECT id, 1, 'Uzavřu se do sebe a na chvíli zmizím', 'withdraw', 1 FROM q06
  UNION ALL SELECT id, 2, 'Bývám náladová nebo vyjíždím na lidi', 'moody', 1 FROM q06
  UNION ALL SELECT id, 3, 'Místo sebe se raději soustředím na pomoc ostatním', 'help_others', 1 FROM q06
  UNION ALL SELECT id, 4, 'Snažím se přijít na to, co se ve mně vlastně děje', 'self_reflect', 0 FROM q06
  UNION ALL SELECT id, 5, 'Nic z výše uvedeného', 'none', 0 FROM q06
  RETURNING id
),

-- Screen 9: Q07
q07 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, section_label, question_text)
  SELECT id, 9, 'single_choice', 'q07', 'Psychický stav', 'Jak často míváš výkyvy nálad?'
  FROM quiz_insert
  RETURNING id
),
q07_opts AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'Nikdy', 'never', 0 FROM q07
  UNION ALL SELECT id, 1, 'Málokdy', 'rarely', 1 FROM q07
  UNION ALL SELECT id, 2, 'Často', 'often', 2 FROM q07
  UNION ALL SELECT id, 3, 'Pořád', 'always', 3 FROM q07
  RETURNING id
),

-- Screen 10: Q08
q08 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, section_label, question_text)
  SELECT id, 10, 'single_choice', 'q08', 'Psychický stav', 'Máš v sobě potlačené negativní emoce?'
  FROM quiz_insert
  RETURNING id
),
q08_opts AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'Ano, hodně', 'yes_lot', 3 FROM q08
  UNION ALL SELECT id, 1, 'Ano, někdy', 'yes_sometimes', 2 FROM q08
  UNION ALL SELECT id, 2, 'Ani ne', 'not_really', 0 FROM q08
  RETURNING id
),

-- Screen 11: Q09
q09 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, section_label, question_text)
  SELECT id, 11, 'single_choice', 'q09', 'Psychický stav', 'Kdy jsi se naposledy cítila bez stresu?'
  FROM quiz_insert
  RETURNING id
),
q09_opts AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'Během posledního týdne', 'last_week', 0 FROM q09
  UNION ALL SELECT id, 1, 'Během posledního měsíce', 'last_month', 1 FROM q09
  UNION ALL SELECT id, 2, 'Před necelým rokem', 'last_year', 2 FROM q09
  UNION ALL SELECT id, 3, 'Před více než dvěma lety', 'two_years_ago', 3 FROM q09
  UNION ALL SELECT id, 4, 'Už si ani nepamatuju', 'cant_remember', 3 FROM q09
  RETURNING id
),

-- Screen 12: E02 (educational insert)
e02 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, question_text, question_subtext)
  SELECT id, 12, 'education_insert', 'e02',
    'Tvé tělo si pamatuje víc — ale ty ho můžeš naučit cítit větší lehkost',
    'Období, která jsi označila jako nejtěžší, nezmizelo jen tak v čase. Tvůj nervový systém si z nich vytvořil „mapu" přežití. Je to biologický bezpečnostní protokol tvého těla, který tě chrání před dalším přetížením. Tato „stará zátěž" v tobě zanechala hluboký otisk, který tě drží v trvalé pohotovosti i když už nebezpečí pominulo. Skutečné řešení není v neustálém rozebírání minulosti, ale v uvolnění tohoto napětí přímo z tvé fyziologie.'
  FROM quiz_insert
  RETURNING id
),

-- ============================================================================
-- SECTION: Tělesné signály (Questions 13-16)
-- ============================================================================

-- Screen 13: Q10
q10 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, section_label, question_text)
  SELECT id, 13, 'single_choice', 'q10', 'Tělesné signály', 'Jak často se cítíš unavená nebo bez energie?'
  FROM quiz_insert
  RETURNING id
),
q10_opts AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'Nikdy', 'never', 0 FROM q10
  UNION ALL SELECT id, 1, 'Málokdy', 'rarely', 1 FROM q10
  UNION ALL SELECT id, 2, 'Často', 'often', 2 FROM q10
  UNION ALL SELECT id, 3, 'Pořád', 'always', 3 FROM q10
  RETURNING id
),

-- Screen 14: Q11 (with image)
q11 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, section_label, question_text, image_url)
  SELECT id, 14, 'single_choice', 'q11', 'Tělesné signály', 'Bývá pro tebe těžké se soustředit nebo si udržet jasnou mysl?', '/quiz-assets/questions/q11_woman.webp'
  FROM quiz_insert
  RETURNING id
),
q11_opts AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'Většinou se soustředím dobře', 'good', 0 FROM q11
  UNION ALL SELECT id, 1, 'Jen když jsem hodně unavená', 'when_tired', 1 FROM q11
  UNION ALL SELECT id, 2, 'Ano, stále se mi to čím dál častěji', 'increasingly', 2 FROM q11
  UNION ALL SELECT id, 3, 'Bojuju s tím každý den', 'daily_struggle', 3 FROM q11
  RETURNING id
),

-- Screen 15: Q12
q12 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, section_label, question_text)
  SELECT id, 15, 'single_choice', 'q12', 'Tělesné signály', 'Necháváš věci na poslední chvíli?'
  FROM quiz_insert
  RETURNING id
),
q12_opts AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'Nikdy', 'never', 0 FROM q12
  UNION ALL SELECT id, 1, 'Málokdy', 'rarely', 1 FROM q12
  UNION ALL SELECT id, 2, 'Často', 'often', 2 FROM q12
  UNION ALL SELECT id, 3, 'Pořád', 'always', 3 FROM q12
  RETURNING id
),

