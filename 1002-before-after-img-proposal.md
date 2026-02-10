# Proposal: Implement Dynamic "Before & After" Images

**Date:** 2026-02-09
**Status:** Awaiting Review
**Scope:** `TransformationDisplay.tsx` (component refactor), `SalesPage.tsx` (prop wiring)

---

## Executive Summary

The `TransformationDisplay` component on the sales page currently renders two placeholder `<div>` elements with the text "Stressed image" and "Calm image." This proposal details how to replace them with dynamic Next.js `<Image>` components that show the user's personalized stress stage image as the "before" state and the least-stressed image (`stres1.png`) as the "after" state. The data is already available in the Zustand store -- it just needs to be wired through.

---

## Part A: Data Flow Analysis

### A1. Zustand Store Confirmation: `stageImagePath` Exists

**Confirmed.** The `usePostQuizState` Zustand store (`src/hooks/usePostQuizState.ts`) stores the full `/api/quiz/complete` response in `completeData`. The `insights` object within it contains `stageImagePath`.

**Type definition** (`src/types/funnel.types.ts`, lines 59-68):

```typescript
export interface QuizInsights {
  stressStage: StressStage;
  stageImagePath: string;       // <-- e.g., "/images/stress_calc/stres3.png"
  stageTitle: string;
  stageDescription: string;
  insightCards: InsightCard[];
  normalizedScore: number;
  displayScore: number;
  maxDisplayScore: number;
}
```

The `stageImagePath` is populated by the `/api/quiz/complete` endpoint based on the user's calculated stress stage, using the mapping from `src/config/result-screens.config.ts` (lines 16-21):

```typescript
images: {
  1: '/images/stress_calc/stres1.png',
  2: '/images/stress_calc/stres2.png',
  3: '/images/stress_calc/stres3.png',
  4: '/images/stress_calc/stres4.png',
} as Record<StressStage, string>,
```

This is the same image shown on the `StressStateScreen` during the post-quiz funnel. Using `stageImagePath` directly (rather than re-deriving it from `stressStage`) guarantees the "before" image matches exactly what the user already saw.

### A2. Data Access Strategy

**"Before" image (dynamic):** Read `completeData.insights.stageImagePath` from the store inside `SalesPage.tsx`. This value is already extracted at line 85:

```typescript
const { insights } = completeData;
// insights.stageImagePath is available here
```

No additional store changes or API calls are needed.

**"After" image (static):** Hardcode the path to the least-stressed image: `/images/stress_calc/stres1.png`. This corresponds to `stressStage: 1` ("Nizka uroven stresu") and represents the user's goal state. This path is a constant and does not need to come from the store.

**Fallback:** If `stageImagePath` is somehow missing (e.g., corrupted localStorage), fall back to `/images/stress_calc/stres4.png` (highest stress), which is the most common user segment and the safest default for a "before" image.

---

## Part B: Proposed Component Refactoring

### B1. File to Modify: `src/components/sales/TransformationDisplay.tsx`

### B2. Current State: Placeholder Divs

The "before" placeholder (lines 198-201):

```tsx
<div className="relative mb-2 sm:mb-4 aspect-[3/4] bg-[#F6F6F6] rounded-[10px] overflow-hidden flex items-center justify-center">
  <span className="text-[#949BA1] text-[12px] sm:text-[14px]">Stressed image</span>
</div>
```

The "after" placeholder (lines 234-237):

```tsx
<div className="relative mb-2 sm:mb-4 aspect-[3/4] bg-[#E6EEEB] rounded-[10px] overflow-hidden flex items-center justify-center">
  <span className="text-[#949BA1] text-[12px] sm:text-[14px]">Calm image</span>
</div>
```

Both are simple `<div>` elements with centered gray text. No `next/image` import exists in the file.

### B3. Props Update

Add two new props to the `TransformationDisplayProps` interface:

```typescript
export interface TransformationDisplayProps {
  currentStressStage: StressStage;
  currentScore: number;
  targetScore: number;
  stageTitle: string;
  firstName: string;
  beforeImageUrl: string;    // NEW: path to user's stress stage image
  afterImageUrl: string;     // NEW: path to goal state image (stres1.png)
}
```

**Why two separate string props instead of deriving internally?**
- The component stays a pure presentational component -- it receives data, not business logic.
- `SalesPage.tsx` owns the data derivation (reading from the store, applying fallbacks).
- Makes the component testable and reusable with any image pair.

### B4. Implementation Plan

**Step 1:** Add `import Image from 'next/image';` to the imports.

**Step 2:** Replace the "before" placeholder div (lines 198-201) with:

```tsx
<div className="relative mb-2 sm:mb-4 aspect-[3/4] rounded-[10px] overflow-hidden">
  <Image
    src={beforeImageUrl}
    alt="Current stress level"
    fill
    className="object-cover"
    sizes="(max-width: 500px) 45vw, 225px"
  />
</div>
```

Key details:
- The outer `<div>` retains `aspect-[3/4]`, `rounded-[10px]`, and `overflow-hidden` to maintain the existing card shape and clip the image.
- The `<span>` placeholder text is removed entirely.
- The background color `bg-[#F6F6F6]` is removed (the image fills the container).
- `fill` prop + `object-cover` makes the image fill the aspect-ratio container without distortion.
- `sizes` hint tells Next.js the image is roughly half of a 500px container (~225px), enabling proper responsive image optimization.

**Step 3:** Replace the "after" placeholder div (lines 234-237) with the same pattern:

```tsx
<div className="relative mb-2 sm:mb-4 aspect-[3/4] rounded-[10px] overflow-hidden">
  <Image
    src={afterImageUrl}
    alt="Goal stress level"
    fill
    className="object-cover"
    sizes="(max-width: 500px) 45vw, 225px"
  />
</div>
```

**Step 4:** No changes to any other elements in the component. The `StatusBadge`, `StatsCard`, `ArrowIcon`, and all Framer Motion animations remain untouched.

---

## Part C: Integration Plan

### C1. File to Modify: `src/components/sales/SalesPage.tsx`

### C2. Current TransformationDisplay Usage (lines 136-142):

```tsx
<TransformationDisplay
  firstName={firstName}
  currentStressStage={insights.stressStage}
  currentScore={projection.displayCurrentScore}
  targetScore={projection.displayTargetScore}
  stageTitle={insights.stageTitle}
/>
```

### C3. Proposed Change

Add the two new image props. The `insights` object is already destructured at line 85, so `insights.stageImagePath` is immediately available:

```tsx
<TransformationDisplay
  firstName={firstName}
  currentStressStage={insights.stressStage}
  currentScore={projection.displayCurrentScore}
  targetScore={projection.displayTargetScore}
  stageTitle={insights.stageTitle}
  beforeImageUrl={insights.stageImagePath || '/images/stress_calc/stres4.png'}
  afterImageUrl="/images/stress_calc/stres1.png"
/>
```

**That's it.** No new hooks, no new state, no new API calls. The data path is:

```
Zustand store (completeData.insights.stageImagePath)
  → SalesPage.tsx (destructures insights, passes as prop)
    → TransformationDisplay.tsx (renders in <Image> component)
```

### C4. No Changes Required in Other Files

| File | Why No Change |
|------|--------------|
| `src/hooks/usePostQuizState.ts` | `stageImagePath` already stored in `completeData.insights` |
| `src/types/funnel.types.ts` | `QuizInsights` interface already has `stageImagePath: string` |
| `src/config/result-screens.config.ts` | Image path mapping already correct |
| `src/components/layout/StageLayout.tsx` | Not involved in sales page rendering |

---

## Files Modified (Summary)

| File | Change Type | What Changes |
|------|------------|-------------|
| `src/components/sales/TransformationDisplay.tsx` | Refactor | Add `beforeImageUrl` + `afterImageUrl` props, replace placeholder divs with `<Image>` components |
| `src/components/sales/SalesPage.tsx` | Wire props | Pass `insights.stageImagePath` and hardcoded `/images/stress_calc/stres1.png` as new props |

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| `stageImagePath` is null/undefined | Low | Fallback to `/images/stress_calc/stres4.png` in the prop default |
| Image file missing from `/public` | Very Low | Assets already exist and are used by `StressStateScreen` |
| Aspect ratio mismatch (image vs container) | Low | `object-cover` + `overflow-hidden` handles any ratio gracefully |
| Layout shift during image load | Low | The `aspect-[3/4]` container reserves space before the image loads |
| Next.js Image optimization for local files | None | Local images in `/public` are supported natively by `next/image` |
