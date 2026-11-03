/**
 * Stripe product catalog for KnowYourEmoji
 *
 * Single source of truth for the products and prices the app sells. The
 * catalog is created in Stripe by `scripts/setup-stripe.ts`, which looks
 * prices up by `lookupKey` so it can be run repeatedly without creating
 * duplicates. At runtime the app charges the price ID from the environment
 * (`STRIPE_PRO_PRICE_ID`), which the setup script prints.
 *
 * See docs/stripe.md for the setup steps.
 */

/** A recurring price attached to a plan's product. */
export interface StripePriceConfig {
  /** Stable lookup key used to find the price without storing its ID */
  lookupKey: string;
  /** Amount in the smallest currency unit (cents for USD) */
  unitAmount: number;
  /** ISO currency code, lowercase */
  currency: 'usd';
  /** Billing interval */
  interval: 'month' | 'year';
  /** Human-readable label shown in the Stripe Dashboard */
  nickname: string;
}

/** A plan a customer can subscribe to: one Stripe Product and its prices. */
export interface StripePlanConfig {
  /** Custom Stripe Product ID, so the product can be found idempotently */
  productId: string;
  /** Product name shown on Checkout, invoices, and the Customer Portal */
  name: string;
  /** Product description shown on Checkout */
  description: string;
  /** Free trial length applied when a customer starts a subscription */
  trialPeriodDays: number;
  /** Prices for this plan (billing variants of the same plan only) */
  prices: readonly StripePriceConfig[];
}

/** The Pro subscription plan: $9/month with a 7-day free trial. */
export const PRO_PLAN: StripePlanConfig = {
  productId: 'kye_pro',
  name: 'KnowYourEmoji Pro',
  description:
    'Unlimited emoji interpretations, priority AI processing, and interpretation history.',
  trialPeriodDays: 7,
  prices: [
    {
      lookupKey: 'kye_pro_monthly',
      unitAmount: 900,
      currency: 'usd',
      interval: 'month',
      nickname: 'Pro monthly',
    },
  ],
};

/** Every plan the setup script provisions in Stripe. */
export const STRIPE_PLANS: readonly StripePlanConfig[] = [PRO_PLAN];
