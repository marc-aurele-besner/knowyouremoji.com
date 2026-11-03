/**
 * Stripe client for KnowYourEmoji
 *
 * Provides a lazily-initialized Stripe instance configured from environment
 * variables. Returns null when STRIPE_SECRET_KEY is not set so callers can
 * gracefully degrade (e.g. return 503).
 */

import Stripe from 'stripe';
import { getEnv } from '@/lib/env';

/**
 * Stripe API version this integration is written and tested against.
 *
 * Pinned explicitly so request and webhook payload shapes do not change when
 * the account's default API version is upgraded in the Dashboard. It matches
 * the version bundled with the installed `stripe` SDK (see
 * node_modules/stripe/cjs/apiVersion.js); bump both together.
 */
export const STRIPE_API_VERSION = '2026-09-30.endive' as const;

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
      apiVersion: STRIPE_API_VERSION,
      typescript: true,
      appInfo: {
        name: 'KnowYourEmoji',
        url: 'https://knowyouremoji.com',
      },
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
