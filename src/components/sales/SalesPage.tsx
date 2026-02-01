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
import { FeaturesSection } from './FeaturesSection';
import { Testimonials } from './Testimonials';
import { FaqSection } from './FaqSection';
import { GuaranteeBox } from './GuaranteeBox';
import { SalesPageFooter } from './SalesPageFooter';
import {
  PRICING_PLANS,
  PLAN_HIGHLIGHTS,
  getRecommendedPlan,
  getPlanById,
} from '@/config/sales-page.config';
import { CheckoutModal } from '../checkout/CheckoutModal';

/**
 * Main Sales/Offer Page Component
 * Phase 2: Connected to usePostQuizState for dynamic data
 */
export function SalesPage() {
  const router = useRouter();
  const { completeData, funnelData } = usePostQuizState();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  // If no quiz data, redirect back to quiz
  if (!completeData || !completeData.insights) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#F9A201] mx-auto" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Načítání tvého plánu...
          </h2>
          <p className="text-gray-600 mb-6">
            Pokud se stránka nenačte, prosím vrať se k dotazníku.
          </p>
          <button
            onClick={() => router.push('/q/better-lady')}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
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

  // Extract main challenge from insight cards (first card is main challenge)
  const mainChallenge = insights.insightCards?.[0]?.value || 'Vnitřní klid';

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
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <StickyHeader />

      {/* Transformation Display - Two cards side-by-side */}
      <div className="py-8 px-4 bg-white">
        <TransformationDisplay
          firstName={firstName}
          currentStressStage={insights.stressStage}
          currentScore={projection.displayCurrentScore}
          targetScore={projection.displayTargetScore}
          stageTitle={insights.stageTitle}
        />
      </div>

      {/* Pricing Section - Below the cards */}
      <div id="pricing-section" className="py-8 px-4 bg-white">
        <PricingSection
          plans={PRICING_PLANS}
          recommendedPlanId={recommendedPlanId}
          onPlanSelect={handlePlanSelect}
        />
      </div>

      {/* Plan Highlights */}
      <PlanHighlights highlights={PLAN_HIGHLIGHTS} mainChallenge={mainChallenge} />

      {/* Social Proof Stats */}
      <SocialProofStats />

      {/* Pain Points */}
      <PainPointsList />

      {/* Gains Checklist */}
      <GainsChecklist />

      {/* Curriculum */}
      <CurriculumSection />

      {/* Features */}
      <FeaturesSection />

      {/* Testimonials */}
      <Testimonials />

      {/* FAQ */}
      <FaqSection />

      {/* Guarantee */}
      <GuaranteeBox />

      {/* Final CTA Section */}
      <section className="py-16 px-4 bg-linear-to-b from-purple-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Jsi připravená začít svou transformaci?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Připoj se k tisícům žen, které už změnily svůj život. Začni ještě dnes.
          </p>
          <button
            onClick={scrollToPricing}
            className="inline-block px-12 py-5 bg-gradient-to-r from-[#F9A201] to-orange-500 text-white text-xl font-bold rounded-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all"
          >
            CHCI ZAČÍT HNED 🚀
          </button>
          <p className="text-sm text-gray-500 mt-4">
            ✓ Začni během 2 minut • ✓ 30denní záruka vrácení peněz
          </p>
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
