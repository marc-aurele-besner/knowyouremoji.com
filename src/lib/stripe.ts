/**
 * Stripe client for KnowYourEmoji
 *
 * Provides a lazily-initialized Stripe instance configured from environment
 * variables. Returns null when STRIPE_SECRET_KEY is not set so callers can
 * gracefully degrade (e.g. return 503).
 */

import Stripe from 'stripe';
import { getEnv } from '@/lib/env';

let stripeInstance: Stripe | null = null;

/**
 * Get a configured Stripe client instance.
 * Returns null when STRIPE_SECRET_KEY is not set.
 */
export function getStripe(): Stripe | null {
  const env = getEnv();
  if (!env.stripeSecretKey) {
    return null;
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(env.stripeSecretKey, {
      typescript: true,
    });
  }

  return stripeInstance;
}

/**
 * Reset the Stripe instance (useful for testing).
 */
export function resetStripe(): void {
  stripeInstance = null;
}
