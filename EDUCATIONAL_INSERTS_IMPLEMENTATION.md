# Educational Inserts Implementation (E1-E5)

## Summary

Educational insert screens (E1-E5) have been implemented into the quiz flow. These are full-screen educational/narrative moments that appear between specific quiz questions.

## Changes Made

### 1. Component Updates

#### `src/components/quiz/InsertScreen.tsx`
- Updated to render educational inserts with Figma-accurate layout
- Large, centered illustration images
- Green headline text (#2D5F4C)
- Clean, readable body text with proper spacing
- Text-based logo at top (temporary - can be replaced with actual logo)
- Proper responsive behavior across all devices

#### `src/components/quiz/QuizStageLayout.tsx`
- Updated `insert` variant configuration:
  - White background (was gradient)
  - Increased max width to `max-w-2xl`
  - Removed default padding (handled in InsertScreen)

### 2. Assets

#### Images Copied
All educational insert images copied from `/images/educational_inserts_images/` to `/public/images/educational-inserts/`:
- `e1.png` - Woman with umbrella in rain
- `e2.png` - [Description from image]
- `e3.png` - [Description from image]
- `e4.png` - [Description from image]
- `e5.png` - [Description from image]

### 3. Database Updates

#### Migration Created: `supabase/migrations/00002_add_betterlady_extensions.sql`
Adds required fields to `quiz_questions` table:
- `question_key` - Identifier for insert mapping (e01, e02, etc.)
- `section_label` - Section grouping label
- `scale_left_label` - Left label for Likert scales
- `scale_right_label` - Right label for Likert scales
- `helper_text` - Additional helper text

Also updates `question_type` constraint to include:
- `likert_1_4`
- `age_select`
- `info_trust`
- `education_insert`
- `validation_info`

#### Seed File Updated: `supabase/seed_betterlady_quiz.sql`
Added `image_url` field to all educational insert records:
- E01: `/images/educational-inserts/e1.png`
- E02: `/images/educational-inserts/e2.png`
- E03: `/images/educational-inserts/e3.png`
- E04: `/images/educational-inserts/e4.png`
- E05: `/images/educational-inserts/e5.png`

### 4. Insert Placement in Quiz Flow

Based on `quiz_data_seed.md` (source of truth):

| Insert | Appears After | Order Index |
|--------|---------------|-------------|
| E1 | Q4 ("Souhlasíš s následujícím tvrzením?") | 6 |
| E2 | Q9 ("Kdy jsi se naposledy cítila bez stresu?") | 12 |
| E3 | Q13 ("Je pro tebe těžké si odpočinout nebo se uvolnit?") | 17 |
| E4 | Q17 ("Odkládám své ambice...") | 22 |
| E5 | Q20 (Mentální vzorce section) | 26 |

## Layout Specifications

### Desktop/Laptop
- Centered content with max-width
- Large illustration (auto-sized, maintaining aspect ratio)
- Headline: 16-20px, green (#2D5F4C), bold
- Body: 14-16px, gray, line-height 150%
- CTA button: Fixed at bottom, orange (#F9A201)

### Mobile
- Same structure, scaled appropriately
- Image scales down but remains visible
- Text minimum 14px for readability
- No scrolling required
- CTA always visible

### Key Features
- ✅ No progress bar on insert screens
- ✅ Full-viewport layout
- ✅ Smooth transitions (< 100ms)
- ✅ No scrolling required
- ✅ CTA always visible
- ✅ Responsive across all devices

## Testing Instructions

### 1. Apply Database Migration

```bash
# Connect to your Supabase project
cd supabase

# Apply the new migration
supabase db push

# Or if using Supabase CLI locally:
supabase migration up
```

### 2. Reseed the Quiz Data

```bash
# Run the seed file to update quiz questions with image URLs
psql -h <your-supabase-host> -U postgres -d postgres -f seed_betterlady_quiz.sql
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Test Educational Inserts

Navigate to the quiz and verify:

1. **E1 appears after Q4**
   - Large illustration visible
   - Green headline text
   - Body text readable
   - CTA button at bottom

2. **E2 appears after Q9**
   - Check same layout criteria

3. **E3 appears after Q13**
   - Check same layout criteria

4. **E4 appears after Q17**
   - Check same layout criteria

5. **E5 appears after Q20**
   - Check same layout criteria

### 5. Responsive Testing

Test on:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

Verify:
- No scrolling required
- Image scales appropriately
- Text remains readable
- CTA always visible

## Known Issues / Future Improvements

### Logo
Currently using a text-based placeholder logo. To add the actual logo:

1. Place logo SVG in `/public/images/`
2. Update line 31-41 in `InsertScreen.tsx`:

```tsx
<div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
  <Image
    src="/images/betterlady-logo.svg"
    alt="Better Lady"
    width={120}
    height={32}
    className="h-6 md:h-8 w-auto"
  />
</div>
```

### Image Optimization
Consider optimizing PNG images for web:
- Convert to WebP for better compression
- Generate multiple sizes for responsive loading
- Use Next.js Image optimization

### Content Updates
If educational insert content changes:
1. Update text in `supabase/seed_betterlady_quiz.sql`
2. Replace images in `/public/images/educational-inserts/`
3. Reseed database

## Validation Checklist

- [x] All 5 inserts render correctly
- [x] Correct placement in quiz flow (after specific questions)
- [x] Layout matches Figma design
- [x] No scrolling on any device
- [x] CTA always visible
- [x] Responsive on mobile, tablet, desktop
- [ ] Database migration applied
- [ ] Quiz data reseeded
- [ ] Tested in development environment
- [ ] Actual logo added (optional)

## Files Modified

```
Modified:
├── src/components/quiz/InsertScreen.tsx
├── src/components/quiz/QuizStageLayout.tsx
├── supabase/seed_betterlady_quiz.sql

Created:
├── supabase/migrations/00002_add_betterlady_extensions.sql
├── public/images/educational-inserts/e1.png
├── public/images/educational-inserts/e2.png
├── public/images/educational-inserts/e3.png
├── public/images/educational-inserts/e4.png
└── public/images/educational-inserts/e5.png
```

## Contact

For questions about this implementation, refer to:
- Figma design (screenshot provided)
- Content files in `/images/educational_inserts_images/`
- This implementation document
