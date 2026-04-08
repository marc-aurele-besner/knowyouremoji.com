import { describe, it, expect, mock, beforeEach } from 'bun:test';

const mockGetEnv = mock(() => ({
  stripeSecretKey: undefined as string | undefined,
}));

mock.module('@/lib/env', () => ({
  getEnv: mockGetEnv,
}));

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

describe('stripe client', () => {
  beforeEach(() => {
    resetStripe();
    mockGetEnv.mockReturnValue({ stripeSecretKey: undefined } as never);
    MockStripeConstructor.mockClear();
  });

  it('returns null when STRIPE_SECRET_KEY is not set', () => {
    const stripe = getStripe();
    expect(stripe).toBeNull();
  });

  it('returns a Stripe instance when STRIPE_SECRET_KEY is set', () => {
    mockGetEnv.mockReturnValue({ stripeSecretKey: 'sk_test_123' } as never);
    const stripe = getStripe();
    expect(stripe).not.toBeNull();
    expect(MockStripeConstructor).toHaveBeenCalledWith('sk_test_123', { typescript: true });
  });

  it('returns the same instance on subsequent calls', () => {
    mockGetEnv.mockReturnValue({ stripeSecretKey: 'sk_test_123' } as never);
    const first = getStripe();
    const second = getStripe();
    expect(first).toBe(second);
    expect(MockStripeConstructor).toHaveBeenCalledTimes(1);
  });

  it('creates a new instance after resetStripe', () => {
    mockGetEnv.mockReturnValue({ stripeSecretKey: 'sk_test_123' } as never);
    const first = getStripe();
    resetStripe();
    const second = getStripe();
    expect(first).not.toBe(second);
    expect(MockStripeConstructor).toHaveBeenCalledTimes(2);
  });
});
