# Better Lady - Quiz Offer Page Design Specification

## 📋 Overview

**Page Name:** Quiz - Offer Page  
**Figma URL:** https://www.figma.com/design/oo0TlCTqEEoWBpx5RAsI15/Untitled?node-id=1-2  
**Framework:** Next.js with TypeScript  
**Styling:** Tailwind CSS  
**Language:** Czech (CS)  
**Page Type:** Landing/Offer Page with countdown timer

---

## 🎨 Design System

### Color Palette

```css
/* Primary Colors */
--primary-green: #327455 (rgb(50, 116, 85))
--primary-green-light: rgba(50, 116, 85, 0.12)
--primary-green-lighter: rgba(50, 116, 85, 0.03)

/* Neutral Colors */
--white: #FFFFFF
--gray-light: #EAEAEA (rgb(234, 234, 234))
--gray-medium: rgba(234, 234, 234, 0.5)
--dark: #292424

/* Semantic Colors */
--error-red: #FF0000 (implied for high stress)
--success-green: #327455
--background-card: rgba(234, 234, 234, 0.2)
```

### Typography

**Font Family:** Figtree (Google Font)

```css
/* Heading Styles */
.heading-large {
  font-family: 'Figtree', sans-serif;
  font-weight: 700;
  font-size: 32px;
  line-height: 1.2em;
}

.heading-medium {
  font-family: 'Figtree', sans-serif;
  font-weight: 700;
  font-size: 24px;
  line-height: 1.3em;
}

.heading-small {
  font-family: 'Figtree', sans-serif;
  font-weight: 600;
  font-size: 18px;
  line-height: 1.4em;
}

/* Body Text */
.body-regular {
  font-family: 'Figtree', sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.5em;
}

.body-medium {
  font-family: 'Figtree', sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.5em;
}

.body-bold {
  font-family: 'Figtree', sans-serif;
  font-weight: 700;
  font-size: 16px;
  line-height: 1.5em;
}

/* Small Text */
.text-small {
  font-family: 'Figtree', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.4em;
}

/* Button Text */
.button-text {
  font-family: 'Figtree', sans-serif;
  font-weight: 700;
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

### Spacing System

```css
/* Use Tailwind spacing or custom scale */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
--spacing-3xl: 64px;
```

### Border Radius

```css
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 10px;
```

---

## 📐 Layout Structure

### Container
- **Max Width:** 1000px (500px effective width for mobile-first)
- **Padding:** 24px horizontal
- **Background:** White

### Page Sections (Top to Bottom)

1. **Countdown Timer Header**
2. **Hero Section with Stress Level Cards**
3. **Before/After Comparison Cards**
4. **Plan Details Section**
5. **Benefits Lists**
6. **Plan Features**
7. **Testimonials Section**
8. **CTA Section**

---

## 🧩 Component Specifications

### 1. Countdown Timer Banner

**Location:** Top of page  
**Layout:** Row with center alignment

**Structure:**
```tsx
<div className="bg-linear-to-b from-green-light to-green-lighter p-6 text-center">
  <p className="text-dark text-sm mb-2">30% sleva je rezervovaná na:</p>
  <div className="text-4xl font-bold text-primary-green">10:00</div>
</div>
```

**Specifications:**
- Background: Linear gradient (180deg) from `rgba(50, 116, 85, 0.12)` to `rgba(50, 116, 85, 0.03)`
- Text alignment: Center
- Timer format: MM:SS
- Font size for timer: 48px, bold

### 2. Primary CTA Button

**Text:** "CHCI SVŮJ PLÁN"  
**Appears:** Multiple times throughout the page

```tsx
<button className="w-full bg-primary-green text-white py-4 px-8 rounded-lg font-bold uppercase hover:bg-primary-green-dark transition-colors">
  CHCI SVŮJ PLÁN
</button>
```

**Specifications:**
- Background: `#327455`
- Text: White, uppercase, bold
- Padding: 16px vertical, 32px horizontal
- Border radius: 10px
- Width: Full width on mobile, auto on desktop
- Hover state: Slightly darker green
- Box shadow: `0px 0px 6.7px 0px rgba(0, 0, 0, 0.09)`

### 3. Status Badges

**Types:**
- "Dnes" (Today) - Background: Light gray
- "Tvůj cíl" (Your Goal) - Background: Primary green

```tsx
<span className="inline-flex items-center px-4 py-2 rounded-md bg-gray-light text-dark text-sm font-medium">
  Dnes
</span>

<span className="inline-flex items-center px-4 py-2 rounded-md bg-primary-green text-white text-sm font-medium">
  Tvůj cíl
</span>
```

**Specifications:**
- Border radius: 6px
- Padding: 8px 16px
- Font size: 14px
- Font weight: 600

### 4. Stress Level Cards

**Two Card Variants:**

#### Card 1: Current State (High Stress)
```tsx
<div className="bg-card-background p-6 rounded-lg border border-gray-light">
  <div className="flex items-center justify-between mb-4">
    <span className="text-base font-medium">Úroveň stresu</span>
    <span className="px-3 py-1 rounded-md bg-gray-light border border-gray text-sm text-red">
      Vysoká
    </span>
  </div>
  
  <div className="border-t border-gray-light my-4"></div>
  
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <span className="text-base font-medium">Hladina energie</span>
      <span className="text-sm">Nízká</span>
    </div>
    
    <div className="border-t border-gray-light"></div>
    
    <div className="flex items-center justify-between">
      <span className="text-base font-medium">Úroveň sebevědomí</span>
      <span className="text-sm">Nízká</span>
    </div>
  </div>
</div>
```

#### Card 2: Goal State (Low Stress)
- Same structure, different values:
  - Úroveň stresu: **Nízká** (green badge)
  - Hladina energie: **Vysoká**
  - Úroveň sebevědomí: **Vysoká**

**Specifications:**
- Background: `rgba(234, 234, 234, 0.2)`
- Border: 1px solid gray-light
- Border radius: 10px
- Padding: 24px
- Dividers: 1px solid gray-light

### 5. Problems List (Jak může vypadat život bez Better Lady)

```tsx
<div className="bg-card-background p-6 rounded-lg">
  <h3 className="text-xl font-bold mb-6">Jak může vypadat život bez Better Lady</h3>
  
  <ul className="space-y-4">
    {problems.map((problem, index) => (
      <li key={index} className="flex items-start gap-3">
        <IconCheck className="w-6 h-6 text-gray shrink-0 mt-1" />
        <span className="text-base">{problem}</span>
      </li>
    ))}
  </ul>
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

**Specifications:**
- Background: `rgba(234, 234, 234, 0.2)`
- Border radius: 10px
- Icon: SVG checkmark (gray)
- Spacing between items: 16px

### 6. Solutions List (S čím ti Better Lady může pomoci)

```tsx
<div className="bg-linear-to-b from-green-light to-transparent p-6 rounded-lg border border-green">
  <h3 className="text-xl font-bold mb-6">S čím ti Better Lady může pomoci</h3>
  
  <ul className="space-y-4">
    {solutions.map((solution, index) => (
      <li key={index} className="flex items-start gap-3">
        <IconCheckGreen className="w-6 h-6 text-primary-green shrink-0 mt-1" />
        <span className="text-base">{solution}</span>
      </li>
    ))}
  </ul>
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

**Specifications:**
- Background: Gradient + border accent
- Border: 1px solid `#327455`
- Border radius: 10px
- Icon: SVG checkmark (green)

### 7. Promo Code Section

```tsx
<div className="relative bg-white border border-gray-light rounded-lg p-6">
  <div className="flex items-center gap-2 mb-4">
    <IconTag className="w-5 h-5 text-primary-green" />
    <span className="font-medium">Tvůj slevový kód je uplatněn!</span>
  </div>
  
  <div className="bg-white border border-gray-light rounded-lg p-4 flex items-center gap-3">
    <IconCheck className="w-6 h-6" />
    <span className="font-bold text-lg">{DYNAMIC_PROMO_KOD}</span>
  </div>
  
  <div className="bg-linear-to-r from-gray-light to-gray-medium rounded-lg p-4 mt-4">
    <div className="flex items-center justify-center gap-2">
      <span className="text-3xl font-bold text-primary-green">10:00</span>
    </div>
    <div className="flex justify-center gap-4 text-xs text-gray-600 mt-1">
      <span>minut</span>
      <span>sekund</span>
    </div>
  </div>
</div>
```

**Specifications:**
- Dynamic promo code display
- Countdown timer integration
- Border radius: 10px
- Box shadow: subtle

### 8. Plan Info Cards

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="flex items-start gap-4 bg-gradient p-4 rounded-lg">
    <div className="w-12 h-12 bg-green rounded-lg flex items-center justify-center shrink-0">
      <IconBrain className="w-6 h-6 text-white" />
    </div>
    <div>
      <h4 className="font-medium text-sm mb-1">Hlavní spouštěč</h4>
      <p className="text-lg font-bold">Stres</p>
    </div>
  </div>
  
  <div className="flex items-start gap-4 bg-gradient p-4 rounded-lg">
    <div className="w-12 h-12 bg-green rounded-lg flex items-center justify-center shrink-0">
      <IconTarget className="w-6 h-6 text-white" />
    </div>
    <div>
      <h4 className="font-medium text-sm mb-1">Cíl plánu</h4>
      <p className="text-lg font-bold">Reset nervového systému</p>
    </div>
  </div>
</div>
```

### 9. Plan Features List

**Features with icons:**
1. Osobní plán den po dni – sestavený na míru tvým spouštěčům a projevům stresu
2. Techniky zaměřené na praxi – rychlá a účinná cvičení, která hladce zapadnou do tvého dne
3. Tvá okamžitá opora v kapse – nástroje pro rychlé zklidnění dostupné 24/7
4. Nulové nároky na vybavení – všechna cvičení jsou navržena tak, aby ti stačila jen vlastní mysl a tělo
5. Ověřený obsah založený na datech – vědecky podložené informace

```tsx
<div className="space-y-4">
  {features.map((feature, index) => (
    <div key={index} className="flex items-start gap-4 p-4 bg-card-background rounded-lg">
      <div className="w-12 h-12 bg-card rounded-lg shrink-0" />
      <p className="text-base">{feature}</p>
    </div>
  ))}
</div>
```

### 10. Course Modules

**Module structure:**

```tsx
<div className="flex items-start gap-4 mb-6">
  <div className="w-12 h-12 bg-gradient rounded-lg flex items-center justify-center shrink-0">
    <span className="text-2xl font-bold text-primary-green">{moduleNumber}</span>
  </div>
  <div>
    <h3 className="text-xl font-bold mb-2">{moduleTitle}</h3>
    <p className="text-base text-gray-600">{moduleDescription}</p>
  </div>
</div>
```

**Modules:**

**Module 1:**
- Title: "Detox stresu: Cesta k vnitřnímu klidu"
- Description: "Lekce krok za krokem, hluboká regenerace a nástroje pro okamžité zklidnění."

**Module 2:**
- Title: "Osobní mapa vnitřního světa"
- Description: (Would need to read more of the file)

**Module 3:**
- Title: (Visible in data)
- Description: (Would need to read more)

### 11. Social Proof Section

**Heading:** "Více než 59 žen začalo dnes svůj plán s Metodou vnitřního klidu™!"

```tsx
<div className="text-center py-8">
  <h2 className="text-2xl font-bold mb-2">
    Více než 59 žen začalo dnes svůj plán s Metodou vnitřního klidu™!
  </h2>
</div>
```

### 12. Testimonials Section

**Heading:** "Pár slov od našich studentek"

Structure for testimonial cards - would need additional design details from images.

---

## 🖼️ Image Assets Required

### SVG Icons/Graphics
1. **Vector 7** - Decorative background element
2. **Vector 8, 9, 10, 11** - Divider/separator lines
3. **Checkmark icons** (2 variants: gray and green)
4. **Tag icon** - For promo code section
5. **Brain/Head icons** - For plan triggers
6. **Target icon** - For plan goals
7. **Feature icons** - 5 different icons for plan features

### Raster Images
1. **4-stadia-stresu 9** - Stress stages image 1
2. **4-stadia-stresu 10** - Stress stages image 2
3. **Circular progress indicators** - 3 SVG-based circular progress bars with gradients
4. **Energy level indicator** - SVG graphic
5. **Self-confidence indicator** - SVG graphic

### Image Specifications
- Format: SVG for icons, PNG/WebP for photos
- Export scale for PNGs: 2x (@2x retina)
- Optimization: Compress all images

---

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
sm: 640px   /* Small devices */
md: 768px   /* Tablets */
lg: 1024px  /* Desktops */
xl: 1280px  /* Large screens */
```

### Mobile (< 768px)
- Single column layout
- Full-width buttons
- Stack cards vertically
- Reduce padding: 16px
- Font sizes: Scale down by 0.875

### Tablet (768px - 1023px)
- 2 column grid for comparison cards
- Maintain spacing
- Adapt font sizes

### Desktop (>= 1024px)
- Max width container: 1000px
- Center content
- 2-3 column grids where appropriate
- Increase padding: 24px

---

## 🎯 Interactive Elements

### 1. Countdown Timer
**Functionality:**
- Real-time countdown
- Format: MM:SS
- Updates every second
- Expires after 10:00 minutes
- Optional: Add urgency animation when < 2 minutes

**Implementation:**
```tsx
const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

useEffect(() => {
  const timer = setInterval(() => {
    setTimeLeft(prev => Math.max(0, prev - 1));
  }, 1000);
  
  return () => clearInterval(timer);
}, []);

const minutes = Math.floor(timeLeft / 60);
const seconds = timeLeft % 60;
```

### 2. CTA Buttons
**States:**
- Default
- Hover: Slightly darker background
- Active/Pressed: Even darker + scale(0.98)
- Focus: Outline ring

### 3. Promo Code
**Dynamic Value:**
- Variable: `{DYNAMIC PROMO KOD}`
- Format: All caps
- Should be copy-able
- Add "Copy" button on hover

---

## 🚀 Implementation Notes

### 1. Next.js Structure
```
/app
  /quiz-offer
    page.tsx           # Main page component
    /components
      CountdownTimer.tsx
      StressLevelCard.tsx
      ProblemsList.tsx
      SolutionsList.tsx
      PlanFeatures.tsx
      CTAButton.tsx
      PromoCode.tsx
      TestimonialCard.tsx
    /hooks
      useCountdown.ts
    /utils
      constants.ts     # Text content, lists
```

### 2. Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'primary-green': '#327455',
        'primary-green-light': 'rgba(50, 116, 85, 0.12)',
        'card-bg': 'rgba(234, 234, 234, 0.2)',
      },
      fontFamily: {
        figtree: ['Figtree', 'sans-serif'],
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '10px',
      },
    },
  },
}
```

### 3. Font Import
```tsx
// app/layout.tsx
import { Figtree } from 'next/font/google'

const figtree = Figtree({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-figtree',
})
```

### 4. Content Constants
```typescript
// utils/constants.ts
export const PROBLEMS = [
  'Pocity viny, když nejsi produktivní',
  'Scrollování na sociálních sítích uprostřed rozdělaného úkolu',
  // ... rest of problems
];

export const SOLUTIONS = [
  'Nepřetržité soustředění a koncentrace',
  'Vyšší hladina energie',
  // ... rest of solutions
];

export const PLAN_FEATURES = [
  'Osobní plán den po dni – sestavený na míru tvým spouštěčům a projevům stresu',
  // ... rest of features
];
```

### 5. Accessibility
- Add ARIA labels to all interactive elements
- Ensure color contrast ratios meet WCAG AA standards
- Add alt text to all images
- Make countdown timer screen reader friendly
- Keyboard navigation support
- Focus indicators visible

### 6. Performance Optimization
- Use Next.js Image component for all images
- Lazy load below-the-fold content
- Optimize fonts with `font-display: swap`
- Minimize layout shift (CLS)
- Preload critical assets

---

## 📊 Content Hierarchy

1. **Above the fold:**
   - Countdown timer
   - Main headline: "Tvůj personalizovaný plán vnitřního klidu je připraven!"
   - Primary CTA button
   - Promo code display

2. **Mid-page:**
   - Current state vs Goal state comparison
   - Plan details
   - Problems and solutions lists

3. **Below the fold:**
   - Plan features
   - Module breakdown
   - Social proof
   - Testimonials
   - Final CTA

---

## ✅ Development Checklist

- [ ] Set up Next.js project with TypeScript
- [ ] Install and configure Tailwind CSS
- [ ] Add Figtree font from Google Fonts
- [ ] Create component structure
- [ ] Implement countdown timer functionality
- [ ] Build stress level comparison cards
- [ ] Add problems and solutions lists
- [ ] Implement promo code section
- [ ] Create plan features section
- [ ] Add module breakdown cards
- [ ] Implement testimonials section
- [ ] Add all CTA buttons with proper tracking
- [ ] Export and optimize all SVG assets from Figma
- [ ] Export and optimize all raster images
- [ ] Implement responsive design for all breakpoints
- [ ] Add hover and focus states
- [ ] Test accessibility with screen reader
- [ ] Optimize performance (Lighthouse score > 90)
- [ ] Add analytics tracking
- [ ] Test on multiple devices and browsers
- [ ] Implement SEO meta tags

---

## 📝 Additional Notes

1. **Dynamic Content:** The promo code should be dynamically generated/fetched
2. **Timer Persistence:** Consider using localStorage to persist timer across page refreshes
3. **Analytics:** Track CTA clicks, time on page, scroll depth
4. **A/B Testing:** Consider variants for different urgency levels
5. **Localization:** All content is in Czech - ensure proper character encoding
6. **Legal:** Add terms, privacy policy links if needed

---

## 🔗 Resources

- Figma File: [View Design](https://www.figma.com/design/oo0TlCTqEEoWBpx5RAsI15/Untitled?node-id=1-2)
- Font: [Figtree on Google Fonts](https://fonts.google.com/specimen/Figtree)
- Next.js Docs: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs

---

**Document Version:** 1.0  
**Last Updated:** February 1, 2026  
**Prepared for:** Developer Implementation
