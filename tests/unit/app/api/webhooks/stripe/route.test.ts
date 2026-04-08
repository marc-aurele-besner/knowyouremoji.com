import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';

// Shared mock state that can be reset
interface MockStripeInstance {
  webhooks: {
    constructEvent: ReturnType<typeof mock>;
  };
  subscriptions: {
    retrieve: ReturnType<typeof mock>;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockStripeInstance: MockStripeInstance | any = {
  webhooks: {
    constructEvent: mock(() => null),
  },
  subscriptions: {
    retrieve: mock(() => Promise.resolve({})),
  },
};

const mockGetStripe = mock(() => mockStripeInstance);
const mockGetEnv = mock(() => ({
  appUrl: 'http://localhost:3000',
  stripeSecretKey: 'sk_test_123',
  stripeWebhookSecret: 'wh_secret_test',
}));
const mockGetDb = mock(() => null);

mock.module('@/lib/stripe', () => ({
  getStripe: mockGetStripe,
}));

mock.module('@/lib/env', () => ({
  getEnv: mockGetEnv,
}));

mock.module('@/lib/db', () => ({
  getDb: mockGetDb,
}));

mock.module('@/lib/db/schema', () => ({
  subscriptions: {},
  users: {},
}));

mock.module('drizzle-orm', () => ({
  eq: mock(() => ({})),
}));

// Import route module to test
import { POST } from '@/app/api/webhooks/stripe/route';

describe('Stripe webhook handler', () => {
  beforeEach(() => {
    mockGetStripe.mockReset();
    mockGetStripe.mockReturnValue(mockStripeInstance);
    mockGetEnv.mockReset();
    mockGetEnv.mockReturnValue({
      appUrl: 'http://localhost:3000',
      stripeSecretKey: 'sk_test_123',
      stripeWebhookSecret: 'wh_secret_test',
    });
    mockGetDb.mockReset();
    mockGetDb.mockReturnValue(null);

    // Reset all mock functions on mockStripeInstance
    mockStripeInstance.webhooks.constructEvent.mockReset();
    mockStripeInstance.webhooks.constructEvent.mockReturnValue(null);
    mockStripeInstance.subscriptions.retrieve.mockReset();
    mockStripeInstance.subscriptions.retrieve.mockResolvedValue({});
  });

  afterEach(() => {
    // Ensure mockGetStripe is restored for other tests
    mockGetStripe.mockReset();
    mockGetStripe.mockReturnValue(mockStripeInstance);
  });

  describe('POST', () => {
    it('should return 400 when signature is missing', async () => {
      const request = new Request('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({ type: 'test' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Missing signature');
    });

    it('should return 400 for invalid signature', async () => {
      mockStripeInstance.webhooks.constructEvent.mockReturnValue(null);

      const request = new Request('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'stripe-signature': 'invalid_signature',
        },
        body: JSON.stringify({ type: 'test' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Invalid signature');
    });

    it('should return 200 for unhandled event types', async () => {
      const mockEvent = {
        type: 'some.other.event',
        data: { object: {} },
      };

      mockStripeInstance.webhooks.constructEvent.mockReturnValue(mockEvent);

      const request = new Request('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'stripe-signature': 'sig_test',
        },
        body: JSON.stringify(mockEvent),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should handle checkout.session.completed when not a subscription mode', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            mode: 'payment',
            metadata: {},
            subscription: null,
          },
        },
      };

      mockStripeInstance.webhooks.constructEvent.mockReturnValue(mockEvent);

      const request = new Request('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'stripe-signature': 'sig_test',
        },
        body: JSON.stringify(mockEvent),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should return 400 for checkout.session.completed when Stripe is not configured', async () => {
      // When Stripe is not configured, verifyWebhookEvent returns null, leading to 400
      mockGetStripe.mockReturnValue(null);

      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            mode: 'subscription',
            metadata: { userId: 'user-123' },
            subscription: 'sub_test123',
            customer: 'cus_test123',
          },
        },
      };

      mockStripeInstance.webhooks.constructEvent.mockReturnValue(mockEvent);

      const request = new Request('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'stripe-signature': 'sig_test',
        },
        body: JSON.stringify(mockEvent),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      // Restore the mock for subsequent tests
      mockGetStripe.mockReturnValue(mockStripeInstance);
    });

    it('should return 200 for customer.subscription.updated when no subscription found', async () => {
      const mockEvent = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test123',
            status: 'active',
            current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
            trial_end: null,
          },
        },
      };

      mockStripeInstance.webhooks.constructEvent.mockReturnValue(mockEvent);

      const request = new Request('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'stripe-signature': 'sig_test',
        },
        body: JSON.stringify(mockEvent),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should return 200 for invoice.payment_failed when no subscription', async () => {
      const mockEvent = {
        type: 'invoice.payment_failed',
        data: {
          object: {
            subscription: null,
          },
        },
      };

      mockStripeInstance.webhooks.constructEvent.mockReturnValue(mockEvent);

      const request = new Request('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'stripe-signature': 'sig_test',
        },
        body: JSON.stringify(mockEvent),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });
});
