'use client';

import { useState } from 'react';
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
} from '@/config/sales-page.config';

// Import types
import type { StressStage } from '@/types/funnel.types';

interface SalesPageProps {
  // Dynamic data props (will be populated in Phase 2)
  firstName?: string;
  currentStressStage?: StressStage;
  currentScore?: number;
  targetScore?: number;
  stageTitle?: string;
  mainChallenge?: string;
}

/**
 * Main Sales/Offer Page Component
 * Phase 1: Static UI with placeholder data
 * Phase 2: Will be connected to usePostQuizState for dynamic data
 */
export function SalesPage({
  // Placeholder data for Phase 1
  firstName = 'Anna',
  currentStressStage = 3 as StressStage,
  currentScore = 42,
  targetScore = 18,
  stageTitle = 'Střední úroveň stresu',
  mainChallenge = 'Vnitřní klid',
}: SalesPageProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  // Get recommended plan based on stress stage
  const recommendedPlanId = getRecommendedPlan(currentStressStage);

  // Handle plan selection
  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    // TODO Phase 3: Open checkout modal
    console.log('Selected plan:', planId);
    // setShowCheckoutModal(true);
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

      {/* Transformation Display */}
      <TransformationDisplay
        firstName={firstName}
        currentStressStage={currentStressStage}
        currentScore={currentScore}
        targetScore={targetScore}
        stageTitle={stageTitle}
      />

      {/* Plan Highlights */}
      <PlanHighlights highlights={PLAN_HIGHLIGHTS} mainChallenge={mainChallenge} />

      {/* Pricing Section */}
      <div id="pricing-section">
        <PricingSection
          plans={PRICING_PLANS}
          recommendedPlanId={recommendedPlanId}
          onPlanSelect={handlePlanSelect}
        />
      </div>

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
      <section className="py-16 px-4 bg-gradient-to-b from-purple-50 to-white">
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

      {/* TODO Phase 3: Checkout Modal */}
      {/* {showCheckoutModal && selectedPlanId && (
        <CheckoutModal
          plan={getPlanById(selectedPlanId)!}
          onSuccess={() => {
            // Navigate to success page
          }}
          onCancel={() => setShowCheckoutModal(false)}
        />
      )} */}
    </div>
  );
}
