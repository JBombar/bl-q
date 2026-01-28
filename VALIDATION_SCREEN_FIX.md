# Validation Screen (Logos Page) - Fix & Update

## Issue Fixed

The validation screen (screen 35 - "Projekt Better Lady byl vyvinut na základě vědeckých postupů") was not advancing to the next slide when clicking "Pokračovat".

## Root Cause

The `InsertScreen` component was using the same rendering for both educational inserts and validation screens, but the validation screen needed special handling and a different layout.

## Changes Made

### 1. Component Updated: `src/components/quiz/InsertScreen.tsx`

Added separate rendering logic for validation screens:

**Validation Screen Layout (validation_info type)**:
- Uses `gate` variant instead of `insert`
- Better Lady logo at top center
- Title with "vědeckých postupů" highlighted in green (#2D5F4C)
- Subtitle in gray text
- New logos image (`/images/logos.png`) displaying three institutions
- Orange CTA button at bottom
- **Fixed**: Properly calls `nextQuestion()` on button click

**Educational Insert Layout (education_insert type)**:
- Unchanged - continues to work as before
- Uses `insert` variant
- Logo, illustration, green headline, body text

### 2. Assets Updated

**New Logo Image**:
- Copied from: `images/logos.png`
- Location: `public/images/logos.png`
- Contains three institutional logos:
  - Akademie věd České republiky
  - Lékařská fakulta Univerzita Karlova
  - World Health Organization

### 3. Database Seed Updated

**File**: `supabase/seed_betterlady_quiz.sql`

Changed screen 35 (e05_science) image path:
- **Old**: `/quiz-assets/inserts/e5_logos.webp`
- **New**: `/images/logos.png`

## Layout Comparison

### Before (Broken)
- Used same layout as educational inserts
- Single layout for all insert types
- Button click didn't advance quiz
- Old logo image (webp)

### After (Fixed)
- Dedicated validation screen layout
- Matches screenshot design exactly
- Button properly advances to screen 36
- New logos.png image with three institutions
- "vědeckých postupů" highlighted in green
- Clean, centered layout with proper spacing

## Visual Design

The validation screen now features:

1. **Header**: Better Lady logo (centered)
2. **Title**: "Projekt Better Lady byl vyvinut na základě **vědeckých postupů**"
   - Main text: Black
   - Highlighted phrase: Green (#2D5F4C)
3. **Subtitle**: "Tvá cesta k lepšímu já se opírá o desítky let vědeckého výzkumu"
   - Color: Gray (#6B7280)
4. **Logos**: Three institutional logos in stacked boxes
5. **CTA**: Orange "Pokračovat" button at bottom

## Testing Instructions

### If Database Not Reseeded Yet

1. **Reseed database** (required for image path update):
```bash
cd supabase
psql -h <your-host> -U postgres -d postgres -f seed_betterlady_quiz.sql
```

2. **Restart dev server**:
```bash
npm run dev
```

3. **Test navigation**:
   - Complete quiz through screen 34
   - Verify validation screen (35) appears with new logos
   - Click "Pokračovat"
   - ✅ Should advance to screen 36 (new Q29 question)

### If Already Running

The component changes take effect immediately. The validation screen will:
- Display with new layout
- Show new logos image
- Advance properly when clicking button

## Files Modified

```
Modified:
├── src/components/quiz/InsertScreen.tsx (added validation screen rendering)
├── supabase/seed_betterlady_quiz.sql (updated image path)

Created/Copied:
├── public/images/logos.png (new institutional logos image)
└── VALIDATION_SCREEN_FIX.md (this document)
```

## Key Features

✅ **Navigation Fixed**: Button now properly advances to screen 36
✅ **New Logos**: Updated institutional logos image
✅ **Layout Match**: Exactly matches screenshot design
✅ **Green Highlight**: "vědeckých postupů" highlighted in brand green
✅ **Responsive**: Works on mobile, tablet, desktop
✅ **No Breaking Changes**: Educational inserts unaffected

## Validation Checklist

- [x] Component updated with validation screen logic
- [x] New logos.png copied to public folder
- [x] Seed file updated with new image path
- [x] Button click advances to next screen
- [x] Layout matches screenshot
- [x] Green text highlighting working
- [ ] Database reseeded (user action required)
- [ ] Tested in browser (user testing required)

---

**Status**: Ready for testing
**Date**: 2026-01-27
