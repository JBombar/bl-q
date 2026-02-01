'use client';

import { useState } from 'react';
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
import {
  PRICING_PLANS,
  getRecommendedPlan,
  getPlanById,
} from '@/config/sales-page.config';
import { CTA_BUTTON_TEXT } from '@/config/sales-page-content';
import { CheckoutModal } from '../checkout/CheckoutModal';

/**
 * Main Sales/Offer Page Component
 * Styled according to figma_design.md specification
 */
export function SalesPage() {
  const router = useRouter();
  const { completeData, funnelData } = usePostQuizState();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  // If no quiz data, redirect back to quiz
  if (!completeData || !completeData.insights) {
    return (
      <div className="flex h-screen items-center justify-center bg-white font-figtree">
        <div className="text-center max-w-md p-8">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-light border-t-primary-green mx-auto" />
          <h2 className="text-xl font-bold text-dark mb-2">
            Načítání tvého plánu...
          </h2>
          <p className="text-gray-600 mb-6">
            Pokud se stránka nenačte, prosím vrať se k dotazníku.
          </p>
          <button
            onClick={() => router.push('/q/better-lady')}
            className="px-6 py-3 bg-primary-green text-white rounded-lg hover:bg-opacity-90 font-semibold"
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

  // Get recommended plan based on stress stage
  const recommendedPlanId = getRecommendedPlan(insights.stressStage);

  // Handle plan selection
  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    setShowCheckoutModal(true);
  };

  // Handle successful payment
  const handlePaymentSuccess = () => {
    setShowCheckoutModal(false);
    router.push('/payment-success');
  };

  // Handle modal cancel
  const handleModalCancel = () => {
    setShowCheckoutModal(false);
    setSelectedPlanId(null);
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
          plans={PRICING_PLANS}
          recommendedPlanId={recommendedPlanId}
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

      {/* FAQ */}
      <FaqSection />

      {/* Guarantee */}
      <GuaranteeBox />

      {/* Final CTA Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-[500px] mx-auto text-center">
          <button
            onClick={scrollToPricing}
            className="w-full py-4 bg-primary-green text-white text-lg font-bold rounded-lg shadow-card hover:bg-opacity-90 transition-all uppercase tracking-wide"
          >
            {CTA_BUTTON_TEXT}
          </button>
        </div>
      </section>

      {/* Footer */}
      <SalesPageFooter />

      {/* Checkout Modal */}
      {showCheckoutModal && selectedPlanId && (
        <CheckoutModal
          plan={getPlanById(selectedPlanId)!}
          onSuccess={handlePaymentSuccess}
          onCancel={handleModalCancel}
        />
      )}
    </div>
  );
}
