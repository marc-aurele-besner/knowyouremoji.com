import type { Metadata } from 'next';
import { BillingPage } from '@/components/dashboard/billing-page';

export const metadata: Metadata = {
  title: 'Billing - KnowYourEmoji',
  description: 'Manage your subscription, payment method, and billing details.',
};

export default function BillingRoute() {
  return <BillingPage />;
}
