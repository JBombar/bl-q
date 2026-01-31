import { SalesPage } from '@/components/sales/SalesPage';

/**
 * Sales/Offer Page Route
 * This page is shown after the user completes the post-quiz funnel (Screen F)
 */

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';

export default function OfferPage() {
  return <SalesPage />;
}

export async function generateMetadata() {
  return {
    title: 'Tvůj osobní plán | Better Lady',
    description: 'Tvůj personalizovaný 90denní program pro dosažení vnitřního klidu a radosti ze života',
  };
}
