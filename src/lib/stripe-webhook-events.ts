/**
 * Stripe webhook endpoint configuration for KnowYourEmoji
 *
 * Single source of truth for the events the Stripe webhook endpoint subscribes
 * to and for the path it is served at. `scripts/setup-stripe-webhook.ts` uses
 * these values to create or update the endpoint in Stripe, so the endpoint's
 * `enabled_events` match what `src/app/api/webhooks/stripe/route.ts` handles.
 * See docs/stripe-webhooks.md.
 */

import type Stripe from 'stripe';

/** Path of the webhook route, relative to the site URL. */
export const STRIPE_WEBHOOK_PATH = '/api/webhooks/stripe';

/**
 * Events the webhook handler processes. Keep this list in sync with the
 * handler: subscribing to events the handler ignores only adds noise, and
 * missing one leaves subscription state stale.
 */
export const STRIPE_WEBHOOK_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.paused',
  'customer.subscription.resumed',
  'invoice.paid',
  'invoice.payment_failed',
] as const satisfies readonly Stripe.WebhookEndpointCreateParams.EnabledEvent[];

export type StripeWebhookEvent = (typeof STRIPE_WEBHOOK_EVENTS)[number];

/** Whether an event type is one the webhook endpoint subscribes to. */
export function isStripeWebhookEvent(type: string): type is StripeWebhookEvent {
  return (STRIPE_WEBHOOK_EVENTS as readonly string[]).includes(type);
}

/**
 * Build the absolute webhook URL from a site URL such as
 * `https://knowyouremoji.com`. Only the origin of the site URL is used, so a
 * trailing slash or path is ignored.
 */
export function getStripeWebhookUrl(siteUrl: string): string {
  return new URL(STRIPE_WEBHOOK_PATH, new URL(siteUrl).origin).toString();
}
