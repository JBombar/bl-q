# Likert Scale Upgrade Proposal: 1-4 to 1-5

**Date:** 2026-02-09
**Status:** Awaiting Review
**Scope:** Database, Scoring Algorithm, Frontend Component, Seed Data

---

## Executive Summary

This proposal details a full-stack plan to upgrade all Likert scale questions from a 4-point scale (`likert_1_4`, scores 0-3) to a 5-point scale (`likert_1_5`, scores 0-4). The investigation reveals a **critical hardcoded constant** in the scoring algorithm that will produce incorrect normalized scores if not addressed. This document provides the exact blueprint for a safe migration.

---

## Part A: Full-Stack Codebase and Database Analysis

### A1. Database Schema (`quiz_questions` & `quiz_options`)

**Live CHECK Constraint** (verified via Supabase MCP):

```sql
-- Constraint name: quiz_questions_question_type_check
CHECK ((question_type = ANY (ARRAY[
  'single_choice'::text,
  'multiple_choice'::text,
  'scale'::text,
  'likert_1_4'::text,
  'age_select'::text,
  'info_trust'::text,
  'education_insert'::text,
  'validation_info'::text
])))
```

**Finding:** The value `'likert_1_5'` is **not permitted** by this constraint. Any `UPDATE` to change a question's type to `likert_1_5` will fail until the constraint is altered.

**Constraint Origin:** `supabase/migrations/00002_add_betterlady_extensions.sql`, lines 7-19.

---

**Current Likert Option Score Assignment** (verified via live DB query):

| Question | Options | score_value mapping |
|----------|---------|-------------------|
| q04 | 4 options | 0, 1, 2, 3 |
| q14 | 4 options | 0, 1, 2, 3 |
| q15 | 4 options | 0, 1, 2, 3 |
| q16 | 4 options | 0, 1, 2, 3 |
| q17 | 4 options | 0, 1, 2, 3 |
| q19 | 4 options | 0, 1, 2, 3 |
| q20 | 4 options | 0, 1, 2, 3 |

All 7 Likert questions use an identical pattern: `option_text` = "1"/"2"/"3"/"4", `option_value` = "scale_1" through "scale_4", `score_value` = 0 through 3.

---

### A2. Core Scoring Algorithm (`src/lib/services/result.service.ts`)

**CRITICAL FINDING: Hardcoded `MAX_OPTION_SCORE` constant.**

File: `src/lib/services/result.service.ts`, lines 95-103:

```typescript
// Calculate max possible score (assuming max 3 per question * weight)
const MAX_OPTION_SCORE = 3;                    // <-- LINE 96: HARDCODED
let maxPossibleScore = 0;
let totalWeightApplied = 0;
questionsData.forEach(q => {
  const weight = q.weight ?? 1.0;
  maxPossibleScore += MAX_OPTION_SCORE * weight; // <-- LINE 101: Uses the constant
  totalWeightApplied += weight;
});
```

**How it works today:**
1. The algorithm queries all questions whose `question_type` is in `SCORING_QUESTION_TYPES` (line 18-23: `single_choice`, `multiple_choice`, `scale`, `likert_1_4`).
2. For each scoring question, it assumes the maximum possible score is **3** (the hardcoded constant).
3. `maxPossibleScore = COUNT(scoring_questions) * 3 * weight`.
4. The normalized score is calculated as: `Math.round((weightedScore / maxPossibleScore) * 100)` (line 122-123).

**Why this is a problem for `likert_1_5`:**
- With a 1-5 scale, the new max option score per Likert question becomes **4** (scores: 0, 1, 2, 3, 4).
- The algorithm would still divide by 3 per question, meaning a user who selects "5" (score=4) on every Likert question would produce a `normalizedScore > 100%`.
- Specifically: 7 Likert questions at score 4 = 28, but algorithm thinks max for those 7 is 21. The overshoot inflates the weighted score and breaks normalization.

**Additional pre-existing observation:** The live database reveals that not all scoring questions actually have a max `score_value` of 3. Some examples:

| Question | Type | Actual Max `score_value` | Algorithm Assumes |
|----------|------|--------------------------|-------------------|
| q02 | single_choice | 1 | 3 |
| q03 | single_choice | 2 | 3 |
| q06 | multiple_choice | 1 (per option) | 3 |
| q28-q30 | single_choice | 0 | 3 |

This means the current `maxPossibleScore` is already an overestimate (90 vs actual max of ~60), but because **segment assignment uses `weightedScore` directly** (not `normalizedScore`), and the segment ranges (0-20, 21-40, 41-60) were calibrated to the actual weighted score range, this hasn't caused visible bugs. The `normalizedScore` is used only for display (stress stage quartiles, display score 0-60).

---

**`SCORING_QUESTION_TYPES` array** (line 18-23):

```typescript
const SCORING_QUESTION_TYPES = [
  'single_choice',
  'multiple_choice',
  'scale',
  'likert_1_4'        // <-- Must add 'likert_1_5' or change to 'likert_1_5'
];
```

This array controls which questions are included in the scoring query. `likert_1_5` is not currently listed.

---

### A3. Frontend Component (`src/components/quiz/LikertScaleQuestion.tsx`)

**Component rendering** (lines 91-114):

```tsx
<div className="grid grid-cols-4 gap-2 md:gap-2.5 mb-3 md:mb-4 max-w-md mx-auto">
  {question.options.map((option, index) => {
    const scaleNumber = index + 1;
    return (
      <motion.button key={option.id} /* ... */>
        {scaleNumber}
      </motion.button>
    );
  })}
</div>
```

**Findings:**
1. **Dynamic option rendering:** The `.map()` iterates over `question.options`, so if 5 options exist in the database, 5 buttons will render. This is good.
2. **Hardcoded CSS grid:** `grid-cols-4` forces a 4-column layout. A 5th button would wrap to a second row, breaking the visual design.
3. **Scale labels:** `scale_left_label` and `scale_right_label` are dynamic from the database (line 116-119). No changes needed there.

**Question type routing** (`src/components/quiz/QuizQuestion.tsx`, line 27-28):

```typescript
case 'likert_1_4':
  return <LikertScaleQuestion ... />;
```

This switch case must be updated or extended to handle `likert_1_5`.

---

## Part B: Proposed Database Migration and Data Update Plan

### B1. Migration Script: Alter CHECK Constraint

A single migration to update the allowed `question_type` values:

```sql
-- Migration: add_likert_1_5_type
-- Step 1: Drop old constraint
ALTER TABLE quiz_questions
  DROP CONSTRAINT IF EXISTS quiz_questions_question_type_check;

-- Step 2: Re-create with likert_1_5 added (likert_1_4 retained for safety)
ALTER TABLE quiz_questions
  ADD CONSTRAINT quiz_questions_question_type_check
  CHECK (question_type IN (
    'single_choice',
    'multiple_choice',
    'scale',
    'likert_1_4',
    'likert_1_5',
    'age_select',
    'info_trust',
    'education_insert',
    'validation_info'
  ));
```

**Note:** We retain `likert_1_4` in the constraint to avoid breaking any existing data or code that hasn't been migrated yet. It can be removed in a future cleanup migration.

---

### B2. Data Update Plan: Convert Questions and Insert 5th Option

**Step 1: Update question types** (7 questions):

```sql
UPDATE quiz_questions
SET question_type = 'likert_1_5',
    updated_at = NOW()
WHERE question_type = 'likert_1_4';
```

**Step 2: Insert the 5th option** for each Likert question:

```sql
INSERT INTO quiz_options (question_id, order_index, option_text, option_value, score_value)
SELECT id, 4, '5', 'scale_5', 4
FROM quiz_questions
WHERE question_type = 'likert_1_5';
```

This adds an option with:
- `order_index`: **4** (0-indexed, so 5th position)
- `option_text`: **"5"** (displayed as the number 5)
- `option_value`: **"scale_5"** (consistent naming convention)
- `score_value`: **4** (continues the 0, 1, 2, 3, **4** sequence)

**Execution order:** Step 1 must run before Step 2 (Step 2's WHERE clause depends on the updated `question_type`).

---

### B3. Seed File Update

The seed file `supabase/seed_betterlady_quiz.sql` should also be updated to reflect the new schema for fresh deployments. Each Likert question block (q04, q14, q15, q16, q17, q19, q20) needs:

1. `question_type` changed from `'likert_1_4'` to `'likert_1_5'`
2. A 5th `UNION ALL` line added:
   ```sql
   UNION ALL SELECT id, 4, '5', 'scale_5', 4 FROM q04
   ```

---

## Part C: Proposed Refactoring of the Scoring Algorithm

### C1. The Problem

The current `maxPossibleScore` calculation at `result.service.ts:96-103` is **brittle and incorrect**:

```typescript
const MAX_OPTION_SCORE = 3; // Assumes ALL questions have max score 3
```

**Why it fails with `likert_1_5`:**

| Scenario | Algorithm's maxPossibleScore | True maxPossibleScore | Normalized Score for max answers |
|----------|-----------------------------|-----------------------|--------------------------------|
| Current (30 questions, all assumed max=3) | 90 | ~60 (varies by question) | ~67% (capped below 100) |
| After upgrade (7 Likert now max=4, rest unchanged) | 90 (still hardcoded 3) | ~67 | Could exceed 100% for high scorers |

A user who answers "5" (score=4) on all 7 Likert questions would contribute `7 * 4 = 28` to their weighted score from Likert alone, but the algorithm only budgets `7 * 3 = 21` for those questions. This creates `normalizedScore > 100`, which would:
- Break the `getStressStage()` quartile logic (expects 0-100)
- Produce display scores above 60 (the `toDisplayScore()` function maps 0-100 to 0-60)
- Create meaningless stress stage assignments

### C2. The Solution: Dynamic `maxPossibleScore` from Database

**Replace the hardcoded constant with a database query** that finds the actual maximum `score_value` for each scoring question.

**New approach:**

1. Modify the `calculateResult` function to query `quiz_options` alongside `quiz_questions`.
2. For each scoring question, find the `MAX(score_value)` across its options.
3. Sum `MAX(score_value) * weight` for each question to derive the true `maxPossibleScore`.

**Proposed implementation outline:**

```typescript
// REPLACE lines 78-103 of result.service.ts with:

// Get all scoring questions with their weights AND max option scores
const { data: questions, error: questionsError } = await supabase
  .from('quiz_questions')
  .select(`
    id,
    question_type,
    weight,
    quiz_options (score_value)
  `)
  .eq('quiz_id', quizId)
  .in('question_type', SCORING_QUESTION_TYPES);

if (questionsError) throw new Error(`Failed to load questions: ${questionsError.message}`);

const questionsData = questions || [];

// Build question weight map AND calculate dynamic maxPossibleScore
const questionWeights = new Map<string, number>();
let maxPossibleScore = 0;
let totalWeightApplied = 0;

questionsData.forEach(q => {
  const weight = q.weight ?? 1.0;
  questionWeights.set(q.id, weight);

  // Find the maximum score_value among this question's options
  const maxOptionScore = (q.quiz_options || []).reduce(
    (max: number, opt: { score_value: number | null }) =>
      Math.max(max, opt.score_value ?? 0),
    0
  );

  maxPossibleScore += maxOptionScore * weight;
  totalWeightApplied += weight;
});
```

**Key benefits of this approach:**
1. **No hardcoded values** - works for any question type with any score range
2. **Self-healing** - if score_values change in the database, the algorithm automatically adapts
3. **Future-proof** - adding `likert_1_7` or `scale_1_10` in the future requires zero code changes
4. **Fixes the pre-existing overestimate** - questions like q02 (max=1) and q28-q30 (max=0) will now contribute their true max, not an inflated 3

### C3. Impact on Segment Ranges

**Critical consideration:** The result segments use `weightedScore` (not `normalizedScore`) for matching:

```typescript
// Line 135-137 of result.service.ts
let segment = segments.find((s: any) =>
  weightedScore >= s.minScore && weightedScore <= s.maxScore
);
```

Current segment ranges from the live database:
- **Low:** 0-20
- **Medium:** 21-40
- **High:** 41-60

After the upgrade, the true max weighted score increases from ~60 to ~67 (7 Likert questions gaining 1 point each). This means:
- The "High" segment caps at 60, but scores up to 67 are now possible.
- The **fallback logic** (lines 140-148) will catch scores >60 and assign them to the highest segment, so this won't crash.
- However, you may want to **update the segment ranges** to `41-67` for the "High" segment to be explicit.

**Recommendation:** Update the `result_config` in the `quizzes` table:

```sql
UPDATE quizzes
SET result_config = jsonb_set(
  result_config,
  '{segments,2,maxScore}',
  '67'
)
WHERE slug = 'stress-quiz';
```

Or better yet, set it to a round number like `70` to give headroom. This decision should be made based on the desired score distribution.

### C4. Impact on Display Scores and Stress Stages

The `normalizedScore` (0-100) feeds into:
- `getStressStage()` - quartile thresholds at 25, 50, 75, 100 (`src/config/result-screens.config.ts:51-56`)
- `toDisplayScore()` - maps to 0-60 range (line 61-63)

With the dynamic `maxPossibleScore` fix, `normalizedScore` will always be correctly bounded to 0-100, so **no changes are needed** in `result-screens.config.ts`. The quartile thresholds and display score conversion will work correctly.

### C5. Update `SCORING_QUESTION_TYPES`

Add `'likert_1_5'` to the scoring types array:

```typescript
const SCORING_QUESTION_TYPES = [
  'single_choice',
  'multiple_choice',
  'scale',
  'likert_1_4',
  'likert_1_5'   // <-- ADD
];
```

### C6. Test Updates

The test file `src/lib/services/__tests__/result.service.test.ts` needs updates:
1. Mock data must include `quiz_options` in the question query response (since we're now using a joined query)
2. Add a test case specifically for `likert_1_5` questions with `score_value = 4`
3. Add a test verifying that `normalizedScore` never exceeds 100 for any combination of answers
4. Update the existing test at line 180 that references `likert_1_4` to also cover `likert_1_5`

---

## Part D: Proposed Frontend Component Changes

### D1. CSS Grid Update (`LikertScaleQuestion.tsx`, line 91)

**Current:**
```tsx
<div className="grid grid-cols-4 gap-2 md:gap-2.5 mb-3 md:mb-4 max-w-md mx-auto">
```

**Proposed - Option A (Dynamic):**
```tsx
<div className={`grid grid-cols-${question.options.length} gap-2 md:gap-2.5 mb-3 md:mb-4 max-w-md mx-auto`}>
```

**Important Tailwind caveat:** Dynamic class names like `grid-cols-${n}` are NOT detected by Tailwind's JIT compiler. You must either:

1. **Safelist the classes** in `tailwind.config.ts`:
   ```js
   safelist: ['grid-cols-4', 'grid-cols-5']
   ```

2. **Or use a lookup object** (preferred):
   ```tsx
   const gridColsClass: Record<number, string> = {
     4: 'grid-cols-4',
     5: 'grid-cols-5',
   };

   <div className={`${gridColsClass[question.options.length] || 'grid-cols-5'} gap-2 md:gap-2.5 mb-3 md:mb-4 max-w-md mx-auto`}>
   ```

**Recommendation:** Use the lookup object approach. It's explicit, safe, and doesn't require Tailwind config changes.

### D2. Button Sizing Consideration

With 5 buttons in the same `max-w-md` (448px) container, each button becomes ~80px wide instead of ~100px. The `aspect-square` class means height = width, so buttons shrink proportionally. On mobile this may be tight.

**Proposed adjustment:** Slightly reduce gap and font size for 5 columns:
```tsx
// When 5 options, use tighter spacing
const isFivePoint = question.options.length === 5;
const gapClass = isFivePoint ? 'gap-1.5 md:gap-2' : 'gap-2 md:gap-2.5';
const fontClass = isFivePoint
  ? 'text-lg md:text-xl lg:text-2xl'
  : 'text-xl md:text-2xl lg:text-3xl';
```

This is a UX polish item and can be deferred if the default sizing looks acceptable.

### D3. Question Type Routing (`QuizQuestion.tsx`, line 27)

**Option A - Map both types to the same component:**
```typescript
case 'likert_1_4':
case 'likert_1_5':
  return <LikertScaleQuestion ... />;
```

**Option B - Replace entirely** (if `likert_1_4` is fully retired):
```typescript
case 'likert_1_5':
  return <LikertScaleQuestion ... />;
```

**Recommendation:** Use Option A during the transition period. The component is already dynamic (maps over options), so it handles both 4 and 5 options without branching.

---

## Implementation Order (Recommended)

The following execution order minimizes risk:

| Step | Layer | Action | Risk |
|------|-------|--------|------|
| 1 | Backend | Refactor `calculateResult` to use dynamic `maxPossibleScore` | Medium - Core scoring change |
| 2 | Backend | Add `'likert_1_5'` to `SCORING_QUESTION_TYPES` | Low |
| 3 | Tests | Update unit tests for new scoring logic | Low |
| 4 | Frontend | Update `QuizQuestion.tsx` routing | Low |
| 5 | Frontend | Update `LikertScaleQuestion.tsx` grid CSS | Low |
| 6 | Database | Run migration: alter CHECK constraint | Low |
| 7 | Database | Run data update: change types + insert 5th options | Medium - Data migration |
| 8 | Database | (Optional) Update segment ranges in `result_config` | Low |
| 9 | Seed | Update `seed_betterlady_quiz.sql` | Low |
| 10 | QA | End-to-end validation | - |

**Rationale:** The scoring algorithm fix (Step 1) should be deployed **before** the data migration (Step 7). This way, even if both changes go live simultaneously, the algorithm is already prepared for the new data. If the data migrates first with the old algorithm, live users could see `normalizedScore > 100`.

---

## Files Modified (Summary)

| File | Change Type |
|------|------------|
| `src/lib/services/result.service.ts` | Refactor scoring algorithm (lines 78-103) |
| `src/lib/services/__tests__/result.service.test.ts` | Update test mocks and add cases |
| `src/components/quiz/QuizQuestion.tsx` | Add `likert_1_5` case (line 27) |
| `src/components/quiz/LikertScaleQuestion.tsx` | Dynamic grid class (line 91) |
| `supabase/migrations/00003_*.sql` | New migration file |
| `supabase/seed_betterlady_quiz.sql` | Update question types and options |

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Scoring breaks for active sessions mid-migration | High | Deploy code changes before data migration |
| Existing `quiz_results` have stale `calculation_details` | Low | Old results retain their calculation; only new completions use new logic |
| CSS grid breaks on mobile with 5 buttons | Medium | Test on mobile; adjust gap/font as needed |
| Segment ranges don't cover new max score | Low | Fallback logic already handles out-of-range scores |
| Tailwind purges dynamic grid class | Medium | Use lookup object pattern, not string interpolation |

---

## Open Questions for Review

1. **Segment range update:** Should "High" segment `maxScore` be updated from 60 to 67 (or 70)? Or is the fallback behavior acceptable?
2. **Backward compatibility:** Should we keep `likert_1_4` in `SCORING_QUESTION_TYPES` permanently, or remove it after confirming all data is migrated?
3. **Button sizing:** Is the default 5-column sizing acceptable on mobile, or should we apply the tighter spacing adjustment from Part D2?
4. **Existing results:** Should we re-calculate `normalizedScore` for existing `quiz_results` records using the new dynamic algorithm? (Only affects display accuracy in admin dashboards, not user-facing behavior.)
