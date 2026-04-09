import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { getEnv } from '@/lib/env';
import { getStripe } from '@/lib/stripe';
import { getUserSubscription } from '@/lib/subscriptions';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * POST /api/checkout
 * Creates a Stripe checkout session for the authenticated user.
 * Uses the PRO plan price with a 7-day free trial.
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
    }

    const env = getEnv();
    const userId = session.user.id;

    // Get existing subscription to find Stripe customer ID
    const subscription = await getUserSubscription(userId);

    let customerId = subscription?.stripeCustomerId;

    // If no Stripe customer ID, look up user email and create/get customer
    if (!customerId) {
      const userRows = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      const userEmail = userRows[0]?.email;
      if (!userEmail) {
        return NextResponse.json({ error: 'User email not found' }, { status: 400 });
      }

      // Search for existing Stripe customer by email
      const existingCustomers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        // Create new Stripe customer
        const customer = await stripe.customers.create({
          email: userEmail,
          metadata: {
            userId,
          },
        });
        customerId = customer.id;
      }
    }

    // Get the Stripe price ID from environment
    const stripePriceId = env.stripeProPriceId;
    if (!stripePriceId) {
      return NextResponse.json({ error: 'Stripe price not configured' }, { status: 503 });
    }

    // Create checkout session with 7-day trial
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 7,
      },
      success_url: `${env.appUrl}/dashboard?checkout=success`,
      cancel_url: `${env.appUrl}/dashboard?checkout=canceled`,
      metadata: {
        userId,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
