# Better Lady - Quiz Offer Page - PIXEL-PERFECT STYLING GUIDE

## 📋 Overview

**Page Name:** Quiz - Offer Page  
**Figma URL:** https://www.figma.com/design/oo0TlCTqEEoWBpx5RAsI15/Untitled?node-id=1-2  
**Framework:** Next.js with TypeScript  
**Styling:** Tailwind CSS  
**Language:** Czech (CS)  
**Page Type:** Landing/Offer Page with countdown timer

---

## 🎯 QUICK REFERENCE - EXACT COLOR VALUES

> **DEVELOPER NOTE:** Use these EXACT hex/rgba values. Do NOT approximate or guess colors.

### Complete Color Palette

```css
/* === PRIMARY COLORS === */
--color-primary-green: #327455;
--color-primary-green-transparent: rgba(50, 116, 85, 0.12);
--color-cta-orange: #F9A201;        /* ⚠️ CTA BUTTONS ARE ORANGE, NOT GREEN! */
--color-cta-orange-light: #FFFAEF;

/* === BACKGROUND COLORS === */
--color-bg-white: #FFFFFF;
--color-bg-page: #FFFFFF;
--color-bg-card-gray: #F6F6F6;
--color-bg-card-mint: #E6EEEB;
--color-bg-badge-pink: #FFD2D2;
--color-bg-badge-mint: #D2EBE0;
--color-bg-yellow: #FFD021;
--color-bg-light-gray: #F5F5F5;
--color-bg-black: #140C0C;

/* === TEXT COLORS === */
--color-text-primary: #292424;      /* Main text - dark gray/black */
--color-text-white: #FFFFFF;
--color-text-gray: #949BA1;
--color-text-gray-medium: #919191;

/* === BORDER/STROKE COLORS === */
--color-border-gray-light: #E4E4E4;
--color-border-gray: #D9D9D9;
--color-border-gray-medium: #B7B7B7;
--color-border-gray-dark: #D6D6D6;
--color-border-green: #327455;
--color-border-light: #EBEBEB;

/* === SEMANTIC COLORS === */
--color-error-red: #E60000;         /* High stress indicator */
--color-success-green: #327455;
--color-warning-orange: #F9A201;

/* === OVERLAY/TRANSPARENT === */
--color-overlay-gray: rgba(132, 132, 132, 0.18);
--color-overlay-orange: rgba(208, 125, 0, 0.36);
--color-overlay-green: rgba(50, 116, 85, 0.12);

/* === GRADIENTS === */
--gradient-green-vertical: linear-gradient(180deg, rgba(50, 116, 85, 0.12) 0%, rgba(50, 116, 85, 0.03) 100%);
--gradient-yellow: linear-gradient(180deg, rgba(255, 224, 61, 1) 0%, rgba(255, 206, 30, 1) 100%);
--gradient-white-fade: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%);
```

---

## 📝 TYPOGRAPHY - EXACT SPECIFICATIONS

> **DEVELOPER NOTE:** All measurements are in pixels. Line-height is expressed as em multiplier.

**Font Family:** Figtree (Google Fonts)  
**Import:** `import { Figtree } from 'next/font/google'`

### Complete Typography System

```typescript
// Typography Style Definitions (from Figma)
const typography = {
  // === HEADINGS ===
  heading_large: {
    fontFamily: 'Figtree',
    fontWeight: 700,
    fontSize: '28px',
    lineHeight: '1.1em',
    textAlign: 'center'
  },
  
  heading_medium: {
    fontFamily: 'Figtree',
    fontWeight: 700,
    fontSize: '24px',
    lineHeight: '1.1em'
  },
  
  heading_section: {
    fontFamily: 'Figtree',
    fontWeight: 700,
    fontSize: '22px',
    lineHeight: '1.4em'
  },
  
  heading_card: {
    fontFamily: 'Figtree',
    fontWeight: 700,
    fontSize: '20px',
    lineHeight: '1.1em'
  },
  
  heading_small: {
    fontFamily: 'Figtree',
    fontWeight: 700,
    fontSize: '18px',
    lineHeight: '1.1em'
  },
  
  // === BODY TEXT ===
  body_bold: {
    fontFamily: 'Figtree',
    fontWeight: 700,
    fontSize: '16px',
    lineHeight: '1.1em'
  },
  
  body_bold_relaxed: {
    fontFamily: 'Figtree',
    fontWeight: 700,
    fontSize: '16px',
    lineHeight: '1.4em'
  },
  
  body_regular: {
    fontFamily: 'Figtree',
    fontWeight: 400,
    fontSize: '16px',
    lineHeight: '1.1em'
  },
  
  body_regular_relaxed: {
    fontFamily: 'Figtree',
    fontWeight: 400,
    fontSize: '16px',
    lineHeight: '1.4em'
  },
  
  body_medium: {
    fontFamily: 'Figtree',
    fontWeight: 500,
    fontSize: '16px',
    lineHeight: '1.1em'
  },
  
  // === SMALL TEXT ===
  text_small_bold: {
    fontFamily: 'Figtree',
    fontWeight: 700,
    fontSize: '15px',
    lineHeight: '1em'
  },
  
  text_small_regular: {
    fontFamily: 'Figtree',
    fontWeight: 400,
    fontSize: '15px',
    lineHeight: '1.4em'
  },
  
  text_small: {
    fontFamily: 'Figtree',
    fontWeight: 400,
    fontSize: '14px',
    lineHeight: '1em'
  },
  
  text_badge: {
    fontFamily: 'Figtree',
    fontWeight: 700,
    fontSize: '14px',
    lineHeight: '1em'
  },
  
  text_tiny: {
    fontFamily: 'Figtree',
    fontWeight: 400,
    fontSize: '12px',
    lineHeight: '1em'
  },
  
  text_tiny_medium: {
    fontFamily: 'Figtree',
    fontWeight: 700,
    fontSize: '12px',
    lineHeight: '1.1em'
  },
  
  text_micro: {
    fontFamily: 'Figtree',
    fontWeight: 400,
    fontSize: '10px',
    lineHeight: '1.1em'
  },
  
  // === SPECIAL ===
  button_text: {
    fontFamily: 'Figtree',
    fontWeight: 800,
    fontSize: '16px',
    lineHeight: '1em',
    textTransform: 'uppercase'
  },
  
  countdown_large: {
    fontFamily: 'Figtree',
    fontWeight: 800,
    fontSize: '18px',
    lineHeight: '1.1em'
  },
  
  promo_code: {
    fontFamily: 'Figtree',
    fontWeight: 400,
    fontSize: '15px',
    lineHeight: '1em'
  }
};
```

---

## 🎨 TAILWIND CONFIGURATION

> **DEVELOPER NOTE:** Add this to your `tailwind.config.js` file.

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary
        'primary-green': '#327455',
        'primary-green-light': 'rgba(50, 116, 85, 0.12)',
        'cta-orange': '#F9A201',
        'cta-orange-light': '#FFFAEF',
        
        // Backgrounds
        'bg-card-gray': '#F6F6F6',
        'bg-card-mint': '#E6EEEB',
        'bg-badge-pink': '#FFD2D2',
        'bg-badge-mint': '#D2EBE0',
        'bg-yellow': '#FFD021',
        'bg-light-gray': '#F5F5F5',
        
        // Text
        'text-dark': '#292424',
        'text-gray': '#949BA1',
        'text-gray-medium': '#919191',
        
        // Borders
        'border-light': '#EBEBEB',
        'border-gray-light': '#E4E4E4',
        'border-gray': '#D9D9D9',
        'border-gray-medium': '#B7B7B7',
        'border-gray-dark': '#D6D6D6',
        'border-green': '#327455',
        
        // Semantic
        'error-red': '#E60000',
      },
      fontFamily: {
        figtree: ['Figtree', 'sans-serif'],
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '10px',
      },
      boxShadow: {
        'cta': '0px 0px 6.7px 0px rgba(0, 0, 0, 0.09)',
      },
      backgroundImage: {
        'gradient-green': 'linear-gradient(180deg, rgba(50, 116, 85, 0.12) 0%, rgba(50, 116, 85, 0.03) 100%)',
        'gradient-yellow': 'linear-gradient(180deg, rgba(255, 224, 61, 1) 0%, rgba(255, 206, 30, 1) 100%)',
      },
    },
  },
}
```

---

## 🧩 COMPONENT SPECIFICATIONS - EXACT STYLING

### 1. ⏰ Countdown Timer Banner (Top of Page)

**Figma Reference:** Frame 28144 (ID: 1:4)

```tsx
// Component Structure
<div className="w-full flex flex-col items-center gap-1 py-4">
  <p className="text-text-dark text-[16px] font-medium leading-[1.1em] text-center">
    30% sleva je rezervovaná na:
  </p>
  <div className="text-text-dark text-[16px] font-medium leading-[1.1em]">
    {' '}10:00
  </div>
</div>
```

**Exact Styling:**
- Background: White (page background)
- Text color: `#292424` (text-dark)
- Font size: 16px
- Font weight: 500 (medium)
- Line height: 1.1em
- Text align: center
- Gap between elements: 4px (gap-1)

---

### 2. 🔵 Primary CTA Button

**Figma Reference:** Frame 28111 & Frame 28242 (ID: 1:7, 1:9)

```tsx
<button className="w-full bg-cta-orange hover:bg-[#E09201] active:scale-[0.98] text-white font-extrabold text-[16px] leading-[1em] uppercase py-4 px-8 rounded-lg shadow-cta transition-all">
  CHCI SVŮJ PLÁN
</button>
```

**Exact Styling:**
- ⚠️ **CRITICAL:** Background is **ORANGE (#F9A201)** NOT green!
- Text color: White `#FFFFFF`
- Font weight: 800 (extrabold)
- Font size: 16px
- Line height: 1em
- Text transform: UPPERCASE
- Border radius: 10px
- Padding: 16px vertical, 32px horizontal
- Box shadow: `0px 0px 6.7px 0px rgba(0, 0, 0, 0.09)`
- Width: 100% (full width)
- Hover: Darken to `#E09201`
- Active: scale(0.98)

---

### 3. 🏷️ Status Badges

#### Badge: "Dnes" (Today)
**Figma Reference:** Frame 28134 (ID: 1:11)

```tsx
<div className="inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-bg-badge-pink rounded-[6px]">
  <span className="text-text-dark font-bold text-[15px] leading-[1em]">
    Dnes
  </span>
</div>
```

**Exact Styling:**
- Background: `#FFD2D2` (light pink)
- Text color: `#292424` (dark)
- Font weight: 700 (bold)
- Font size: 15px
- Line height: 1em
- Border radius: 6px
- Padding: 10px horizontal, 12px vertical
- Gap: 8px

#### Badge: "Tvůj cíl" (Your Goal)
**Figma Reference:** Frame 28134 (ID: 1:13)

```tsx
<div className="inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-primary-green rounded-[6px]">
  <span className="text-white font-bold text-[15px] leading-[1em]">
    Tvůj cíl
  </span>
</div>
```

**Exact Styling:**
- Background: `#327455` (primary green)
- Text color: `#FFFFFF` (white)
- Font weight: 700 (bold)
- Font size: 15px
- Line height: 1em
- Border radius: 6px
- Padding: 10px horizontal, 12px vertical

---

### 4. 📊 Stress Level Cards

#### Card: Current State (High Stress)
**Figma Reference:** Frame 28221 (ID: 1:17)

```tsx
<div className="flex flex-col gap-4 p-5 w-[246px] bg-bg-card-gray rounded-lg">
  {/* Header Row */}
  <div className="flex items-center justify-between gap-1 w-full">
    <span className="text-text-dark font-bold text-[16px] leading-[1.1em]">
      Úroveň stresu
    </span>
    <div className="inline-flex items-center justify-center gap-2 px-2 py-1.5 bg-bg-badge-pink border-[1.5px] border-error-red rounded-[6px]">
      <span className="text-error-red font-bold text-[14px] leading-[1em]">
        Vysoká
      </span>
    </div>
  </div>
  
  {/* Divider */}
  <div className="w-full h-0 border-t border-border-gray-light"></div>
  
  {/* Energy Level Row */}
  <div className="flex flex-col gap-2.5 w-full">
    <div className="flex flex-col gap-1 w-full">
      <span className="text-text-dark font-bold text-[16px] leading-[1.1em]">
        Hladina energie
      </span>
      <span className="text-text-dark font-normal text-[14px] leading-[1em]">
        Nízká
      </span>
    </div>
    
    {/* Energy indicator SVG placeholder */}
    <div className="flex items-stretch gap-1 w-full h-[3px]">
      {/* Add energy bar SVG here */}
    </div>
  </div>
  
  {/* Divider */}
  <div className="w-full h-0 border-t border-border-gray-light"></div>
  
  {/* Confidence Level Row */}
  <div className="flex flex-col gap-1.5 w-full">
    <div className="flex flex-col gap-1 w-full">
      <span className="text-text-dark font-bold text-[16px] leading-[1.1em]">
        Úroveň sebevědomí
      </span>
      <span className="text-text-dark font-normal text-[14px] leading-[1em]">
        Nízká
      </span>
    </div>
  </div>
</div>
```

**Exact Styling:**
- Background: `#F6F6F6` (light gray)
- Width: 246px
- Border radius: 10px
- Padding: 16px horizontal, 20px vertical
- Gap between sections: 16px
- Divider: 1px solid `#E4E4E4`
- High stress badge background: `#FFD2D2` with `#E60000` border (1.5px)
- High stress text: `#E60000` (red)

#### Card: Goal State (Low Stress)
**Figma Reference:** Frame 28220 (ID: 1:126)

```tsx
<div className="flex flex-col gap-4 p-5 w-[246px] bg-bg-card-gray rounded-lg">
  {/* Header Row */}
  <div className="flex items-center justify-between gap-1 w-full">
    <span className="text-text-dark font-bold text-[16px] leading-[1.1em]">
      Úroveň stresu
    </span>
    <div className="inline-flex items-center justify-center gap-2 px-2 py-1.5 bg-bg-badge-mint border-[1.5px] border-primary-green rounded-[6px]">
      <span className="text-primary-green font-bold text-[14px] leading-[1em]">
        Nízká
      </span>
    </div>
  </div>
  
  {/* Divider */}
  <div className="w-full h-0 border-t border-border-gray-light"></div>
  
  {/* Energy Level Row */}
  <div className="flex flex-col gap-2.5 w-full">
    <div className="flex flex-col gap-1 w-full">
      <span className="text-text-dark font-bold text-[16px] leading-[1.1em]">
        Hladina energie
      </span>
      <span className="text-text-dark font-normal text-[14px] leading-[1em]">
        Vysoká
      </span>
    </div>
    
    {/* Energy indicator SVG placeholder */}
    <div className="flex items-stretch gap-1 w-full h-[3px]">
      {/* Add energy bar SVG here */}
    </div>
  </div>
  
  {/* Divider */}
  <div className="w-full h-0 border-t border-border-gray-light"></div>
  
  {/* Confidence Level Row */}
  <div className="flex flex-col gap-1.5 w-full">
    <div className="flex flex-col gap-1 w-full">
      <span className="text-text-dark font-bold text-[16px] leading-[1.1em]">
        Úroveň sebevědomí
      </span>
      <span className="text-text-dark font-normal text-[14px] leading-[1em]">
        Vysoká
      </span>
    </div>
  </div>
</div>
```

**Exact Styling:**
- Background: `#F6F6F6` (light gray)
- Width: 246px
- Low stress badge background: `#D2EBE0` (light mint) with `#327455` border (1.5px)
- Low stress text: `#327455` (green)
- Rest same as high stress card

---

### 5. ❌ Problems List Card

**Figma Reference:** Frame 28252 (ID: 1:40)

```tsx
<div className="flex flex-col gap-5 p-6 bg-bg-card-gray rounded-lg">
  <h3 className="text-text-dark font-bold text-[20px] leading-[1.1em]">
    Jak může vypadat život bez Better Lady
  </h3>
  
  <div className="flex flex-col gap-3">
    {problems.map((problem, index) => (
      <div key={index} className="flex items-start gap-3">
        {/* Gray checkmark icon */}
        <div className="w-6 h-6 flex-shrink-0 mt-0.5">
          {/* SVG Icon */}
        </div>
        <span className="text-text-dark font-normal text-[16px] leading-[1.1em]">
          {problem}
        </span>
      </div>
    ))}
  </div>
</div>
```

**Problems List:**
1. Pocity viny, když nejsi produktivní
2. Scrollování na sociálních sítích uprostřed rozdělaného úkolu
3. Pocity stresu, když máš zrovna volný čas
4. Pocit, že v práci pořád jen něco doháníš
5. Neustálé kontrolování telefonu, zda ti nepřišla zpráva nebo e-mail
6. Nedostatek času na péči o sebe
7. Problémy s regenerací a odpočinkem
8. Pocit únavy a přehlcení během dne

**Exact Styling:**
- Background: `#F6F6F6`
- Border radius: 10px
- Padding: 24px
- Gap between title and list: 20px
- Gap between list items: 12px
- Icon size: 24px × 24px
- Icon color: Gray (use `#B7B7B7` or `#D9D9D9`)
- Text font size: 16px
- Text line height: 1.1em

---

### 6. ✅ Solutions List Card

**Figma Reference:** Frame 28253 (ID: 1:83)

```tsx
<div className="flex flex-col gap-5 p-6 bg-bg-card-mint border-[1.5px] border-primary-green rounded-lg">
  <h3 className="text-text-dark font-bold text-[20px] leading-[1.1em]">
    S čím ti Better Lady může pomoci
  </h3>
  
  <div className="flex flex-col gap-3">
    {solutions.map((solution, index) => (
      <div key={index} className="flex items-start gap-3">
        {/* Green checkmark icon */}
        <div className="w-6 h-6 flex-shrink-0 mt-0.5">
          {/* SVG Icon in green #327455 */}
        </div>
        <span className="text-text-dark font-normal text-[16px] leading-[1.1em]">
          {solution}
        </span>
      </div>
    ))}
  </div>
</div>
```

**Solutions List:**
1. Nepřetržité soustředění a koncentrace
2. Vyšší hladina energie
3. Lepší kvalita spánku a pravidelný spánkový režim
4. Emoční stabilita
5. Konec výčitek při relaxaci
6. Efektivní výkon v práci
7. Stabilní rutina v péči o sebe
8. Život bez stresu a napětí

**Exact Styling:**
- Background: `#E6EEEB` (light mint)
- Border: 1.5px solid `#327455` (green)
- Border radius: 10px
- Padding: 24px
- Gap between sections: 20px
- Icon color: `#327455` (green)
- Rest same as problems list

---

### 7. 🏷️ Promo Code Section

**Figma Reference:** Group 28005 (ID: 1:154)

```tsx
<div className="flex flex-col items-center gap-6 relative">
  {/* Tag with text */}
  <div className="flex items-center gap-2">
    {/* Tag icon SVG */}
    <span className="text-text-dark font-bold text-[20px] leading-[1.1em]">
      Tvůj slevový kód je uplatněn!
    </span>
  </div>
  
  {/* Divider line */}
  <div className="w-full h-0 border-t-[1.5px] border-primary-green"></div>
  
  {/* Promo code box */}
  <div className="flex items-center gap-3 px-6 py-4 bg-white border-[1.5px] border-primary-green rounded-lg">
    {/* Checkmark icon */}
    <div className="w-6 h-6">
      {/* SVG */}
    </div>
    <span className="text-text-dark font-normal text-[15px] leading-[1em]">
      {DYNAMIC_PROMO_KOD}
    </span>
  </div>
  
  {/* Countdown timer */}
  <div className="flex flex-col items-center gap-2 px-6 py-4 bg-primary-green-light rounded-lg">
    <div className="flex items-center gap-2">
      <span className="text-primary-green font-extrabold text-[18px] leading-[1.1em]">
        10
      </span>
      <span className="text-primary-green font-extrabold text-[18px] leading-[1.1em]">
        :
      </span>
      <span className="text-primary-green font-extrabold text-[18px] leading-[1.1em]">
        00
      </span>
    </div>
    <div className="flex gap-4">
      <span className="text-text-dark font-normal text-[12px] leading-[1em]">
        minut
      </span>
      <span className="text-text-dark font-normal text-[12px] leading-[1em]">
        sekund
      </span>
    </div>
  </div>
</div>
```

**Exact Styling:**
- Promo code box:
  - Background: White `#FFFFFF`
  - Border: 1.5px solid `#327455`
  - Border radius: 10px
  - Padding: 16px 24px
- Countdown box:
  - Background: `rgba(50, 116, 85, 0.12)`
  - Border radius: 8px
  - Timer numbers: `#327455`, 800 weight, 18px
  - Labels: `#292424`, 400 weight, 12px
- Divider: 1.5px solid `#327455`

---

### 8. 🎯 Plan Info Cards (Trigger & Goal)

**Figma Reference:** Frame 28232 (ID: 1:180)

```tsx
<div className="flex gap-4">
  {/* Hlavní spouštěč */}
  <div className="flex items-start gap-4">
    <div className="w-12 h-12 bg-bg-card-mint rounded-lg flex items-center justify-center flex-shrink-0">
      {/* Brain icon SVG */}
    </div>
    <div className="flex flex-col gap-1">
      <span className="text-text-dark font-normal text-[14px] leading-[1em]">
        Hlavní spouštěč
      </span>
      <span className="text-text-dark font-bold text-[16px] leading-[1em]">
        Stres
      </span>
    </div>
  </div>
  
  {/* Cíl plánu */}
  <div className="flex items-start gap-4">
    <div className="w-12 h-12 bg-bg-card-mint rounded-lg flex items-center justify-center flex-shrink-0">
      {/* Target icon SVG */}
    </div>
    <div className="flex flex-col gap-1">
      <span className="text-text-dark font-normal text-[14px] leading-[1em]">
        Cíl plánu
      </span>
      <span className="text-text-dark font-bold text-[16px] leading-[1em]">
        Reset nervového systému
      </span>
    </div>
  </div>
</div>
```

**Exact Styling:**
- Icon container:
  - Size: 48px × 48px
  - Background: `#E6EEEB` (light mint)
  - Border radius: 10px
- Label text: 14px, 400 weight, `#292424`
- Value text: 16px, 700 weight, `#292424`
- Gap between icon and text: 16px

---

### 9. 📋 Plan Features List

**Figma Reference:** Frame 28247 (ID: 1:202)

```tsx
<div className="flex flex-col gap-4">
  {features.map((feature, index) => (
    <div key={index} className="flex items-start gap-4">
      <div className="w-12 h-12 bg-bg-card-gray rounded-lg flex-shrink-0">
        {/* Feature icon */}
      </div>
      <span className="text-text-dark font-normal text-[16px] leading-[1.4em]">
        {feature}
      </span>
    </div>
  ))}
</div>
```

**Features List:**
1. Osobní plán den po dni – sestavený na míru tvým spouštěčům a projevům stresu
2. Techniky zaměřené na praxi – rychlá a účinná cvičení, která hladce zapadnou do tvého dne
3. Tvá okamžitá opora v kapse – nástroje pro rychlé zklidnění dostupné 24/7, aby ti pomohly přesně tehdy, kdy to nejvíc potřebuješ
4. Nulové nároky na vybavení – všechna cvičení jsou navržena tak, aby ti stačila jen vlastní mysl a tělo
5. Ověřený obsah založený na datech – vědecky podložené informace pro spolehlivé a efektivní výsledky

**Exact Styling:**
- Icon container:
  - Size: 48px × 48px
  - Background: `#F6F6F6`
  - Border radius: 10px
- Text: 16px, 400 weight for body, 700 weight for emphasized parts
- Line height: 1.4em (relaxed)
- Gap: 16px between items

---

### 10. 🎓 Course Module Cards

**Figma Reference:** Frame 28231 (ID: 1:240), Frame 28277 (ID: 1:246)

```tsx
<div className="flex items-start gap-4">
  {/* Module number badge */}
  <div className="w-12 h-12 bg-bg-card-mint rounded-lg flex items-center justify-center flex-shrink-0">
    <span className="text-primary-green font-bold text-[28px] leading-[1.1em]">
      {moduleNumber}
    </span>
  </div>
  
  {/* Module content */}
  <div className="flex flex-col gap-2">
    <h3 className="text-text-dark font-bold text-[22px] leading-[1.4em]">
      {moduleTitle}
    </h3>
    <p className="text-text-dark font-normal text-[16px] leading-[1.4em]">
      {moduleDescription}
    </p>
  </div>
</div>
```

**Exact Styling:**
- Number badge:
  - Size: 48px × 48px
  - Background: `#E6EEEB`
  - Border radius: 10px
  - Number color: `#327455`, 700 weight, 28px
- Title: 22px, 700 weight, line-height 1.4em
- Description: 16px, 400 weight, line-height 1.4em

---

### 11. 📢 Headings & Text Elements

#### Main Page Heading
```tsx
<h1 className="text-text-dark font-bold text-[28px] leading-[1.1em] text-center">
  Tvůj personalizovaný plán vnitřního klidu je připraven!
</h1>
```
- Font size: 28px
- Font weight: 700
- Line height: 1.1em
- Text align: center
- Color: `#292424`

#### Section Headings
```tsx
<h2 className="text-text-dark font-bold text-[20px] leading-[1.1em]">
  To nejdůležitější z tvého plánu
</h2>
```
- Font size: 20px
- Font weight: 700
- Line height: 1.1em

#### Social Proof Text
```tsx
<p className="text-text-dark font-bold text-[28px] leading-[1.1em] text-center">
  Více než 59 žen začalo dnes svůj plán s Metodou vnitřního klidu™!
</p>
```

---

## 📐 Layout & Spacing

### Container Specifications
```tsx
<div className="w-full max-w-[1000px] mx-auto px-6 py-8">
  {/* Page content */}
</div>
```

**Page-level:**
- Max width: 1000px
- Content width (mobile): 500px
- Horizontal padding: 24px
- Vertical spacing: 32px between major sections

### Common Spacing Values
```typescript
const spacing = {
  xs: '4px',    // gap-1
  sm: '8px',    // gap-2
  md: '12px',   // gap-3
  lg: '16px',   // gap-4
  xl: '20px',   // gap-5
  '2xl': '24px',// gap-6
  '3xl': '32px',// gap-8
};
```

---

## 📱 Responsive Breakpoints

```tsx
// Mobile first approach
{
  // Mobile: < 768px
  'base': {
    width: '100%',
    padding: '16px',
    fontSize: 'base'
  },
  
  // Tablet: 768px+
  'md': {
    width: '768px',
    padding: '24px',
    gridCols: 2
  },
  
  // Desktop: 1024px+
  'lg': {
    width: '1000px',
    padding: '32px',
    gridCols: 2
  }
}
```

---

## ⚡ Critical Developer Notes

### 🚨 COMMON MISTAKES TO AVOID:

1. **CTA Button Color:**
   - ❌ WRONG: Background `#327455` (green)
   - ✅ CORRECT: Background `#F9A201` (ORANGE)

2. **Text Colors:**
   - Main text is NOT black, it's `#292424` (dark gray)
   - Use exact hex values, don't approximate

3. **Border Radius:**
   - Small elements (badges): 6px
   - Medium elements (cards): 8-10px
   - Use exact values from design

4. **Font Weights:**
   - Regular: 400
   - Medium: 500
   - Bold: 700
   - Extrabold: 800
   - Don't substitute weights

5. **Line Heights:**
   - Most text: 1.1em (tight)
   - Relaxed text: 1.4em
   - Use em units, not rem or px

---

## 🎯 Testing Checklist

- [ ] CTA buttons are ORANGE (#F9A201), not green
- [ ] All text uses exact `#292424` color, not pure black
- [ ] Badge backgrounds match exact colors (pink: #FFD2D2, green: #327455, mint: #D2EBE0)
- [ ] Border colors use `#E4E4E4` for light borders
- [ ] Card backgrounds use `#F6F6F6` or `#E6EEEB`
- [ ] Font sizes match exactly (28px, 20px, 16px, 14px, 12px)
- [ ] Font weights are correct (400, 500, 700, 800)
- [ ] Line heights use em units (1.1em, 1.4em)
- [ ] Border radius values (6px, 8px, 10px)
- [ ] Spacing between elements matches (4px, 8px, 12px, 16px, 20px, 24px)
- [ ] Countdown timer shows correct colors and formatting
- [ ] High stress badge: pink background with red border
- [ ] Low stress badge: mint background with green border

---

## 📦 Complete Implementation Example

```tsx
// Example: Complete CTA Button Component
export const CTAButton = () => {
  return (
    <button 
      className="
        w-full 
        bg-[#F9A201] 
        hover:bg-[#E09201] 
        active:scale-[0.98] 
        text-white 
        font-extrabold 
        text-[16px] 
        leading-[1em] 
        uppercase 
        py-4 
        px-8 
        rounded-[10px] 
        shadow-[0px_0px_6.7px_0px_rgba(0,0,0,0.09)]
        transition-all 
        duration-200
      "
    >
      CHCI SVŮJ PLÁN
    </button>
  );
};

// Example: Status Badge Component
export const StatusBadge = ({ type, children }) => {
  const styles = {
    today: 'bg-[#FFD2D2] text-[#292424]',
    goal: 'bg-[#327455] text-white'
  };
  
  return (
    <div className={`
      inline-flex 
      items-center 
      justify-center 
      gap-2 
      px-3 
      py-2.5 
      rounded-[6px] 
      ${styles[type]}
    `}>
      <span className="font-bold text-[15px] leading-[1em]">
        {children}
      </span>
    </div>
  );
};

// Example: Stress Level Card Component
export const StressLevelCard = ({ level = 'high' }) => {
  const isHigh = level === 'high';
  
  return (
    <div className="flex flex-col gap-4 p-5 w-[246px] bg-[#F6F6F6] rounded-[10px]">
      <div className="flex items-center justify-between gap-1 w-full">
        <span className="text-[#292424] font-bold text-[16px] leading-[1.1em]">
          Úroveň stresu
        </span>
        <div className={`
          inline-flex 
          items-center 
          justify-center 
          gap-2 
          px-2 
          py-1.5 
          rounded-[6px] 
          border-[1.5px]
          ${isHigh 
            ? 'bg-[#FFD2D2] border-[#E60000] text-[#E60000]' 
            : 'bg-[#D2EBE0] border-[#327455] text-[#327455]'
          }
        `}>
          <span className="font-bold text-[14px] leading-[1em]">
            {isHigh ? 'Vysoká' : 'Nízká'}
          </span>
        </div>
      </div>
      
      <div className="w-full h-0 border-t border-[#E4E4E4]"></div>
      
      <div className="flex flex-col gap-2.5 w-full">
        <div className="flex flex-col gap-1 w-full">
          <span className="text-[#292424] font-bold text-[16px] leading-[1.1em]">
            Hladina energie
          </span>
          <span className="text-[#292424] font-normal text-[14px] leading-[1em]">
            {isHigh ? 'Nízká' : 'Vysoká'}
          </span>
        </div>
      </div>
      
      <div className="w-full h-0 border-t border-[#E4E4E4]"></div>
      
      <div className="flex flex-col gap-1.5 w-full">
        <div className="flex flex-col gap-1 w-full">
          <span className="text-[#292424] font-bold text-[16px] leading-[1.1em]">
            Úroveň sebevědomí
          </span>
          <span className="text-[#292424] font-normal text-[14px] leading-[1em]">
            {isHigh ? 'Nízká' : 'Vysoká'}
          </span>
        </div>
      </div>
    </div>
  );
};
```

---

## 🔗 Resources

- **Figma File:** [View Design](https://www.figma.com/design/oo0TlCTqEEoWBpx5RAsI15/Untitled?node-id=1-2)
- **Font:** [Figtree on Google Fonts](https://fonts.google.com/specimen/Figtree)
- **Tailwind CSS:** [Documentation](https://tailwindcss.com/docs)
- **Next.js:** [Documentation](https://nextjs.org/docs)

---

## 📊 Color Reference Table (Quick Lookup)

| Element | Background | Text Color | Border | Notes |
|---------|-----------|------------|--------|-------|
| **Page** | `#FFFFFF` | `#292424` | - | Main container |
| **CTA Button** | `#F9A201` | `#FFFFFF` | - | ⚠️ ORANGE not green! |
| **Badge "Dnes"** | `#FFD2D2` | `#292424` | - | Light pink |
| **Badge "Tvůj cíl"** | `#327455` | `#FFFFFF` | - | Primary green |
| **Card Gray** | `#F6F6F6` | `#292424` | - | Light gray |
| **Card Mint** | `#E6EEEB` | `#292424` | `#327455` 1.5px | Accent card |
| **High Stress Badge** | `#FFD2D2` | `#E60000` | `#E60000` 1.5px | Red alert |
| **Low Stress Badge** | `#D2EBE0` | `#327455` | `#327455` 1.5px | Green success |
| **Divider** | - | - | `#E4E4E4` 1px | Light gray line |
| **Timer BG** | `rgba(50,116,85,0.12)` | `#327455` | - | Transparent green |

---

**Document Version:** 2.0 - PIXEL-PERFECT STYLING  
**Last Updated:** February 1, 2026  
**Prepared for:** Developer Implementation with Exact Specifications

**⚠️ CRITICAL:** This document contains EXACT values from Figma. Do NOT approximate or guess colors. Use the exact hex codes provided.
