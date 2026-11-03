import { describe, it, expect } from 'bun:test';
import type Stripe from 'stripe';
import {
  getCurrentPeriodEnd,
  getInvoiceSubscriptionId,
  getTrialEndsAt,
  mapStripeStatus,
} from '@/lib/stripe-webhook';

function subscription(overrides: Record<string, unknown> = {}): Stripe.Subscription {
  return {
    id: 'sub_123',
    status: 'active',
    trial_end: null,
    items: { data: [] },
    ...overrides,
  } as unknown as Stripe.Subscription;
}

function invoice(parent: unknown): Stripe.Invoice {
  return { id: 'in_123', parent } as unknown as Stripe.Invoice;
}

describe('stripe-webhook helpers', () => {
  describe('mapStripeStatus', () => {
    it.each([
      ['active', 'active'],
      ['trialing', 'active'],
      ['past_due', 'past_due'],
      ['unpaid', 'past_due'],
      ['incomplete', 'past_due'],
      ['canceled', 'canceled'],
      ['incomplete_expired', 'canceled'],
      ['paused', 'canceled'],
      ['some_future_status', 'canceled'],
    ])('maps %s to %s', (stripeStatus, expected) => {
      expect(mapStripeStatus(stripeStatus as Stripe.Subscription.Status)).toBe(
        expected as ReturnType<typeof mapStripeStatus>
      );
    });
  });

  describe('getCurrentPeriodEnd', () => {
    it('reads the period end from subscription items', () => {
      const end = 1_900_000_000;
      const result = getCurrentPeriodEnd(
        subscription({ items: { data: [{ current_period_end: end }] } })
      );
      expect(result?.getTime()).toBe(end * 1000);
    });

    it('uses the latest item period end', () => {
      const result = getCurrentPeriodEnd(
        subscription({
          items: {
            data: [{ current_period_end: 1_800_000_000 }, { current_period_end: 1_900_000_000 }],
          },
        })
      );
      expect(result?.getTime()).toBe(1_900_000_000 * 1000);
    });

    it('ignores a legacy top-level current_period_end', () => {
      expect(
        getCurrentPeriodEnd(subscription({ current_period_end: 1_900_000_000, items: undefined }))
      ).toBeNull();
    });

    it('returns null when items have no period end', () => {
      expect(getCurrentPeriodEnd(subscription({ items: { data: [{}] } }))).toBeNull();
    });
  });

  describe('getInvoiceSubscriptionId', () => {
    it('reads the subscription ID from invoice.parent', () => {
      expect(
        getInvoiceSubscriptionId(
          invoice({ type: 'subscription_details', subscription_details: { subscription: 'sub_1' } })
        )
      ).toBe('sub_1');
    });

    it('handles an expanded subscription', () => {
      expect(
        getInvoiceSubscriptionId(
          invoice({
            type: 'subscription_details',
            subscription_details: { subscription: { id: 'sub_2' } },
          })
        )
      ).toBe('sub_2');
    });

    it('returns null for invoices without a subscription parent', () => {
      expect(getInvoiceSubscriptionId(invoice(null))).toBeNull();
      expect(
        getInvoiceSubscriptionId(invoice({ type: 'quote_details', subscription_details: null }))
      ).toBeNull();
    });
  });

  describe('getTrialEndsAt', () => {
    const trialEnd = 1_900_000_000;

    it('returns the trial end for an active subscription', () => {
      expect(
        getTrialEndsAt(
          subscription({ status: 'trialing', trial_end: trialEnd }),
          'active'
        )?.getTime()
      ).toBe(trialEnd * 1000);
    });

    it('drops the trial end when the subscription no longer grants access', () => {
      const sub = subscription({ status: 'canceled', trial_end: trialEnd });
      expect(getTrialEndsAt(sub, 'canceled')).toBeNull();
      expect(getTrialEndsAt(sub, 'past_due')).toBeNull();
    });

    it('returns null when there is no trial', () => {
      expect(getTrialEndsAt(subscription(), 'active')).toBeNull();
    });
  });
});
