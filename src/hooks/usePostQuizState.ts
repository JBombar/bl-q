import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  FunnelScreen,
  FunnelMetadata,
  QuizCompleteResponse,
  FunnelUpdateRequest,
  TimeCommitmentMinutes,
  MicroCommitmentKey,
} from '@/types/funnel.types';
import { getNextScreen } from '@/config/result-screens.config';
import type { PricingTier } from '@/config/pricing.config';

interface PostQuizState {
  // Current screen in the funnel
  currentScreen: FunnelScreen;

  // Complete response from /api/quiz/complete
  completeData: QuizCompleteResponse | null;

  // Funnel data (synced with server)
  funnelData: FunnelMetadata;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Pricing tier management
  pricingTier: PricingTier;
  timerExpired: boolean;
  checkoutCanceled: boolean;
  selectedPlanId: string | null;

  // Subscription IDs (persisted after checkout)
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;

  // Shared countdown timer state
  timerStartedAt: number | null;
  timerDurationSeconds: number;

  // Actions
  initialize: (data: QuizCompleteResponse) => void;
  setScreen: (screen: FunnelScreen) => void;
  goToNextScreen: () => void;
  saveTimeCommitment: (minutes: TimeCommitmentMinutes) => Promise<void>;
  saveMicroCommitment: (key: MicroCommitmentKey, value: boolean) => Promise<void>;
  saveEmail: (email: string) => Promise<void>;
  saveFirstName: (firstName: string) => Promise<void>;
  sendPlanEmail: () => Promise<boolean>;
  completeFunnel: () => Promise<void>;
  reset: () => void;

  // Pricing tier actions
  setPricingTier: (tier: PricingTier) => void;
  handleTimerExpired: () => void;
  handleCheckoutCanceled: () => void;
  setSelectedPlanId: (planId: string) => void;
  setSubscriptionIds: (stripeSubscriptionId: string, stripeCustomerId: string) => void;

  // Timer actions
  initializeTimer: (durationSeconds: number) => void;
  getTimeRemaining: () => number;
}

export const usePostQuizState = create<PostQuizState>()(
  persist(
    (set, get) => ({
      currentScreen: 'A',
      completeData: null,
      funnelData: {},
      isLoading: false,
      isSaving: false,
      error: null,

      // Pricing tier state (default to FIRST_DISCOUNT)
      pricingTier: 'FIRST_DISCOUNT' as PricingTier,
      timerExpired: false,
      checkoutCanceled: false,
      selectedPlanId: null,

      // Subscription IDs
      stripeSubscriptionId: null,
      stripeCustomerId: null,

      // Timer state
      timerStartedAt: null,
      timerDurationSeconds: 600, // 10 minutes default

  /**
   * Initialize with data from /api/quiz/complete
   * Resumes from saved funnel step if available
   */
  initialize: (data: QuizCompleteResponse) => {
    const funnelState = data.funnelState || {};
    const resumeScreen = funnelState.funnelStep || 'A';

    set({
      completeData: data,
      funnelData: funnelState,
      currentScreen: resumeScreen,
      error: null,
    });
  },

  /**
   * Set current screen directly
   */
  setScreen: (screen: FunnelScreen) => {
    set({ currentScreen: screen });
  },

  /**
   * Navigate to next screen in funnel
   */
  goToNextScreen: () => {
    const { currentScreen } = get();
    const nextScreen = getNextScreen(currentScreen);
    if (nextScreen) {
      set({ currentScreen: nextScreen as FunnelScreen });
    }
  },

  /**
   * Save time commitment (Screen B)
   */
  saveTimeCommitment: async (minutes: TimeCommitmentMinutes) => {
    set({ isSaving: true, error: null });
    try {
      const response = await fetch('/api/quiz/funnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'B',
          timeCommitmentMinutes: minutes,
        } as FunnelUpdateRequest),
      });

      if (!response.ok) throw new Error('Failed to save time commitment');

      const data = await response.json();

      set(state => ({
        funnelData: { ...state.funnelData, ...data.funnelState, timeCommitmentMinutes: minutes },
        isSaving: false,
      }));

      get().goToNextScreen();
    } catch (error: any) {
      set({ error: error.message, isSaving: false });
      throw error;
    }
  },

  /**
   * Save micro-commitment answer (Screens C1-C3)
   */
  saveMicroCommitment: async (key: MicroCommitmentKey, value: boolean) => {
    const { currentScreen, funnelData } = get();
    set({ isSaving: true, error: null });

    try {
      const response = await fetch('/api/quiz/funnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: currentScreen,
          microCommitment: { key, value },
        } as FunnelUpdateRequest),
      });

      if (!response.ok) throw new Error('Failed to save micro-commitment');

      const data = await response.json();

      set(state => ({
        funnelData: {
          ...state.funnelData,
          ...data.funnelState,
          microCommitments: {
            ...state.funnelData.microCommitments,
            [key]: value,
          },
        },
        isSaving: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isSaving: false });
      throw error;
    }
  },

  /**
   * Save email (Screen D)
   */
  saveEmail: async (email: string) => {
    set({ isSaving: true, error: null });

    try {
      const response = await fetch('/api/quiz/funnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'D',
          email,
        } as FunnelUpdateRequest),
      });

      if (!response.ok) throw new Error('Failed to save email');

      const data = await response.json();

      set(state => ({
        funnelData: { ...state.funnelData, ...data.funnelState, email },
        isSaving: false,
      }));

      get().goToNextScreen();
    } catch (error: any) {
      set({ error: error.message, isSaving: false });
      throw error;
    }
  },

  /**
   * Save first name (Screen E)
   */
  saveFirstName: async (firstName: string) => {
    set({ isSaving: true, error: null });

    try {
      const response = await fetch('/api/quiz/funnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'E',
          firstName,
        } as FunnelUpdateRequest),
      });

      if (!response.ok) throw new Error('Failed to save name');

      const data = await response.json();

      set(state => ({
        funnelData: { ...state.funnelData, ...data.funnelState, firstName },
        isSaving: false,
      }));

      // Don't auto-advance here - we trigger email first
    } catch (error: any) {
      set({ error: error.message, isSaving: false });
      throw error;
    }
  },

  /**
   * Send plan email (after Screen E)
   * Returns true if email was sent, false if it failed (but doesn't block funnel)
   */
  sendPlanEmail: async () => {
    try {
      const response = await fetch('/api/quiz/send-plan-email', {
        method: 'POST',
      });

      const data = await response.json();
      return data.success && data.emailSent;
    } catch (error) {
      console.error('Failed to send plan email:', error);
      return false; // Don't block funnel
    }
  },

  /**
   * Mark funnel as complete
   */
  completeFunnel: async () => {
    set({ isSaving: true, error: null });

    try {
      const response = await fetch('/api/quiz/funnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'complete',
        } as FunnelUpdateRequest),
      });

      if (!response.ok) throw new Error('Failed to complete funnel');

      const data = await response.json();

      set(state => ({
        funnelData: { ...state.funnelData, ...data.funnelState },
        currentScreen: 'complete',
        isSaving: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isSaving: false });
      throw error;
    }
  },

      /**
       * Reset state
       */
      reset: () => {
        set({
          currentScreen: 'A',
          completeData: null,
          funnelData: {},
          isLoading: false,
          isSaving: false,
          error: null,
          pricingTier: 'FIRST_DISCOUNT' as PricingTier,
          timerExpired: false,
          checkoutCanceled: false,
          selectedPlanId: null,
          stripeSubscriptionId: null,
          stripeCustomerId: null,
        });
      },

      /**
       * Set pricing tier directly
       */
      setPricingTier: (tier: PricingTier) => {
        set({ pricingTier: tier });
      },

      /**
       * Handle timer expiration - upgrades to FULL_PRICE unless MAX_DISCOUNT is active
       */
      handleTimerExpired: () => {
        const { checkoutCanceled } = get();
        // MAX_DISCOUNT (from checkout cancel) takes precedence over timer expiration
        if (!checkoutCanceled) {
          set({ timerExpired: true, pricingTier: 'FULL_PRICE' });
        }
      },

      /**
       * Handle checkout cancellation - applies MAX_DISCOUNT (best offer)
       */
      handleCheckoutCanceled: () => {
        set({ checkoutCanceled: true, pricingTier: 'MAX_DISCOUNT' });
      },

      /**
       * Set selected plan ID
       */
      setSelectedPlanId: (planId: string) => {
        set({ selectedPlanId: planId });
      },

      /**
       * Set Stripe subscription and customer IDs after checkout
       */
      setSubscriptionIds: (stripeSubscriptionId: string, stripeCustomerId: string) => {
        set({ stripeSubscriptionId, stripeCustomerId });
      },

      /**
       * Initialize timer if not already started
       */
      initializeTimer: (durationSeconds: number) => {
        const { timerStartedAt } = get();
        if (!timerStartedAt) {
          set({ 
            timerStartedAt: Date.now(),
            timerDurationSeconds: durationSeconds,
          });
        }
      },

      /**
       * Get remaining time in seconds
       */
      getTimeRemaining: () => {
        const { timerStartedAt, timerDurationSeconds } = get();
        if (!timerStartedAt) return timerDurationSeconds;
        
        const elapsed = Math.floor((Date.now() - timerStartedAt) / 1000);
        const remaining = Math.max(0, timerDurationSeconds - elapsed);
        
        // Auto-expire if time's up
        if (remaining === 0 && !get().timerExpired) {
          get().handleTimerExpired();
        }
        
        return remaining;
      },
    }),
    {
      name: 'post-quiz-storage', // localStorage key
      partialize: (state) => ({
        completeData: state.completeData,
        funnelData: state.funnelData,
        currentScreen: state.currentScreen,
        pricingTier: state.pricingTier,
        timerExpired: state.timerExpired,
        checkoutCanceled: state.checkoutCanceled,
        selectedPlanId: state.selectedPlanId,
        stripeSubscriptionId: state.stripeSubscriptionId,
        stripeCustomerId: state.stripeCustomerId,
        timerStartedAt: state.timerStartedAt,
        timerDurationSeconds: state.timerDurationSeconds,
      }),
    }
  )
);
