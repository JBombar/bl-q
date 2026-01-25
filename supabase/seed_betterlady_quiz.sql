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

-- Screen 16: Q13
q13 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, section_label, question_text)
  SELECT id, 16, 'single_choice', 'q13', 'Tělesné signály', 'Je pro tebe těžké si odpočinout nebo se uvolnit?'
  FROM quiz_insert
  RETURNING id
),
q13_opts AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'Téměř vždy', 'almost_always', 3 FROM q13
  UNION ALL SELECT id, 1, 'Někdy', 'sometimes', 2 FROM q13
  UNION ALL SELECT id, 2, 'Téměř nikdy', 'almost_never', 0 FROM q13
  RETURNING id
),

-- Screen 17: E03 (educational insert)
e03 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, question_text, question_subtext)
  SELECT id, 17, 'education_insert', 'e03',
    'Tvá únava nebo prokrastinace mají svůj důvod — A není to lenost',
    'Ať už se snažíš vyčerpaná, nebo jsi často bojuješ s motivací, tvůj nervový systém se ti snaží něco říct. To, co často vnímáme jako únavu, není vždy jen nedostatek spánku — často je to hlas tvého těla, který se unaví chránit tvé zbylývající zdroje před vnitřním napětím. Pokud se v těchto chvílích nutíš k větší produktivitě silou vůle, jen tím zvyšuješ tlak na svůj systém. Více je jako svíčka — po čase se unaví a prostě přestane fungovat. Skutečná únava nemusí znamenat slabou disciplínu, ale stresu vytvářený pocit vnitřního bezpečí a zklidnění tvého nervového systému.'
  FROM quiz_insert
  RETURNING id
),

-- ============================================================================
-- SECTION: Mentální vzorce (Questions 18-26)
-- ============================================================================

-- Screen 18: Q14 (likert)
q14 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, section_label, question_text, question_subtext, scale_left_label, scale_right_label)
  SELECT id, 18, 'likert_1_4', 'q14', 'Mentální vzorce', 'Souhlasíš s následujícím tvrzením?', '„Je pro mě těžké vyjadřovat své emoce."', 'Rozhodně nesouhlasím', 'Rozhodně souhlasím'
  FROM quiz_insert
  RETURNING id
),
q14_opts AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, '1', 'scale_1', 0 FROM q14
  UNION ALL SELECT id, 1, '2', 'scale_2', 1 FROM q14
  UNION ALL SELECT id, 2, '3', 'scale_3', 2 FROM q14
  UNION ALL SELECT id, 3, '4', 'scale_4', 3 FROM q14
  RETURNING id
),

-- Screen 19: Q15 (likert)
q15 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, section_label, question_text, question_subtext, scale_left_label, scale_right_label)
  SELECT id, 19, 'likert_1_4', 'q15', 'Mentální vzorce', 'Souhlasíš s následujícím tvrzením?', '„Cítím se zahlcená množstvím úkolů, které musím zvládnout."', 'Rozhodně nesouhlasím', 'Rozhodně souhlasím'
  FROM quiz_insert
  RETURNING id
),
q15_opts AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, '1', 'scale_1', 0 FROM q15
  UNION ALL SELECT id, 1, '2', 'scale_2', 1 FROM q15
  UNION ALL SELECT id, 2, '3', 'scale_3', 2 FROM q15
  UNION ALL SELECT id, 3, '4', 'scale_4', 3 FROM q15
  RETURNING id
),

-- Screen 20: Q16 (likert)
q16 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, section_label, question_text, question_subtext, scale_left_label, scale_right_label)
  SELECT id, 20, 'likert_1_4', 'q16', 'Mentální vzorce', 'Souhlasíš s následujícím tvrzením?', '„Bývá pro mě těžké udělat těžké rozhodnutí."', 'Rozhodně nesouhlasím', 'Rozhodně souhlasím'
  FROM quiz_insert
  RETURNING id
),
q16_opts AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, '1', 'scale_1', 0 FROM q16
  UNION ALL SELECT id, 1, '2', 'scale_2', 1 FROM q16
  UNION ALL SELECT id, 2, '3', 'scale_3', 2 FROM q16
  UNION ALL SELECT id, 3, '4', 'scale_4', 3 FROM q16
  RETURNING id
),

-- Screen 21: Q17 (likert)
q17 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, section_label, question_text, question_subtext, scale_left_label, scale_right_label)
  SELECT id, 21, 'likert_1_4', 'q17', 'Mentální vzorce', 'Souhlasíš s následujícím tvrzením?', '„Odskládám své ambice na stránku, že udělám chybu nebo selžu."', 'Rozhodně nesouhlasím', 'Rozhodně souhlasím'
  FROM quiz_insert
  RETURNING id
),
q17_opts AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, '1', 'scale_1', 0 FROM q17
  UNION ALL SELECT id, 1, '2', 'scale_2', 1 FROM q17
  UNION ALL SELECT id, 2, '3', 'scale_3', 2 FROM q17
  UNION ALL SELECT id, 3, '4', 'scale_4', 3 FROM q17
  RETURNING id
),

-- Screen 22: E04 (educational insert)
e04 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, question_text, question_subtext)
  SELECT id, 22, 'education_insert', 'e04',
    'Proč tvůj systém volí „bezpečí" místo tvého růstu a ambicí',
    'Pokud je tvůj vnitřní systém přetížený chronickým stresem, automaticky vypíná „podnikatelské" funkce jako je kreativita, odvaha riskovat, nebo schopnost dělat rychlá rozhodnutí. Naučit se, jak vědomě zklidnit svůj nervový systém a převzít kontrolu nad stresem, je tím prvním a nejdůležitějším krokem k tomu, aby získala zpět svou jasnou mysl, nevyčerpatelnou energii a schopnost jít si nekompromisně za svými sny.'
  FROM quiz_insert
  RETURNING id
),

-- Screen 23: Q18
q18 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, section_label, question_text)
  SELECT id, 23, 'single_choice', 'q18', 'Mentální vzorce', 'Máš potíže s přijímáním komplimentů?'
  FROM quiz_insert
  RETURNING id
),
q18_opts AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'Téměř vždy', 'almost_always', 3 FROM q18
  UNION ALL SELECT id, 1, 'Záleží na situaci', 'depends', 2 FROM q18
  UNION ALL SELECT id, 2, 'Vůbec ne', 'not_at_all', 0 FROM q18
  RETURNING id
),

-- Screen 24: Q19 (likert)
q19 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, section_label, question_text, question_subtext, scale_left_label, scale_right_label)
  SELECT id, 24, 'likert_1_4', 'q19', 'Mentální vzorce', 'Souhlasíš s následujícím tvrzením?', '„Při rozhovoru s novými lidmi se cítím nervózní."', 'Rozhodně nesouhlasím', 'Rozhodně souhlasím'
  FROM quiz_insert
  RETURNING id
),
q19_opts AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, '1', 'scale_1', 0 FROM q19
  UNION ALL SELECT id, 1, '2', 'scale_2', 1 FROM q19
  UNION ALL SELECT id, 2, '3', 'scale_3', 2 FROM q19
  UNION ALL SELECT id, 3, '4', 'scale_4', 3 FROM q19
  RETURNING id
),

-- Screen 25: Q20 (likert) - using placeholder statement
q20 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, section_label, question_text, question_subtext, scale_left_label, scale_right_label)
  SELECT id, 25, 'likert_1_4', 'q20', 'Mentální vzorce', 'Souhlasíš s následujícím tvrzením?', '„Upřednostňuji potřeby ostatních na úkor svých vlastních."', 'Rozhodně nesouhlasím', 'Rozhodně souhlasím'
  FROM quiz_insert
  RETURNING id
),
q20_opts AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, '1', 'scale_1', 0 FROM q20
  UNION ALL SELECT id, 1, '2', 'scale_2', 1 FROM q20
  UNION ALL SELECT id, 2, '3', 'scale_3', 2 FROM q20
  UNION ALL SELECT id, 3, '4', 'scale_4', 3 FROM q20
  RETURNING id
),

-- Screen 26: E05 (educational insert - first occurrence)
e05 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, question_text, question_subtext)
  SELECT id, 26, 'education_insert', 'e05',
    'Skutečné vysvobození z vězení stresu',
    'Většina běžných metod se snaží jen umíčat symptomy. Užívání pilulek je jako vypnout požární alarm, zatímco dům stále hoří. Terapie mluví k tvé mysli, ale stres je fyzicky zapsaný hluboko v tvém nervovém systému. Pokud nezaashneš přímo tam, vnitřní napětí se bude neustále vracet. Skutečná úleva přichází ve chvíli, kdy využiješ metodu vnitřního klidu. Ta nemaskuje problémy, ale přirozeně přepne tvůj biologický systém z neustálého napětí do klidu, síly a kontroly.'
  FROM quiz_insert
  RETURNING id
),

-- ============================================================================
-- SECTION: Reálný dopad (Questions 27-28)
-- ============================================================================

-- Screen 27: Q21
q21 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, section_label, question_text)
  SELECT id, 27, 'single_choice', 'q21', 'Reálný dopad', 'Co obvykle děláš jako první věc hned po probuzení?'
  FROM quiz_insert
  RETURNING id
),
q21_opts AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'Vezmu do ruky telefon', 'phone', 1 FROM q21
  UNION ALL SELECT id, 1, 'Jdu si uvařit kávu', 'coffee', 1 FROM q21
  UNION ALL SELECT id, 2, 'Hygiena a sprcha', 'hygiene', 0 FROM q21
  UNION ALL SELECT id, 3, 'Něco jiného', 'other', 1 FROM q21
  RETURNING id
),

-- Screen 28: Q22
q22 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, section_label, question_text)
  SELECT id, 28, 'single_choice', 'q22', 'Reálný dopad', 'Kolik času týdně věnuješ fyzické aktivitě?'
  FROM quiz_insert
  RETURNING id
),
q22_opts AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, '0–2 hodiny', 'low', 2 FROM q22
  UNION ALL SELECT id, 1, '3–5 hodin', 'medium', 1 FROM q22
  UNION ALL SELECT id, 2, '6–8 hodin', 'high', 0 FROM q22
  UNION ALL SELECT id, 3, 'Více než 8 hodin', 'very_high', 0 FROM q22
  RETURNING id
),

-- ============================================================================
-- SECTION: Psychický stav - final preferences (Questions 29-35)
-- ============================================================================

-- Screen 29: Q23 (multi-choice)
q23 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, section_label, question_text, helper_text)
  SELECT id, 29, 'multiple_choice', 'q23', 'Psychický stav', 'Na jaké oblasti tvé duševní pohody bys chtěla zapracovat?', 'Vyber vše, co sedí'
  FROM quiz_insert
  RETURNING id
),
q23_opts AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'Málo energie', 'low_energy', 1 FROM q23
  UNION ALL SELECT id, 1, 'Neustálé obavy', 'constant_worries', 1 FROM q23
  UNION ALL SELECT id, 2, 'Citové vyčerpání', 'emotional_exhaustion', 1 FROM q23
  UNION ALL SELECT id, 3, 'Plná hlava', 'overthinking', 1 FROM q23
  UNION ALL SELECT id, 4, 'Podrážděnost', 'irritability', 1 FROM q23
  UNION ALL SELECT id, 5, 'Cítím se naprosto v pořádku', 'feel_fine', 0 FROM q23
  RETURNING id
),

-- Screen 30: Q24 (multi-choice) - first option unclear, using placeholder
q24 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, section_label, question_text, helper_text)
  SELECT id, 30, 'multiple_choice', 'q24', 'Psychický stav', 'Co obvykle děláš, když je ti těžko?', 'Vyber vše, co sedí'
  FROM quiz_insert
  RETURNING id
),
q24_opts AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'Chronické napětí', 'chronic_tension', 1 FROM q24
  UNION ALL SELECT id, 1, 'Sebepochyby', 'self_doubt', 1 FROM q24
  UNION ALL SELECT id, 2, 'Sociální sítě', 'social_media', 1 FROM q24
  UNION ALL SELECT id, 3, 'Chuť na sladké nebo fast food', 'cravings', 1 FROM q24
  UNION ALL SELECT id, 4, 'Nedostatek spánku', 'lack_sleep', 1 FROM q24
  UNION ALL SELECT id, 5, 'Kousání nehtů', 'nail_biting', 1 FROM q24
  UNION ALL SELECT id, 6, 'Sledování seriálů jeden za druhým', 'binge_watching', 1 FROM q24
  UNION ALL SELECT id, 7, 'Kouření', 'smoking', 1 FROM q24
  RETURNING id
),

-- Screen 31: Q25 (multi-choice)
q25 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, section_label, question_text, helper_text)
  SELECT id, 31, 'multiple_choice', 'q25', 'Psychický stav', 'Je něco, co bys chtěla na svém spánku zlepšit?', 'Vyber vše, co sedí'
  FROM quiz_insert
  RETURNING id
),
q25_opts AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'Probouzím se unavená', 'wake_tired', 1 FROM q25
  UNION ALL SELECT id, 1, 'Během noci se budím', 'wake_night', 1 FROM q25
  UNION ALL SELECT id, 2, 'Celkově špatná kvalita spánku', 'poor_quality', 1 FROM q25
  UNION ALL SELECT id, 3, 'Problémy s usínáním', 'trouble_falling_asleep', 1 FROM q25
  UNION ALL SELECT id, 4, 'Budím se dřív, než chci', 'wake_early', 1 FROM q25
  UNION ALL SELECT id, 5, 'Spím dobře', 'sleep_well', 0 FROM q25
  RETURNING id
),

-- Screen 32: Q26 (multi-choice)
q26 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, section_label, question_text, helper_text)
  SELECT id, 32, 'multiple_choice', 'q26', 'Psychický stav', 'Co bys ve svém životě nejvíc potřebovala zlepšit, abys byla šťastnější?', 'Vyber vše, co sedí'
  FROM quiz_insert
  RETURNING id
),
q26_opts AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'Vnitřní klid', 'inner_peace', 1 FROM q26
  UNION ALL SELECT id, 1, 'Soustředění a produktivitu', 'focus_productivity', 1 FROM q26
  UNION ALL SELECT id, 2, 'Množství energie', 'energy_levels', 1 FROM q26
  UNION ALL SELECT id, 3, 'Vnitřní sílu', 'inner_strength', 1 FROM q26
  UNION ALL SELECT id, 4, 'Něco jiného', 'something_else', 1 FROM q26
  RETURNING id
),

-- Screen 33: Q27 (multi-choice)
q27 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, section_label, question_text, helper_text)
  SELECT id, 33, 'multiple_choice', 'q27', 'Psychický stav', 'Na čem bys chtěla začít pracovat v rámci svého osobního plánu?', 'Vyber vše, co sedí'
  FROM quiz_insert
  RETURNING id
),
q27_opts AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'Přestat o sobě pochybovat', 'stop_doubting', 1 FROM q27
  UNION ALL SELECT id, 1, 'Budovat citovou odolnost', 'emotional_resilience', 1 FROM q27
  UNION ALL SELECT id, 2, 'Stanovit a dosáhnout své cíle', 'achieve_goals', 1 FROM q27
  UNION ALL SELECT id, 3, 'Přestat se utápět v myšlenkách', 'stop_overthinking', 1 FROM q27
  UNION ALL SELECT id, 4, 'Zlepšit svou schopnost obhajovat ostatním', 'stand_up', 1 FROM q27
  UNION ALL SELECT id, 5, 'Zlepšit svou každodenní rutinu', 'improve_routine', 1 FROM q27
  UNION ALL SELECT id, 6, 'Mít život bez stresu', 'stress_free_life', 1 FROM q27
  RETURNING id
),

-- Screen 34: Q28 (placeholder - not specified in seed)
q28 AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, section_label, question_text)
  SELECT id, 34, 'single_choice', 'q28', 'Psychický stav', 'Jak moc jsi připravená začít pracovat na svém stresu?'
  FROM quiz_insert
  RETURNING id
),
q28_opts AS (
  INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
  SELECT id, 0, 'Velmi připravená', 'very_ready', 0 FROM q28
  UNION ALL SELECT id, 1, 'Připravená', 'ready', 0 FROM q28
  UNION ALL SELECT id, 2, 'Možná', 'maybe', 0 FROM q28
  UNION ALL SELECT id, 3, 'Ještě nevím', 'not_sure', 0 FROM q28
  RETURNING id
),

-- Screen 35: E05_SCIENCE (validation screen)
e05_science AS (
  INSERT INTO quiz_questions (quiz_id, order_index, question_type, question_key, question_text, question_subtext, image_url)
  SELECT id, 35, 'validation_info', 'e05_science',
    'Projekt Better Lady byl vyvinut na základě vědeckých postupů',
    'Tvá cesta k lepšímu já se opírá o desítky let vědeckého výzkumu',
    '/quiz-assets/inserts/e5_logos.webp'
  FROM quiz_insert
  RETURNING id
)

-- Final verification query
SELECT
  'BetterLady quiz seeded successfully' as status,
  (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = (SELECT id FROM quiz_insert)) as total_screens,
  (SELECT COUNT(*) FROM quiz_options WHERE question_id IN (SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM quiz_insert))) as total_options;
