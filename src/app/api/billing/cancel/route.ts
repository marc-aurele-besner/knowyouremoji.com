import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { subscriptions } from '@/lib/db/schema';
import { getStripe } from '@/lib/stripe';
import { getUserSubscription } from '@/lib/subscriptions';

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

    const subscription = await getUserSubscription(session.user.id);
    if (!subscription?.stripeSubscriptionId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    if (subscription.status !== 'active') {
      return NextResponse.json({ error: 'Subscription is not active' }, { status: 400 });
    }

    // Cancel at period end so user retains access until the current billing period expires
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    // Update local subscription status to canceled
    const periodEnd = stripeSubscription.current_period_end
      ? new Date(stripeSubscription.current_period_end * 1000)
      : subscription.currentPeriodEnd;

    await db
      .update(subscriptions)
      .set({
        status: 'canceled',
        currentPeriodEnd: periodEnd,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription.id));

    return NextResponse.json({
      message: 'Subscription canceled',
      accessUntil: periodEnd?.toISOString() ?? null,
    });
  } catch {
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
