/**
 * Stripe webhook helpers for KnowYourEmoji
 *
 * Pure functions used by the Stripe webhook route (src/app/api/webhooks/stripe)
 * to translate Stripe objects into the local `subscriptions` table shape.
 * Written against the object shapes of API version 2025-03-31.basil and later.
 */

import type Stripe from 'stripe';

/** Local subscription status values written by this webhook. */
export type LocalSubscriptionStatus = 'active' | 'canceled' | 'past_due';

/**
 * Map a Stripe subscription status onto the local status values.
 *
 * - `active` and `trialing` grant access.
 * - `past_due`, `unpaid`, and `incomplete` mean a payment is outstanding.
 * - `canceled`, `incomplete_expired`, `paused`, and any unknown future status
 *   revoke access (fail closed).
 */
export function mapStripeStatus(status: Stripe.Subscription.Status): LocalSubscriptionStatus {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
    case 'unpaid':
    case 'incomplete':
      return 'past_due';
    default:
      return 'canceled';
  }
}

/**
 * Current billing period end for a subscription.
 *
 * Since API version 2025-03-31.basil, `current_period_end` lives on each
 * subscription item rather than on the subscription itself. The latest item
 * period end is used so a paying user is never cut off early.
 */
export function getCurrentPeriodEnd(subscription: Stripe.Subscription): Date | null {
  const ends = (subscription.items?.data ?? [])
    .map((item) => item.current_period_end)
    .filter((end): end is number => typeof end === 'number');

  return ends.length > 0 ? new Date(Math.max(...ends) * 1000) : null;
}

/**
 * Subscription ID that generated an invoice.
 *
 * Since API version 2025-03-31.basil, this lives under
 * `invoice.parent.subscription_details.subscription`.
 */
export function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const subscription = invoice.parent?.subscription_details?.subscription;
  if (!subscription) {
    return null;
  }
  return typeof subscription === 'string' ? subscription : subscription.id;
}

/**
 * Trial end date to store locally.
 *
 * `isSubscriptionActive` (src/lib/subscriptions.ts) grants access while
 * `trialEndsAt` is in the future, regardless of status. Stripe keeps
 * `trial_end` on a subscription that was canceled or went unpaid during its
 * trial, so the trial end is only kept while the subscription grants access.
 */
export function getTrialEndsAt(
  subscription: Stripe.Subscription,
  status: LocalSubscriptionStatus
): Date | null {
  if (status !== 'active' || !subscription.trial_end) {
    return null;
  }
  return new Date(subscription.trial_end * 1000);
}
