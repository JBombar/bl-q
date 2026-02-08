'use client';

import { useRouter } from 'next/navigation';
import { UpsellPage } from '@/components/checkout/UpsellPage';

export default function Offer2Page() {
  const router = useRouter();

  const handleAddToPlan = () => {
    // TODO: Add mentoring to plan, proceed to next step
    router.push('/dashboard');
  };

  const handleSkip = () => {
    // TODO: Skip upsell, proceed to next step
    router.push('/dashboard');
  };

  return <UpsellPage onAddToPlan={handleAddToPlan} onSkip={handleSkip} />;
}
