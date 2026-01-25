# UX & Layout Architecture Proposal
## BetterLady Stress Quiz — Viewport-Controlled Layout System

**Document Status**: Proposal (Not Yet Implemented)
**Created**: 2026-01-25
**Author**: Claude (Main Orchestrator)
**Purpose**: Address critical UX/layout issues before proceeding with scoring logic

---

## 1. Problem Understanding

### Current State Analysis

The BetterLady Stress Quiz is functionally complete:
- ✅ All quiz logic works correctly
- ✅ All question types are implemented (single choice, multi-choice, likert, age gate, trust, inserts)
- ✅ Database is seeded with real content
- ✅ Woman cutout images (WebP) are available in `/public/quiz-assets/`

However, **the layout architecture is fundamentally broken** for a conversion-optimized quiz funnel.

### Critical Problems Identified

#### 🚨 Problem 1: Scrolling Breaks the Funnel Experience

**Current Behavior:**
- Many quiz screens exceed 100vh (viewport height)
- CTA button ("Pokračovat") often appears below the fold
- Users must scroll down to see the continue button
- This creates friction and reduces completion rates

**Why This Is Critical:**
- Quiz funnels must feel like **guided steps**, not content pages
- Every scroll creates a micro-decision point where users can drop off
- The CTA button is the conversion point — it MUST be visible at all times

**Root Cause:**
- Components are built as content-driven containers (`min-h-screen` with content stacking vertically)
- No viewport height enforcement
- Image placement pushes content down instead of overlaying

---

#### 🚨 Problem 2: Woman Images Break Layout

**Current Behavior:**
- Woman cutout images are rendered as inline `<Image>` elements in the component tree
- They occupy space in the document flow
- They push question text and options downward
- This forces vertical scrolling

**Desired Behavior (per screenshot):**
- Woman images should be **overlay layers**, not inline content
- Anchored to **bottom-right corner** of viewport
- Partially visible (cutout style, cropped at edges)
- Never interfere with answer interaction
- Never push content down

**Root Cause:**
- Images are currently rendered inside the content container:
  ```tsx
  {question.image_url && (
    <Image src={question.image_url} alt="" ... />
  )}
  ```
- This treats images as content, not decorative overlays

---

#### 🚨 Problem 3: Educational Inserts Feel Floaty

**Current Behavior:**
- Insert screens (E1-E5) have inconsistent heights
- Large empty spaces appear between title and CTA
- CTA placement feels random (sometimes at bottom, sometimes mid-page)
- Background gradient doesn't fill viewport consistently

**Why This Matters:**
- Inserts are narrative moments — they need authority and polish
- Inconsistent height creates a "unfinished" feeling
- Users lose trust when design feels unstable

**Root Cause:**
- InsertScreen component uses `min-h-screen` but doesn't control internal spacing
- Content container allows natural height, creating gaps
- No viewport-locking mechanism

---

#### 🚨 Problem 4: Layout Architecture Is Content-Driven (Not Step-Driven)

**Current Architecture:**
```
QuizQuestion.tsx renders → Specialized component → Content stacks vertically
```

This treats each quiz screen as a **content page** that flows naturally.

**Required Architecture:**
```
Quiz Step = Fixed Viewport Container with 3 zones:
  [Header Zone: Progress bar, section label]
  [Content Zone: Question + options, absolutely positioned overlays]
  [CTA Zone: Fixed footer with continue button]
```

This treats each quiz screen as a **controlled step** with guaranteed visibility.

---

## 2. Proposed Layout Architecture

### Core Concept: "Stage Layout System"

Each quiz step becomes a **stage** — a fixed-height container with predefined zones.

```
┌─────────────────────────────────┐
│ Header Zone (fixed)             │  ← Progress bar, section label
├─────────────────────────────────┤
│                                 │
│ Content Zone (scrollable only   │  ← Question text, options
│ if absolutely necessary)        │
│                                 │
│         [Woman Overlay →]       │  ← Absolute positioned image
│                                 │
├─────────────────────────────────┤
│ CTA Zone (fixed)                │  ← "Pokračovat" button
└─────────────────────────────────┘
   ↑ Total height = 100vh
```

### Technical Implementation Strategy

#### Step 1: Create `QuizStageLayout` Wrapper Component

**Purpose**: Enforce viewport-controlled layout contract for all quiz steps.

**Props:**
```typescript
interface QuizStageLayoutProps {
  // Content
  children: React.ReactNode;

  // Layout behavior
  showProgress?: boolean;
  progressPercent?: number;
  sectionLabel?: string;

  // CTA configuration
  showCTA?: boolean; // Some screens auto-advance, some have manual CTA
  ctaLabel?: string; // Default: "Pokračovat"
  ctaDisabled?: boolean;
  onCtaClick?: () => void;

  // Image overlay
  overlayImage?: {
    src: string;
    alt: string;
    anchor: 'bottom-right' | 'bottom-left' | 'center-right'; // Position anchor
    opacity?: number; // Default: 1
    maxHeight?: string; // Default: '70vh'
  };

  // Layout mode
  variant?: 'question' | 'insert' | 'gate'; // Presets for different screen types
}
```

**Layout Structure:**
```tsx
<div className="quiz-stage h-screen flex flex-col overflow-hidden">
  {/* HEADER ZONE - Fixed at top */}
  <header className="flex-shrink-0 bg-white border-b">
    {showProgress && <ProgressBar percent={progressPercent} />}
    {sectionLabel && <SectionLabel text={sectionLabel} />}
  </header>

  {/* CONTENT ZONE - Flex-grow, limited overflow */}
  <main className="flex-grow relative overflow-y-auto">
    <div className="container max-w-2xl mx-auto px-4 py-6">
      {children}
    </div>

    {/* IMAGE OVERLAY - Absolutely positioned */}
    {overlayImage && (
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src={overlayImage.src}
          alt={overlayImage.alt}
          className={`absolute ${getAnchorClass(overlayImage.anchor)}`}
          style={{ maxHeight: overlayImage.maxHeight, objectFit: 'contain' }}
        />
      </div>
    )}
  </main>

  {/* CTA ZONE - Fixed at bottom */}
  {showCTA && (
    <footer className="flex-shrink-0 bg-white border-t p-4 shadow-lg">
      <button
        onClick={onCtaClick}
        disabled={ctaDisabled}
        className="w-full max-w-md mx-auto block bg-[#F9A201] ..."
      >
        {ctaLabel}
      </button>
    </footer>
  )}
</div>
```

**CSS Helper for Anchors:**
```typescript
function getAnchorClass(anchor: 'bottom-right' | 'bottom-left' | 'center-right') {
  switch (anchor) {
    case 'bottom-right':
      return 'bottom-0 right-0 translate-x-[10%]'; // Partially crop at edge
    case 'bottom-left':
      return 'bottom-0 left-0 -translate-x-[10%]';
    case 'center-right':
      return 'top-1/2 right-0 -translate-y-1/2 translate-x-[10%]';
  }
}
```

---

#### Step 2: Refactor Question Components to Use Stage Layout

**Before (Current):**
```tsx
export function SingleChoiceQuestion({ question, onComplete }) {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h2>{question.question_text}</h2>
      {question.image_url && <Image src={question.image_url} />}
      <div className="options">
        {question.options.map(opt => <QuizOption />)}
      </div>
    </div>
  );
}
```

**After (Proposed):**
```tsx
export function SingleChoiceQuestion({ question, questionIndex, totalQuestions, onComplete }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <QuizStageLayout
      showProgress
      progressPercent={(questionIndex / totalQuestions) * 100}
      sectionLabel={question.section_label}
      showCTA={false} // Single choice auto-advances
      overlayImage={question.image_url ? {
        src: question.image_url,
        alt: '',
        anchor: 'bottom-right',
        maxHeight: '70vh'
      } : undefined}
      variant="question"
    >
      {/* ONLY render content, no layout concerns */}
      <h2 className="text-xl font-bold mb-6">{question.question_text}</h2>

      <div className="space-y-3 max-w-xl">
        {question.options.map(option => (
          <QuizOption
            key={option.id}
            option={option}
            selected={selectedId === option.id}
            onSelect={() => handleSelect(option.id)}
          />
        ))}
      </div>
    </QuizStageLayout>
  );
}
```

**Key Changes:**
1. Removed `min-h-screen` — handled by `QuizStageLayout`
2. Removed inline `<Image>` — passed to `overlayImage` prop
3. Component only renders **content**, not layout structure
4. CTA controlled by layout wrapper

---

#### Step 3: Apply to All Question Types

**Multi-Choice (with CTA button):**
```tsx
<QuizStageLayout
  showCTA={true}
  ctaLabel="Pokračovat"
  ctaDisabled={selectedIds.length === 0}
  onCtaClick={handleContinue}
  overlayImage={...}
>
  <h2>{question.question_text}</h2>
  <div className="space-y-3">
    {question.options.map(option => (
      <QuizOption
        multiSelect
        checked={selectedIds.includes(option.id)}
        onToggle={() => toggleOption(option.id)}
      />
    ))}
  </div>
</QuizStageLayout>
```

**Likert Scale:**
```tsx
<QuizStageLayout
  showCTA={false} // Auto-advances
  overlayImage={...}
>
  <h2>{question.question_text}</h2>
  <div className="grid grid-cols-4 gap-3">
    {[1, 2, 3, 4].map(value => (
      <LikertTile value={value} onSelect={handleSelect} />
    ))}
  </div>
  <div className="flex justify-between mt-4 text-sm text-gray-600">
    <span>{question.scale_left_label}</span>
    <span>{question.scale_right_label}</span>
  </div>
</QuizStageLayout>
```

**Educational Inserts:**
```tsx
<QuizStageLayout
  showProgress={false} // Inserts don't show progress
  showCTA={true}
  ctaLabel="Pokračovat"
  onCtaClick={handleContinue}
  variant="insert" // Special styling preset
>
  <div className="text-center max-w-lg mx-auto">
    {question.image_url && (
      <Image
        src={question.image_url}
        alt=""
        width={200}
        height={200}
        className="mx-auto mb-6"
      />
    )}
    <h2 className="text-2xl font-bold mb-4">{question.question_text}</h2>
    {question.helper_text && (
      <p className="text-gray-600 leading-relaxed">{question.helper_text}</p>
    )}
  </div>
</QuizStageLayout>
```

**Age Gate & Trust Screens:**
```tsx
<QuizStageLayout
  showProgress={false}
  showCTA={false} // Auto-advance after selection
  variant="gate"
>
  <div className="text-center max-w-md mx-auto">
    <h1 className="text-3xl font-bold mb-8">{question.question_text}</h1>
    <div className="space-y-3">
      {question.options.map(option => (
        <button
          onClick={() => handleSelect(option.id)}
          className="w-full p-4 border-2 rounded-lg ..."
        >
          {option.option_text}
        </button>
      ))}
    </div>
  </div>
</QuizStageLayout>
```

---

## 3. Image Overlay Strategy

### Technical Implementation

#### Approach: Absolute Positioning with Pointer-Events Control

**CSS Strategy:**
```css
.image-overlay-container {
  position: absolute;
  inset: 0; /* Cover entire content zone */
  pointer-events: none; /* Don't block clicks on options */
  z-index: 10; /* Above content, below modals */
  overflow: hidden; /* Crop images at edges */
}

.image-overlay-container img {
  position: absolute;
  object-fit: contain; /* Preserve aspect ratio */
  max-height: 70vh; /* Never exceed 70% of viewport */
  height: auto;
  width: auto;
}

/* Bottom-right anchor */
.anchor-bottom-right {
  bottom: 0;
  right: 0;
  transform: translateX(10%); /* Partial crop effect */
}
```

**React Component:**
```tsx
interface OverlayImageProps {
  src: string;
  alt: string;
  anchor: 'bottom-right' | 'bottom-left' | 'center-right';
  maxHeight?: string;
  opacity?: number;
}

function OverlayImage({ src, alt, anchor, maxHeight = '70vh', opacity = 1 }: OverlayImageProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
      style={{ opacity }}
    >
      <Image
        src={src}
        alt={alt}
        width={600} // Reasonable default for woman images
        height={800}
        className={cn(
          'absolute object-contain',
          anchor === 'bottom-right' && 'bottom-0 right-0 translate-x-[10%]',
          anchor === 'bottom-left' && 'bottom-0 left-0 -translate-x-[10%]',
          anchor === 'center-right' && 'top-1/2 right-0 -translate-y-1/2 translate-x-[10%]'
        )}
        style={{ maxHeight }}
        priority={false}
        quality={85}
      />
    </div>
  );
}
```

### Image Behavior Rules

| Screen Type | Image Presence | Anchor Position | Max Height | Opacity |
|-------------|----------------|-----------------|------------|---------|
| Single choice | Some questions | bottom-right | 70vh | 1.0 |
| Multi-choice | Some questions | bottom-right | 70vh | 1.0 |
| Likert scale | Some questions | bottom-right | 70vh | 1.0 |
| Educational insert | Logo only | center (inline, not overlay) | 200px | 1.0 |
| Age gate | No image | — | — | — |
| Trust screen | No image | — | — | — |

### Responsive Behavior

**Desktop (≥768px):**
- Woman images display at full size (max 70vh)
- Anchored bottom-right with 10% crop
- Content area has right padding to prevent text overlap

**Tablet (≥640px, <768px):**
- Woman images scale down to max 60vh
- Slight increase in crop (15% translateX)
- Content area uses more aggressive right padding

**Mobile (<640px):**
- **Option A (Recommended)**: Hide woman images entirely
  ```tsx
  overlayImage={question.image_url && !isMobile ? { ... } : undefined}
  ```
- **Option B**: Scale to max 50vh with 20% crop, low opacity (0.3)

**Rationale for hiding on mobile:**
- Small screens don't have room for decorative overlays
- Focus should be 100% on question and options
- Reduces bundle size on mobile networks

---

## 4. Normalization Across Screen Types

### Layout Contract: All Screens Follow Same Structure

Every quiz step, regardless of type, adheres to this contract:

```typescript
interface QuizStepContract {
  // Required
  header: {
    showProgress: boolean;
    progressPercent?: number;
    sectionLabel?: string;
  };

  content: {
    maxWidth: '2xl' | 'lg' | 'md'; // Tailwind max-w-* classes
    padding: 'normal' | 'relaxed'; // Vertical padding preset
    alignment: 'left' | 'center';
  };

  cta: {
    show: boolean;
    label?: string;
    disabled?: boolean;
    handler?: () => void;
  };

  overlay?: {
    type: 'woman-image' | 'none';
    image?: OverlayImageProps;
  };
}
```

### Preset Variants for Common Patterns

**`variant="question"`** (Default for all question types)
- Progress bar: ✅ Shown
- Section label: ✅ Shown if available
- Content alignment: Left
- Content max-width: 2xl (Tailwind ~42rem)
- CTA: Conditional (depends on question type)
- Overlay: Conditional (woman image if provided)

**`variant="insert"`** (Educational screens E1-E5)
- Progress bar: ❌ Hidden
- Section label: ❌ Hidden
- Content alignment: Center
- Content max-width: lg (Tailwind ~32rem)
- CTA: ✅ Always shown ("Pokračovat")
- Overlay: ❌ None (logo is inline content)
- Background: Gradient (separate styling)

**`variant="gate"`** (Age gate, trust screens)
- Progress bar: ❌ Hidden
- Section label: ❌ Hidden
- Content alignment: Center
- Content max-width: md (Tailwind ~28rem)
- CTA: ❌ Hidden (auto-advance on selection)
- Overlay: ❌ None
- Background: Clean white

### Implementation Example

```tsx
// QuizStageLayout.tsx
const VARIANT_CONFIGS = {
  question: {
    showProgress: true,
    contentAlignment: 'left',
    contentMaxWidth: 'max-w-2xl',
    bgClass: 'bg-gray-50',
  },
  insert: {
    showProgress: false,
    contentAlignment: 'center',
    contentMaxWidth: 'max-w-lg',
    bgClass: 'bg-gradient-to-br from-blue-50 to-purple-50',
  },
  gate: {
    showProgress: false,
    contentAlignment: 'center',
    contentMaxWidth: 'max-w-md',
    bgClass: 'bg-white',
  },
};

export function QuizStageLayout({ variant = 'question', ... }: QuizStageLayoutProps) {
  const config = VARIANT_CONFIGS[variant];

  return (
    <div className={cn('quiz-stage h-screen flex flex-col', config.bgClass)}>
      {/* Apply preset configs */}
    </div>
  );
}
```

---

## 5. Mobile Behavior Strategy

### Viewport Constraints on Mobile

**Challenge:**
- Mobile screens (320px - 428px wide, 568px - 932px tall)
- Must fit: progress bar + question + 4 options + CTA button
- No scrolling allowed

**Solution: Adaptive Scaling**

#### Content Density Adjustments

```typescript
const MOBILE_BREAKPOINTS = {
  sm: 640,
  xs: 480,
};

// Component adapts spacing based on viewport
function useResponsiveSpacing() {
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function updateViewport() {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    }
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  // Calculate optimal spacing
  const isMobile = viewport.width < MOBILE_BREAKPOINTS.sm;
  const isShort = viewport.height < 700; // iPhone SE, etc.

  return {
    headerPadding: isShort ? 'py-2' : 'py-3',
    contentPadding: isShort ? 'py-4' : 'py-6',
    optionGap: isShort ? 'space-y-2' : 'space-y-3',
    fontSize: isShort ? 'text-base' : 'text-lg',
    ctaPadding: isShort ? 'p-3' : 'p-4',
  };
}
```

#### Mobile-Specific Rules

| Element | Desktop | Mobile (<640px) |
|---------|---------|-----------------|
| **Woman images** | Shown as overlay | Hidden entirely |
| **Progress bar** | 8px height | 6px height |
| **Question text** | text-xl (20px) | text-lg (18px) |
| **Options** | space-y-3 (12px) | space-y-2 (8px) |
| **Option padding** | p-4 (16px) | p-3 (12px) |
| **CTA button** | p-4 (16px) | p-3 (12px) |
| **Content padding** | px-6 (24px) | px-4 (16px) |

#### Safe Zone Enforcement

```tsx
// QuizStageLayout calculates available content height
function calculateContentHeight() {
  const headerHeight = 60; // Progress bar + section label
  const ctaHeight = 72; // Button + padding
  const safeArea = 16; // Extra buffer

  return `calc(100vh - ${headerHeight + ctaHeight + safeArea}px)`;
}

<main
  className="flex-grow relative overflow-y-auto"
  style={{ maxHeight: calculateContentHeight() }}
>
  {/* Content guaranteed to fit */}
</main>
```

### Testing Strategy for Mobile

Must test on:
- ✅ iPhone SE (375×667) — shortest common screen
- ✅ iPhone 12/13/14 (390×844) — most common
- ✅ iPhone Pro Max (428×926) — largest iPhone
- ✅ Android small (360×640)
- ✅ Android large (412×915)

**Acceptance criteria:**
- No vertical scrolling on any device
- CTA button always visible
- All options clickable without overlap
- Text remains readable (min 16px font size)

---

## 6. Implementation Plan (Step-by-Step)

### Phase 1: Create Layout Infrastructure (2-3 hours)

**Tasks:**
1. ✅ Create `src/components/quiz/QuizStageLayout.tsx`
   - Implement three-zone layout (header/content/cta)
   - Add variant presets (question/insert/gate)
   - Add overlay image support
   - Add responsive spacing hooks

2. ✅ Create `src/components/quiz/OverlayImage.tsx`
   - Absolute positioning logic
   - Anchor point calculations
   - Responsive visibility (hide on mobile)

3. ✅ Create `src/hooks/useResponsiveSpacing.ts`
   - Viewport detection
   - Spacing calculations
   - Export utility functions

**Validation:**
- Layout renders correctly in isolation
- Variants apply correct styles
- Overlay images position correctly
- Mobile hides overlays

---

### Phase 2: Refactor Question Components (3-4 hours)

**Tasks:**
1. ✅ Refactor `SingleChoiceQuestion.tsx`
   - Wrap in `QuizStageLayout`
   - Move image to `overlayImage` prop
   - Remove layout concerns from component
   - Test with and without images

2. ✅ Refactor `MultiChoiceQuestion.tsx`
   - Wrap in `QuizStageLayout`
   - Move CTA button to layout footer
   - Update state handling for external CTA

3. ✅ Refactor `LikertScaleQuestion.tsx`
   - Wrap in `QuizStageLayout`
   - Adjust grid to fit in content zone

4. ✅ Refactor `InsertScreen.tsx`
   - Use `variant="insert"`
   - Center content
   - Remove custom CTA (use layout CTA)

5. ✅ Refactor `AgeGateScreen.tsx` (if not yet created, create it)
   - Use `variant="gate"`
   - Center content
   - Auto-advance behavior

6. ✅ Refactor `TrustScreen.tsx` (if not yet created, create it)
   - Use `variant="gate"`
   - Center content
   - Auto-advance behavior

**Validation:**
- Each component renders in stage layout
- No scrolling on any screen
- Images display as overlays
- CTA always visible

---

### Phase 3: Testing & Refinement (2-3 hours)

**Tasks:**
1. ✅ Test full quiz flow on desktop
   - Click through all 36 screens
   - Verify no scrolling
   - Verify images display correctly
   - Verify CTA visibility

2. ✅ Test on mobile breakpoints
   - iPhone SE, iPhone 14, iPhone Pro Max
   - Verify woman images hidden
   - Verify no scrolling
   - Verify content fits

3. ✅ Test edge cases
   - Long question text (does it wrap correctly?)
   - Questions with 5+ options (do they fit?)
   - Short viewport heights (iPhone SE landscape?)

4. ✅ Performance check
   - Page transitions still <100ms?
   - Image loading optimized (lazy load, priority)?

**Validation:**
- All screens pass no-scroll test
- All CTAs visible
- Images never block interaction
- Mobile experience is clean

---

### Phase 4: Polish & Documentation (1 hour)

**Tasks:**
1. ✅ Add comments to `QuizStageLayout`
2. ✅ Document variant usage in component comments
3. ✅ Update implementation report
4. ✅ Create visual regression test snapshots (optional)

---

## 7. Risk Assessment

### What Could Break?

#### Risk 1: Existing Quiz Logic Breaks

**Probability**: Low
**Impact**: High
**Mitigation**:
- Layout wrapper is purely presentational
- Does NOT modify props passed to children
- Does NOT intercept state updates
- Does NOT change API calls

**Prevention**:
- Test quiz completion flow after refactor
- Verify answers are still saved correctly
- Verify session state is preserved

---

#### Risk 2: Mobile Screens Exceed Viewport on Small Devices

**Probability**: Medium
**Impact**: High
**Mitigation**:
- Use adaptive spacing based on viewport height
- Reduce font sizes on short screens
- Reduce vertical gaps between options
- Use `overflow-y-auto` as fallback on content zone (allows emergency scrolling)

**Prevention**:
- Test on iPhone SE (smallest common screen)
- Test in landscape mode
- Set max option count per screen (if >5 options, consider scrolling as acceptable)

---

#### Risk 3: Woman Images Block Option Clicks on Small Screens

**Probability**: Low
**Impact**: High
**Mitigation**:
- Use `pointer-events: none` on overlay container
- Hide overlays on mobile entirely
- Test click targets on all screen sizes

**Prevention**:
- Add data-testid to options for automated testing
- Manually test click areas on phone

---

#### Risk 4: Transition Animations Break with New Layout

**Probability**: Low
**Impact**: Medium
**Mitigation**:
- Framer Motion animations are applied to content, not layout wrapper
- Layout wrapper is static (no entrance/exit animations)
- Existing AnimatePresence logic remains unchanged

**Prevention**:
- Test transitions after refactor
- Measure transition duration (should remain <100ms)

---

#### Risk 5: Bundle Size Increases

**Probability**: Low
**Impact**: Low
**Mitigation**:
- Layout wrapper adds ~5KB (minimal)
- No new dependencies required
- Image optimization already in place (next/image)

**Prevention**:
- Run `npm run build` after refactor
- Check bundle analysis output

---

## 8. What Will NOT Be Changed

To minimize risk and maintain stability, the following **will remain unchanged**:

### ✅ Quiz Logic (Completely Untouched)
- ❌ No changes to `useQuizState.ts`
- ❌ No changes to answer submission logic
- ❌ No changes to session management
- ❌ No changes to API routes
- ❌ No changes to Supabase schema
- ❌ No changes to event tracking

### ✅ Question Content (No Data Changes)
- ❌ No changes to seeded questions
- ❌ No changes to question text or options
- ❌ No changes to image URLs
- ❌ No changes to scoring logic (future phase)

### ✅ Component Props (Backward Compatible)
- ❌ Existing components will receive same props
- ❌ Parent components (`QuizQuestion.tsx`) will pass same data
- ❌ No breaking changes to component interfaces

### ✅ Styling Variables (Preserved)
- ✅ CTA button color remains `#F9A201`
- ✅ Figtree font remains primary font
- ✅ Gray backgrounds remain `bg-gray-50` / `bg-gray-100`
- ✅ Border radius, shadows, transitions — all preserved

### ✅ Existing Features (Remain Functional)
- ✅ Progress bar
- ✅ Section labels
- ✅ Auto-advance on single choice
- ✅ Manual CTA on multi-choice
- ✅ Likert scale tiles
- ✅ Educational inserts
- ✅ Image rendering

---

## 9. Success Criteria

This implementation will be considered successful when:

### 🎯 Primary Goals (Must Pass)
- ✅ **No vertical scrolling** on any quiz screen (desktop or mobile)
- ✅ **CTA button always visible** without scrolling
- ✅ **Woman images appear as overlays** (bottom-right, partially cropped)
- ✅ **Images never block option clicks**
- ✅ **All question types use consistent layout system**

### 🎯 Secondary Goals (Should Pass)
- ✅ Mobile experience is clean (woman images hidden on <640px)
- ✅ Transitions remain fast (<100ms)
- ✅ Quiz logic remains functional (no regressions)
- ✅ Code is maintainable (clear component boundaries)

### 🎯 Quality Metrics (Nice to Have)
- ✅ Bundle size increase <5KB
- ✅ Layout wrapper reusable for future screen types
- ✅ Responsive spacing adapts to viewport height
- ✅ Visual consistency across all 36 screens

---

## 10. Next Steps (After Approval)

Once this proposal is reviewed and approved:

1. **Create feature branch**: `feature/viewport-controlled-layout`
2. **Implement Phase 1**: Layout infrastructure (QuizStageLayout, OverlayImage, hooks)
3. **Implement Phase 2**: Refactor all question components
4. **Implement Phase 3**: Testing on desktop + mobile
5. **Implement Phase 4**: Polish + documentation
6. **Create PR**: Request QA review
7. **Merge to master**: Deploy to staging
8. **User acceptance testing**: Validate on real devices

**Estimated Total Time**: 8-10 hours of focused development

---

## 11. Visual Reference

### Current Problem (Before)
```
┌────────────────────────────┐
│ Progress bar               │
├────────────────────────────┤
│ Question text              │
│                            │
│ [Woman image]              │  ← Pushes content down
│                            │
│                            │
│ Option 1                   │
│ Option 2                   │
│ Option 3                   │
│ Option 4                   │
├────────────────────────────┤
│ [CTA button]               │  ← Below fold, requires scroll
└────────────────────────────┘
      ↓ Scroll required
```

### Proposed Solution (After)
```
┌────────────────────────────┐
│ Progress bar               │  ← Fixed header (always visible)
├────────────────────────────┤
│ Question text              │
│                            │
│ Option 1    [Woman →]      │  ← Overlay, doesn't push content
│ Option 2    [image  ]      │
│ Option 3    [overlay]      │
│ Option 4                   │
│                            │
├────────────────────────────┤
│ [CTA button]               │  ← Fixed footer (always visible)
└────────────────────────────┘
      ↑ Total height = 100vh (no scroll)
```

### Screenshot Analysis (Provided by User)

From the screenshot, I observe:
- ✅ Progress bar at top (thin, ~6px height)
- ✅ Section label "Tělesné signály" centered below progress
- ✅ Question text centered, bold
- ✅ 4 options on left side with emoji icons
- ✅ Woman image in bottom-right corner
- ✅ Image partially cropped at right edge (cutout effect)
- ✅ Image does NOT push options down
- ✅ Clean white background
- ✅ All content fits in single viewport

**This confirms the layout architecture proposed above is correct.**

---

## 12. Conclusion

The proposed **Stage Layout System** will:
- ✅ Eliminate scrolling by enforcing viewport-controlled steps
- ✅ Reproduce the visual design from screenshots (woman images as overlays)
- ✅ Normalize layout behavior across all question types
- ✅ Maintain mobile responsiveness without breaking layout
- ✅ Preserve existing quiz logic and functionality
- ✅ Create a reusable, maintainable architecture

**This proposal is ready for review and approval.**

Once approved, implementation can begin immediately following the phased plan outlined above.

---

**Document Status**: ✅ Complete — Awaiting Approval
**Next Action**: Review with stakeholder → Approve → Begin Phase 1 implementation
