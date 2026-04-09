/**
 * Stripe Webhook Handler for KnowYourEmoji
 *
 * Handles Stripe webhook events to keep subscription status in sync with Neon DB.
 * Events handled:
 * - checkout.session.completed: Activates trial period and stores stripeSubscriptionId
 * - customer.subscription.updated: Updates subscription status and period end
 * - customer.subscription.deleted: Marks subscription as canceled
 * - invoice.payment_failed: Marks subscription as past_due
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { getDb } from '@/lib/db';
import { getEnv } from '@/lib/env';
import { subscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const TRIAL_DAYS = 7;

/**
 * Verify Stripe webhook signature and return the event.
 * Returns null if signature verification fails or Stripe is not configured.
 */
async function verifyWebhookEvent(
  payload: string,
  signature: string
): Promise<Stripe.Event | null> {
  const env = getEnv();
  const stripe = getStripe();

  if (!stripe || !env.stripeWebhookSecret) {
    return null;
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, env.stripeWebhookSecret);
  } catch {
    return null;
  }
}

/**
 * Handle checkout.session.completed event.
 * Creates or updates subscription record with Stripe subscription ID and trial end date.
 */
async function handleCheckoutSessionCompleted(event: Stripe.Event, stripe: Stripe): Promise<void> {
  const session = event.data.object as Stripe.Checkout.Session;

  if (session.mode !== 'subscription' || !session.metadata?.userId) {
    return;
  }

  const userId = session.metadata.userId;
  const subscriptionId = session.subscription as string;

  // Fetch the subscription details from Stripe to get trial info
  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

  const db = getDb();
  if (!db) {
    return;
  }

  // Calculate trial end date
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub = stripeSubscription as any;
  const trialEndsAt = sub.trial_end
    ? new Date(sub.trial_end * 1000)
    : new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

  const currentPeriodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null;

  // Check if subscription record exists
  const existing = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    // Update existing subscription
    await db
      .update(subscriptions)
      .set({
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: session.customer as string,
        status: 'active',
        plan: 'pro',
        trialEndsAt,
        currentPeriodEnd,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId));
  } else {
    // Create new subscription record
    await db.insert(subscriptions).values({
      userId,
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: session.customer as string,
      status: 'active',
      plan: 'pro',
      trialEndsAt,
      currentPeriodEnd,
    });
  }
}

/**
 * Handle customer.subscription.updated event.
 * Updates subscription status and period end in the database.
 */
async function handleSubscriptionUpdated(event: Stripe.Event): Promise<void> {
  const stripeSubscription = event.data.object as Stripe.Subscription;

  // Get user by stripe customer ID
  const db = getDb();
  if (!db) {
    return;
  }

  const subRows = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscription.id))
    .limit(1);

  if (subRows.length === 0) {
    return;
  }

  const subscription = subRows[0];

  // Determine status based on Stripe subscription state
  let status: 'active' | 'canceled' | 'past_due' = 'active';

  if (stripeSubscription.status === 'canceled') {
    status = 'canceled';
  } else if (stripeSubscription.status === 'past_due') {
    status = 'past_due';
  } else if (stripeSubscription.status === 'active' || stripeSubscription.status === 'trialing') {
    status = 'active';
  }

  // Update the subscription
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub = stripeSubscription as any;
  await db
    .update(subscriptions)
    .set({
      status,
      plan: 'pro',
      currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
      trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, subscription.id));
}

/**
 * Handle customer.subscription.deleted event.
 * Marks subscription as canceled in the database.
 */
async function handleSubscriptionDeleted(event: Stripe.Event): Promise<void> {
  const stripeSubscription = event.data.object as Stripe.Subscription;

  const db = getDb();
  if (!db) {
    return;
  }

  await db
    .update(subscriptions)
    .set({
      status: 'canceled',
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscription.id));
}

/**
 * Handle invoice.payment_failed event.
 * Marks subscription as past_due in the database.
 */
async function handlePaymentFailed(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  const subId = (invoice as Stripe.Invoice & { subscription: string | null }).subscription;

  if (!subId) {
    return;
  }

  const db = getDb();
  if (!db) {
    return;
  }

  await db
    .update(subscriptions)
    .set({
      status: 'past_due',
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subId));
}

/**
 * POST /api/webhooks/stripe
 * Main webhook endpoint that handles all Stripe events.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const event = await verifyWebhookEvent(payload, signature);

    if (!event) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const stripe = getStripe();

    // Handle events
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event, stripe!);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event);
        break;

      default:
        // Ignore unhandled events
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
