import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';

// Mock the Stripe constructor
const MockStripeConstructor = mock(
  () =>
    ({
      billingPortal: { sessions: { create: mock() } },
    }) as never
);

mock.module('stripe', () => ({
  default: MockStripeConstructor,
}));

const { getStripe, resetStripe } = await import('@/lib/stripe');

// Save/restore STRIPE_SECRET_KEY to avoid polluting other tests
let savedStripeKey: string | undefined;

describe('stripe client', () => {
  beforeEach(() => {
    savedStripeKey = process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY;
    resetStripe();
    MockStripeConstructor.mockClear();
  });

  afterEach(() => {
    if (savedStripeKey === undefined) {
      delete process.env.STRIPE_SECRET_KEY;
    } else {
      process.env.STRIPE_SECRET_KEY = savedStripeKey;
    }
  });

  it('returns null when STRIPE_SECRET_KEY is not set', () => {
    const stripe = getStripe();
    expect(stripe).toBeNull();
  });

  it('returns a Stripe instance when STRIPE_SECRET_KEY is set', () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    const stripe = getStripe();
    expect(stripe).not.toBeNull();
    expect(MockStripeConstructor).toHaveBeenCalledWith('sk_test_123', { typescript: true });
  });

  it('returns the same instance on subsequent calls', () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    const first = getStripe();
    const second = getStripe();
    expect(first).toBe(second);
    expect(MockStripeConstructor).toHaveBeenCalledTimes(1);
  });

  it('creates a new instance after resetStripe', () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    const first = getStripe();
    resetStripe();
    const second = getStripe();
    expect(first).not.toBe(second);
    expect(MockStripeConstructor).toHaveBeenCalledTimes(2);
  });
});
