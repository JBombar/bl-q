'use client';

import { useRouter } from 'next/navigation';
import { usePostQuizState } from '@/hooks/usePostQuizState';
import { PreUpsell } from '@/components/checkout/PreUpsell';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { funnelData } = usePostQuizState();
  const email = funnelData.email || '';

  const handleContinue = () => {
    router.push('/offer-2');
  };

  return <PreUpsell email={email} onContinue={handleContinue} />;
}
