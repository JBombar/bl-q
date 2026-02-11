'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UpsellPage } from '@/components/checkout/UpsellPage';
import { usePostQuizState } from '@/hooks/usePostQuizState';

export default function Offer2Page() {
  const router = useRouter();
  const { stripeSubscriptionId } = usePostQuizState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddToPlan = async () => {
    if (!stripeSubscriptionId) {
      setError('Předplatné nebylo nalezeno. Zkuste stránku obnovit.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/add-upsell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stripeSubscriptionId }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Nepodařilo se přidat mentoring.');
      }

      router.push('/thank-you');
    } catch (err: any) {
      setError(err.message || 'Něco se pokazilo. Zkuste to prosím znovu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/thank-you');
  };

  return (
    <UpsellPage
      onAddToPlan={handleAddToPlan}
      onSkip={handleSkip}
      isLoading={isLoading}
      error={error}
    />
  );
}
