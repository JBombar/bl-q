/**
 * Sales Page Content Constants
 * Content from figma_design.md specification
 * These are the exact texts for the sales/offer page UI
 */

// ============================================================================
// PROBLEMS LIST - "Jak může vypadat život bez Better Lady"
// ============================================================================

export const PROBLEMS: string[] = [
  'Pocity viny, když nejsi produktivní',
  'Scrollování na sociálních sítích uprostřed rozdělaného úkolu',
  'Pocity stresu, když máš zrovna volný čas',
  'Pocit, že v práci pořád jen něco doháníš',
  'Neustálé kontrolování telefonu, zda ti nepřišla zpráva nebo e-mail',
  'Nedostatek času na péči o sebe',
  'Problémy s regenerací a odpočinkem',
  'Pocit únavy a přehlcení během dne',
];

// ============================================================================
// SOLUTIONS LIST - "S čím ti Better Lady může pomoci"
// ============================================================================

export const SOLUTIONS: string[] = [
  'Nepřetržité soustředění a koncentrace',
  'Vyšší hladina energie',
  'Lepší kvalita spánku a pravidelný spánkový režim',
  'Emoční stabilita',
  'Konec výčitek při relaxaci',
  'Efektivní výkon v práci',
  'Stabilní rutina v péči o sebe',
  'Život bez stresu a napětí',
];

// ============================================================================
// PLAN FEATURES
// ============================================================================

export const PLAN_FEATURES: string[] = [
  'Osobní plán den po dni – sestavený na míru tvým spouštěčům a projevům stresu',
  'Techniky zaměřené na praxi – rychlá a účinná cvičení, která hladce zapadnou do tvého dne',
  'Tvá okamžitá opora v kapse – nástroje pro rychlé zklidnění dostupné 24/7',
  'Nulové nároky na vybavení – všechna cvičení jsou navržena tak, aby ti stačila jen vlastní mysl a tělo',
  'Ověřený obsah založený na datech – vědecky podložené informace',
];

// ============================================================================
// COURSE MODULES
// ============================================================================

export interface CourseModule {
  number: number;
  title: string;
  description: string;
}

export const COURSE_MODULES: CourseModule[] = [
  {
    number: 1,
    title: 'Detox stresu: Cesta k vnitřnímu klidu',
    description: 'Lekce krok za krokem, hluboká regenerace a nástroje pro okamžité zklidnění.',
  },
  {
    number: 2,
    title: 'Osobní mapa vnitřního světa',
    description: 'Poznávání tvých vzorců, spouštěčů a cest k vnitřní rovnováze.',
  },
  {
    number: 3,
    title: 'Síla každodenních rituálů',
    description: 'Budování udržitelných návyků pro dlouhodobý klid a pohodu.',
  },
];

// ============================================================================
// PLAN INFO CARDS
// ============================================================================

export interface PlanInfoCard {
  icon: 'brain' | 'target';
  label: string;
  value: string;
}

export const PLAN_INFO_CARDS: PlanInfoCard[] = [
  {
    icon: 'brain',
    label: 'Hlavní spouštěč',
    value: 'Stres',
  },
  {
    icon: 'target',
    label: 'Cíl plánu',
    value: 'Reset nervového systému',
  },
];

// ============================================================================
// STRESS LEVEL STATES
// ============================================================================

export interface StressLevelState {
  stressLevel: 'Vysoká' | 'Nízká';
  stressLevelVariant: 'high' | 'low';
  energyLevel: 'Nízká' | 'Vysoká';
  confidenceLevel: 'Nízká' | 'Vysoká';
}

export const CURRENT_STATE: StressLevelState = {
  stressLevel: 'Vysoká',
  stressLevelVariant: 'high',
  energyLevel: 'Nízká',
  confidenceLevel: 'Nízká',
};

export const GOAL_STATE: StressLevelState = {
  stressLevel: 'Nízká',
  stressLevelVariant: 'low',
  energyLevel: 'Vysoká',
  confidenceLevel: 'Vysoká',
};

// ============================================================================
// COUNTDOWN TIMER CONFIG
// ============================================================================

export const COUNTDOWN_TIMER = {
  durationSeconds: 600, // 10 minutes
  discountText: '30% sleva je rezervovaná na:',
};

// ============================================================================
// CTA BUTTON TEXT
// ============================================================================

export const CTA_BUTTON_TEXT = 'CHCI SVŮJ PLÁN';

// ============================================================================
// SOCIAL PROOF
// ============================================================================

export const SOCIAL_PROOF_TEXT = 'Více než 59 žen začalo dnes svůj plán s Metodou vnitřního klidu™!';

// ============================================================================
// SECTION HEADINGS
// ============================================================================

export const SECTION_HEADINGS = {
  problemsList: 'Jak může vypadat život bez Better Lady',
  solutionsList: 'S čím ti Better Lady může pomoci',
  testimonials: 'Pár slov od našich studentek',
  hero: 'Tvůj personalizovaný plán vnitřního klidu je připraven!',
};

// ============================================================================
// PROMO CODE
// ============================================================================

export const PROMO_CODE = {
  appliedText: 'Tvůj slevový kód je uplatněn!',
  timerLabels: {
    minutes: 'minut',
    seconds: 'sekund',
  },
};

// ============================================================================
// STATUS BADGES
// ============================================================================

export const STATUS_BADGES = {
  today: 'Dnes',
  goal: 'Tvůj cíl',
};

// ============================================================================
// STRESS CARD LABELS
// ============================================================================

export const STRESS_CARD_LABELS = {
  stressLevel: 'Úroveň stresu',
  energyLevel: 'Hladina energie',
  confidenceLevel: 'Úroveň sebevědomí',
};
