import { describe, it, expect } from 'bun:test';
import { PRO_PLAN, STRIPE_PLANS } from '@/lib/stripe-products';

describe('stripe product catalog', () => {
  it('defines the Pro plan as $9/month with a 7-day trial', () => {
    expect(PRO_PLAN.trialPeriodDays).toBe(7);
    expect(PRO_PLAN.prices).toEqual([
      expect.objectContaining({ unitAmount: 900, currency: 'usd', interval: 'month' }),
    ]);
  });

  it('uses unique product IDs and lookup keys across plans', () => {
    const productIds = STRIPE_PLANS.map((plan) => plan.productId);
    const lookupKeys = STRIPE_PLANS.flatMap((plan) => plan.prices.map((p) => p.lookupKey));
    expect(new Set(productIds).size).toBe(productIds.length);
    expect(new Set(lookupKeys).size).toBe(lookupKeys.length);
    expect(STRIPE_PLANS).toContain(PRO_PLAN);
  });
});
