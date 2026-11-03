/**
 * Stripe Webhook Handler for KnowYourEmoji
 *
 * Keeps the `subscriptions` table in Neon DB in sync with Stripe.
 *
 * Events handled:
 * - checkout.session.completed: links the Stripe subscription to the user
 *   (via the `userId` checkout metadata) and stores its current state
 * - customer.subscription.created / .updated / .deleted / .paused / .resumed:
 *   sync status, period end, and trial end
 * - invoice.paid: restores access after a recovered payment
 * - invoice.payment_failed: reflects dunning (past_due / unpaid)
 *
 * Stripe does not guarantee delivery order and may deliver an event more than
 * once. Instead of applying the (possibly stale) object embedded in the event,
 * every handler re-fetches the subscription from Stripe and writes its current
 * state. Replaying or reordering events therefore always converges on the
 * latest Stripe state, which makes the handlers idempotent without an
 * event-log table.
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { getDb } from '@/lib/db';
import { getEnv } from '@/lib/env';
import { subscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  getCurrentPeriodEnd,
  getInvoiceSubscriptionId,
  getTrialEndsAt,
  mapStripeStatus,
} from '@/lib/stripe-webhook';

const TRIAL_DAYS = 7;

/** ID of a Stripe customer field that may be a string or expanded object. */
function getCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null
): string | null {
  if (!customer) {
    return null;
  }
  return typeof customer === 'string' ? customer : customer.id;
}

/** True when Stripe reports that the requested resource does not exist. */
function isResourceMissing(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: unknown }).code === 'resource_missing'
  );
}

/**
 * Fetch the latest state of a subscription from Stripe.
 * Returns null if the subscription no longer exists, so the event is
 * acknowledged instead of being retried forever.
 */
async function retrieveSubscription(
  stripe: Stripe,
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    if (isResourceMissing(error)) {
      return null;
    }
    throw error;
  }
}

/**
 * Verify Stripe webhook signature and return the event.
 * Returns null if signature verification fails or Stripe is not configured.
 */
function verifyWebhookEvent(
  payload: string,
  signature: string
): { event: Stripe.Event; stripe: Stripe } | null {
  const env = getEnv();
  const stripe = getStripe();

  if (!stripe || !env.stripeWebhookSecret) {
    return null;
  }

  try {
    return {
      event: stripe.webhooks.constructEvent(payload, signature, env.stripeWebhookSecret),
      stripe,
    };
  } catch {
    return null;
  }
}

/**
 * Write the current state of a Stripe subscription to the row that already
 * references it. If no row references it yet (e.g. customer.subscription.created
 * arriving before checkout.session.completed), nothing is written; the checkout
 * handler creates the link and stores the same current state.
 */
async function syncSubscriptionById(stripe: Stripe, subscriptionId: string): Promise<void> {
  const db = getDb();
  if (!db) {
    return;
  }

  const stripeSubscription = await retrieveSubscription(stripe, subscriptionId);
  if (!stripeSubscription) {
    return;
  }

  const status = mapStripeStatus(stripeSubscription.status);

  await db
    .update(subscriptions)
    .set({
      status,
      plan: 'pro',
      currentPeriodEnd: getCurrentPeriodEnd(stripeSubscription),
      trialEndsAt: getTrialEndsAt(stripeSubscription, status),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscription.id));
}

/**
 * Handle checkout.session.completed.
 * Links the Stripe subscription and customer to the user and stores the
 * subscription's current state.
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  stripe: Stripe
): Promise<void> {
  const userId = session.metadata?.userId;
  if (session.mode !== 'subscription' || !userId || !session.subscription) {
    return;
  }

  const db = getDb();
  if (!db) {
    return;
  }

  const subscriptionId =
    typeof session.subscription === 'string' ? session.subscription : session.subscription.id;

  const stripeSubscription = await retrieveSubscription(stripe, subscriptionId);
  if (!stripeSubscription) {
    return;
  }

  const status = mapStripeStatus(stripeSubscription.status);

  // Checkout always starts a TRIAL_DAYS trial; fall back to it if Stripe did
  // not report a trial end, but never grant a trial to a non-active subscription.
  const trialEndsAt =
    getTrialEndsAt(stripeSubscription, status) ??
    (status === 'active' ? new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000) : null);

  const values = {
    stripeSubscriptionId: stripeSubscription.id,
    stripeCustomerId: getCustomerId(session.customer),
    status,
    plan: 'pro',
    trialEndsAt,
    currentPeriodEnd: getCurrentPeriodEnd(stripeSubscription),
  };

  const existing = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(subscriptions)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(subscriptions.userId, userId));
  } else {
    await db.insert(subscriptions).values({ userId, ...values });
  }
}

/**
 * POST /api/webhooks/stripe
 * Main webhook endpoint that handles all Stripe events.
 *
 * Returns 400 for unverifiable requests, 200 for handled or ignored events,
 * and 500 only when processing fails so Stripe retries the delivery.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const verified = verifyWebhookEvent(payload, signature);

    if (!verified) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const { event, stripe } = verified;

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object, stripe);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused':
      case 'customer.subscription.resumed':
        await syncSubscriptionById(stripe, event.data.object.id);
        break;

      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const subscriptionId = getInvoiceSubscriptionId(event.data.object);
        if (subscriptionId) {
          await syncSubscriptionById(stripe, subscriptionId);
        }
        break;
      }

      default:
        // Acknowledge events this endpoint does not act on
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
