# Proposal: Refactor Segmented Progress Bar to Percentage-Based Fill

**Date:** 2026-02-09
**Status:** Awaiting Review
**Scope:** `SegmentedProgressBar` component (single-file change)

---

## Executive Summary

This proposal details the refactoring of the `SegmentedProgressBar` component from a discrete segment-fill model (each segment is either fully green or fully gray) to a **percentage-based continuous fill** model. The visual structure will change from a variable number of segments (one per question) to a fixed **five-segment** layout where a single green fill bar smoothly advances across all five segments based on percentage completion. The change is fully encapsulated within the component itself -- no changes are needed to any parent components, hooks, or the database.

---

## Part A: Data and State Analysis

### A1. Database Confirmation: `section_label` Column

**Confirmed.** The `quiz_questions` table contains a `section_label TEXT` column, added in migration `supabase/migrations/00002_add_betterlady_extensions.sql` (line 23):

```sql
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS section_label TEXT;
```

This nullable column groups questions into categories. When `section_label` is `NULL`, the question is a special screen (age gate, trust screen, etc.) and the progress bar is hidden entirely.

### A2. Frontend State Confirmation: `categoryProgress` Object

**Confirmed.** The `useQuizState` hook (`src/hooks/useQuizState.ts`, lines 12-55) computes a `categoryProgress` object via the `computeCategoryProgress()` function. It provides exactly the two values we need:

**TypeScript interface** (`src/types/quiz.types.ts`, lines 79-88):

```typescript
export interface CategoryProgress {
  categoryName: string | null;
  totalInCategory: number;
  currentPositionInCategory: number;  // 1-indexed
  isSpecialScreen: boolean;
}
```

**How the values are computed** (lines 40-50 of `useQuizState.ts`):

```typescript
const categoryQuestions = questions.filter(
  (q) => q.section_label === categoryName
);
const positionInCategory =
  categoryQuestions.findIndex((q) => q.id === currentQuestion.id) + 1;

return {
  categoryName,
  totalInCategory: categoryQuestions.length,
  currentPositionInCategory: positionInCategory,
  isSpecialScreen: false,
};
```

**Key detail:** `currentPositionInCategory` is **1-indexed** and represents "you are currently on this question." When viewing question 3 of 10, the value is `3`.

**Data flow to the component** (identical pattern in all three question components):

| Component | File | Lines |
|-----------|------|-------|
| `SingleChoiceQuestion` | `src/components/quiz/QuizQuestion.tsx` | 85-92 |
| `MultiChoiceQuestion` | `src/components/quiz/MultiChoiceQuestion.tsx` | 60-68 |
| `LikertScaleQuestion` | `src/components/quiz/LikertScaleQuestion.tsx` | 53-61 |

All three pass the values identically to `StageLayout`:

```typescript
<StageLayout
  showSegmentedProgress={!categoryProgress.isSpecialScreen}
  totalSegments={categoryProgress.totalInCategory}
  completedSegments={categoryProgress.currentPositionInCategory}
  categoryLabel={categoryProgress.categoryName || undefined}
/>
```

`StageLayout` (`src/components/layout/StageLayout.tsx`, lines 189-199) then passes them through to `SegmentedProgressBar`:

```typescript
<SegmentedProgressBar
  totalSegments={totalSegments}
  completedSegments={completedSegments}
  activeColor="#327455"
  inactiveColor="#E5E7EB"
  gapSize={4}
/>
```

**Conclusion:** The data pipeline is fully established and provides everything we need. `totalSegments` and `completedSegments` give us the exact inputs for the percentage calculation: `(completedSegments / totalSegments) * 100`.

---

## Part B: Proposed Refactoring of the SegmentedProgressBar Component

### B1. The Problem: Why the Current Implementation Cannot Support Fractional Fill

**File:** `src/components/quiz/SegmentedProgressBar.tsx`

The current implementation (lines 64-78) creates one `<div>` per question in the category and makes a binary choice for each:

```typescript
{Array.from({ length: totalSegments }, (_, index) => {
  const segmentNumber = index + 1;
  const isCompleted = segmentNumber <= completedSegments;
  return (
    <div
      className="h-1 md:h-1.5 rounded-full flex-1 transition-colors duration-200"
      style={{ backgroundColor: isCompleted ? activeColor : inactiveColor }}
    />
  );
})}
```

This has two fundamental limitations:

1. **Variable segment count.** The number of visible segments equals `totalSegments` (the number of questions in the category). A category with 4 questions shows 4 bars; a category with 10 questions shows 10 bars. The requirement mandates **always exactly five** visual segments regardless of question count.

2. **Binary fill -- no fractional state.** Each segment is either 100% green or 100% gray. The `isCompleted` boolean is a whole-number comparison (`segmentNumber <= completedSegments`). There is no mechanism to render a segment as "50% filled." The requirement mandates smooth, proportional filling that can cross segment boundaries (e.g., after 1 of 10 questions, half of the first segment should be filled).

### B2. The Proposed Solution: Overlay Architecture

The new implementation uses a **background + overlay** pattern: five static gray segments form the track, and a single absolutely-positioned green bar fills on top of them to the correct percentage width.

**Architecture:**

```
┌─────────────────────────────────────────────────────┐
│  Outer container (relative positioning)             │
│                                                     │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │  ← 5 gray background segments
│  │░░░░░│ │░░░░░│ │░░░░░│ │░░░░░│ │░░░░░│          │    (flex-1, always visible)
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘          │
│                                                     │
│  ┌███████████████████░░░░░░░░░░░░░░░░░░░┐          │  ← Green fill overlay
│  │  width: 50%       │                  │          │    (absolute, top-0 left-0)
│  └──────────────────────────────────────┘          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Detailed implementation strategy:**

#### Step 1: Calculate the fill percentage

```typescript
const fillPercent = totalSegments > 0
  ? (completedSegments / totalSegments) * 100
  : 0;
```

Given `completedSegments=3` and `totalSegments=10`, this yields `30%`.

#### Step 2: Render five fixed gray background segments

Replace the dynamic `Array.from({ length: totalSegments })` with a fixed `Array.from({ length: 5 })`. These five segments are always gray and form the "track."

```typescript
{Array.from({ length: 5 }, (_, index) => (
  <div
    key={index}
    className="h-1 md:h-1.5 rounded-full flex-1"
    style={{ backgroundColor: inactiveColor }}
    aria-hidden="true"
  />
))}
```

Each segment uses `flex-1` to divide the container width equally. With `gapSize=4` and five segments, each occupies ~19.2% of the total width (accounting for the four 4px gaps).

#### Step 3: Render the green fill overlay

A single `<div>` is absolutely positioned over the background track. Its `width` is set to the calculated `fillPercent`. The key trick is that this overlay must **account for the gaps** between the background segments. There are two clean approaches:

**Approach A -- Clip-path overlay (Recommended):**

Render the overlay as a full-width bar at the same height, but use the same flex layout with five green segments inside it. Then set `clip-path: inset(0 ${100 - fillPercent}% 0 0)` (or equivalently, `width: fillPercent%`) on the overlay container. This ensures the green segments align pixel-perfectly with the gray segments underneath, including matching the `rounded-full` corners and gaps.

```
Overlay container (absolute, inset-0):
  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   ← 5 green segments (same layout)
  │█████│ │█████│ │█████│ │█████│ │█████│     clipped at fillPercent% from left
  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘
```

The overlay container uses `overflow: hidden` and `width: {fillPercent}%` to crop the green bar at exactly the right point. This naturally handles the gaps -- when the fill lands in the middle of a gap, no green is visible until it reaches the next segment.

**Why this is superior:** The green segments inherit the same `flex-1`, `gap`, and `rounded-full` styling as the gray segments. There is zero risk of visual misalignment. The fill "eats into" each segment naturally and the gaps remain visually clean.

#### Step 4: Smooth CSS transitions

Add `transition: width 300ms ease-out` to the overlay container so the fill animates smoothly when the user advances to the next question. This replaces the current `transition-colors duration-200` with a more appropriate width transition.

#### Step 5: Update ARIA attributes

The ARIA attributes will be updated to reflect the percentage model:

```typescript
role="progressbar"
aria-valuenow={Math.round(fillPercent)}
aria-valuemin={0}
aria-valuemax={100}
aria-label={`Progress: ${completedSegments} of ${totalSegments} questions`}
```

### B3. Proposed JSX Structure (Pseudocode)

```tsx
export const SegmentedProgressBar = memo(function SegmentedProgressBar({
  totalSegments,
  completedSegments,
  visible = true,
  activeColor = '#327455',
  inactiveColor = '#E5E7EB',
  gapSize = 4,
  className,
}: SegmentedProgressBarProps) {
  if (!visible || totalSegments <= 0) return null;

  const FIXED_SEGMENT_COUNT = 5;
  const fillPercent = Math.min((completedSegments / totalSegments) * 100, 100);

  return (
    <div
      className={cn('relative flex w-full', className)}
      style={{ gap: `${gapSize}px` }}
      role="progressbar"
      aria-valuenow={Math.round(fillPercent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progress: ${completedSegments} of ${totalSegments} questions`}
    >
      {/* Background: 5 gray segments */}
      {Array.from({ length: FIXED_SEGMENT_COUNT }, (_, i) => (
        <div
          key={`bg-${i}`}
          className="h-1 md:h-1.5 rounded-full flex-1"
          style={{ backgroundColor: inactiveColor }}
          aria-hidden="true"
        />
      ))}

      {/* Overlay: 5 green segments, clipped to fillPercent width */}
      <div
        className="absolute inset-0 flex overflow-hidden"
        style={{
          gap: `${gapSize}px`,
          width: `${fillPercent}%`,
          transition: 'width 300ms ease-out',
        }}
        aria-hidden="true"
      >
        {Array.from({ length: FIXED_SEGMENT_COUNT }, (_, i) => (
          <div
            key={`fill-${i}`}
            className="h-1 md:h-1.5 rounded-full flex-1 shrink-0"
            style={{ backgroundColor: activeColor }}
          />
        ))}
      </div>
    </div>
  );
});
```

### B4. Walk-Through Examples

Given a category with **10 questions** (`totalSegments=10`):

| After Question | `completedSegments` | `fillPercent` | Visual Result |
|----------------|---------------------|---------------|---------------|
| 1 | 1 | 10% | First segment ~half filled |
| 2 | 2 | 20% | First segment fully green |
| 3 | 3 | 30% | First segment + half of second |
| 5 | 5 | 50% | Two and a half segments green |
| 8 | 8 | 80% | Four segments green |
| 10 | 10 | 100% | All five segments fully green |

Given a category with **4 questions** (`totalSegments=4`):

| After Question | `completedSegments` | `fillPercent` | Visual Result |
|----------------|---------------------|---------------|---------------|
| 1 | 1 | 25% | ~1.25 segments green |
| 2 | 2 | 50% | 2.5 segments green |
| 3 | 3 | 75% | ~3.75 segments green |
| 4 | 4 | 100% | All five segments green |

### B5. Edge Cases

| Scenario | Behavior |
|----------|----------|
| `totalSegments=0` | Component returns `null` (guard clause) |
| `completedSegments > totalSegments` | `Math.min()` caps `fillPercent` at 100% |
| `completedSegments=0` | Fill width is 0% (all gray) |
| Category with 1 question | After answering: jumps from 0% to 100% |
| `isSpecialScreen=true` | Component not rendered (handled by StageLayout) |

---

## Part C: Integration Plan

### C1. Component Props -- No Changes Required

The `SegmentedProgressBarProps` interface does **not** need to change. The two required props remain:

| Prop | Current Meaning | New Meaning | Change? |
|------|----------------|-------------|---------|
| `totalSegments` | Number of visual segments to render | Total questions in category (used for percentage calculation) | **No** (same value, different internal use) |
| `completedSegments` | Number of segments to fill green | Current position in category (used for percentage calculation) | **No** (same value, different internal use) |
| `visible` | Show/hide toggle | Same | No |
| `activeColor` | Green color | Same | No |
| `inactiveColor` | Gray color | Same | No |
| `gapSize` | Gap between segments | Same | No |
| `className` | Custom CSS | Same | No |

The prop names `totalSegments` and `completedSegments` will have a slightly different semantic meaning internally (they now drive a percentage calculation rather than a segment count), but the values passed by parent components remain correct as-is.

### C2. Parent Component Changes -- None Required

The refactoring is **fully encapsulated** within `SegmentedProgressBar.tsx`. No changes needed in:

| File | Why No Change |
|------|--------------|
| `src/hooks/useQuizState.ts` | `categoryProgress` already provides `totalInCategory` and `currentPositionInCategory` |
| `src/types/quiz.types.ts` | `CategoryProgress` interface is unchanged |
| `src/components/layout/StageLayout.tsx` | Already passes `totalSegments` and `completedSegments` through |
| `src/components/quiz/QuizQuestion.tsx` | Already maps `categoryProgress` to StageLayout props |
| `src/components/quiz/MultiChoiceQuestion.tsx` | Same pattern as above |
| `src/components/quiz/LikertScaleQuestion.tsx` | Same pattern as above |

### C3. JSDoc Update

The component's JSDoc comment (lines 29-38) should be updated to reflect the new behavior:

```typescript
/**
 * SegmentedProgressBar - Percentage-based progress indicator
 *
 * Displays five fixed horizontal segments that fill proportionally
 * based on the user's progress through a quiz category.
 * Uses totalSegments and completedSegments to calculate fill percentage.
 *
 * @example
 * // Category with 10 questions, currently on question 3 (30% fill)
 * <SegmentedProgressBar totalSegments={10} completedSegments={3} />
 */
```

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Green overlay misaligns with gray segments | Medium | Use identical flex layout in both layers; same `gap`, `flex-1`, `rounded-full` |
| Fill appears to "jump" past gaps | Low | This is actually correct behavior -- gaps are dead zones. The fill visually pauses at gap boundaries, which looks natural. |
| `fillPercent` exceeds 100% | Low | `Math.min()` cap prevents overflow |
| Performance regression from dual-layer rendering | Very Low | Component is `memo()`-ized; 10 simple divs total is negligible |
| CSS `transition` conflicts with Framer Motion page transitions | Low | Component uses only CSS transitions (no Framer Motion); no conflict expected |

---

## Files Modified (Summary)

| File | Change Type |
|------|------------|
| `src/components/quiz/SegmentedProgressBar.tsx` | Refactor (single file) |

**Zero other files touched.** This is a fully encapsulated change.
