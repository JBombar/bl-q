'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { usePostQuizState } from '@/hooks/usePostQuizState';
import { calculateProjection } from '@/config/result-screens.config';
import { StickyHeader } from './StickyHeader';
import { TransformationDisplay } from './TransformationDisplay';
import { PricingSection } from './PricingSection';
import { PlanHighlights } from './PlanHighlights';
import { SocialProofStats } from './SocialProofStats';
import { PainPointsList } from './PainPointsList';
import { GainsChecklist } from './GainsChecklist';
import { CurriculumSection } from './CurriculumSection';
import { Testimonials } from './Testimonials';
import { FaqSection } from './FaqSection';
import { GuaranteeBox } from './GuaranteeBox';
import { SalesPageFooter } from './SalesPageFooter';
import { getAllPlansWithPricing, getPlanWithPricing } from '@/config/pricing.config';
import { CTA_BUTTON_TEXT, getPricingDisclaimer } from '@/config/sales-page-content';
import { CheckoutModal } from '../checkout/CheckoutModal';

/**
 * Main Sales/Offer Page Component
 * Styled according to figma_design.md specification
 * Integrates dynamic tier-based pricing
 */
export function SalesPage() {
  const router = useRouter();
  const { completeData, funnelData, pricingTier, selectedPlanId, setSelectedPlanId } = usePostQuizState();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  // Get plans with pricing for current tier - memoized to avoid recalculation
  const plansWithPricing = useMemo(() => {
    return getAllPlansWithPricing(pricingTier);
  }, [pricingTier]);

  // Get selected plan with current tier pricing
  const selectedPlanWithPricing = useMemo(() => {
    if (!selectedPlanId) return null;
    return getPlanWithPricing(selectedPlanId, pricingTier);
  }, [selectedPlanId, pricingTier]);

  // Get user email for checkout (from funnel data)
  const userEmail = funnelData.email || '';

  // If no quiz data, redirect back to quiz
  if (!completeData || !completeData.insights) {
    return (
      <div className="flex h-screen items-center justify-center bg-white font-figtree">
        <div className="text-center max-w-md p-8">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#E4E4E4] border-t-[#327455] mx-auto" />
          <h2 className="text-[20px] font-bold text-[#292424] mb-2">
            Načítání tvého plánu...
          </h2>
          <p className="text-[16px] text-[#949BA1] mb-6">
            Pokud se stránka nenačte, prosím vrať se k dotazníku.
          </p>
          <button
            onClick={() => router.push('/q/better-lady')}
            className="px-6 py-3 bg-[#327455] hover:bg-[#2a6349] text-white rounded-[10px] font-semibold transition-all"
          >
            Zpět na dotazník
          </button>
        </div>
      </div>
    );
  }

  // Extract data from quiz state
  const { insights } = completeData;
  const firstName = funnelData.firstName || 'tam';
  const timeCommitmentMinutes = funnelData.timeCommitmentMinutes || 10;

  // Calculate projection
  const projection = calculateProjection(insights.normalizedScore, timeCommitmentMinutes);

  // Handle plan selection - opens checkout modal
  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    setShowCheckoutModal(true);
  };

  // Handle successful payment
  const handlePaymentSuccess = () => {
    setShowCheckoutModal(false);
    router.push('/payment-success');
  };

  // Handle modal cancel - pricing tier will be updated by the modal itself
  const handleModalCancel = () => {
    setShowCheckoutModal(false);
    // Note: pricing tier update happens in CheckoutModal's handleCancel
  };

  // Scroll to pricing section
  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing-section');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-white font-figtree">
      {/* Sticky Header */}
      <StickyHeader />

      {/* Transformation Display - Two cards side-by-side */}
      <div className="py-8 bg-white">
        <TransformationDisplay
          firstName={firstName}
          currentStressStage={insights.stressStage}
          currentScore={projection.displayCurrentScore}
          targetScore={projection.displayTargetScore}
          stageTitle={insights.stageTitle}
        />
      </div>

      {/* Pricing Section - Below the cards */}
      <div id="pricing-section" className="py-8 bg-white">
        <PricingSection
          plans={plansWithPricing}
          onPlanSelect={handlePlanSelect}
        />
      </div>

      {/* Plan Features/Highlights */}
      <PlanHighlights />

      {/* Social Proof */}
      <SocialProofStats />

      {/* Pain Points - Problems List */}
      <PainPointsList />

      {/* Gains Checklist - Solutions List */}
      <GainsChecklist />

      {/* Course Modules */}
      <CurriculumSection />

      {/* Testimonials */}
      <Testimonials />

      {/* Second Pricing Section - Final CTA after testimonials */}
      <div className="py-8 bg-white">
        <PricingSection
          plans={plansWithPricing}
          onPlanSelect={handlePlanSelect}
        />
      </div>

      {/* FAQ */}
      <FaqSection />

      {/* Guarantee */}
      <GuaranteeBox />

      {/* Final CTA Section - ORANGE #F9A201 */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-[500px] mx-auto text-center">
          <button
            onClick={scrollToPricing}
            className="w-full py-4 bg-[#F9A201] hover:bg-[#E09201] active:scale-[0.98] text-white text-[16px] font-extrabold rounded-[10px] shadow-cta transition-all uppercase tracking-wide"
          >
            {CTA_BUTTON_TEXT}
          </button>
        </div>
      </section>

      {/* Footer */}
      <SalesPageFooter />

      {/* Checkout Modal */}
      {showCheckoutModal && selectedPlanWithPricing && (
        <CheckoutModal
          plan={selectedPlanWithPricing}
          email={userEmail}
          onSuccess={handlePaymentSuccess}
          onCancel={handleModalCancel}
        />
      )}
    </div>
  );
}
