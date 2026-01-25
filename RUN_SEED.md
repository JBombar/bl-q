# How to Seed the BetterLady Quiz

Due to the size of the seed script (36 screens, 150+ options), execute it via Supabase SQL Editor:

## Option 1: Via Supabase Dashboard (RECOMMENDED)

1. Go to: https://supabase.com/dashboard/project/nsvezpwooztjxnmxjtpw/sql/new
2. Open file: `supabase/seed_betterlady_quiz.sql`
3. Copy the ENTIRE contents
4. Paste into SQL Editor
5. Click "Run"
6. Verify success message: "BetterLady quiz seeded successfully"

## Option 2: Via Supabase CLI

```bash
# Set your database password as environment variable
set SUPABASE_DB_PASSWORD=your_password_here

# Run the seed
supabase db execute -f supabase/seed_betterlady_quiz.sql --project-ref nsvezpwooztjxnmxjtpw
```

## Verification

After seeding, verify:

```sql
-- Should return 36 screens
SELECT COUNT(*) FROM quiz_questions WHERE quiz_id IN (SELECT id FROM quizzes WHERE slug = 'stress-quiz');

-- Should return ~150 options
SELECT COUNT(*) FROM quiz_options WHERE question_id IN (
  SELECT id FROM quiz_questions WHERE quiz_id IN (SELECT id FROM quizzes WHERE slug = 'stress-quiz')
);
```

Expected:
- 36 quiz_questions (screens)
- ~150 quiz_options

## Next Steps

After seeding, proceed to frontend implementation (Phase 2).
