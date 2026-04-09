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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockGetDb: any = mock(() => null);

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

    it('should handle checkout.session.completed with db insert for new subscription', async () => {
      mockGetEnv.mockReturnValue({
        appUrl: 'http://localhost:3000',
        stripeSecretKey: 'sk_test_123',
        stripeWebhookSecret: 'wh_secret_test',
      });

      mockStripeInstance.subscriptions.retrieve.mockResolvedValue({
        trial_end: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
        current_period_end: Math.floor(Date.now() / 1000) + 37 * 24 * 60 * 60,
      });

      const limitMock = mock(() => Promise.resolve([]));
      const whereMock = mock(() => ({ limit: limitMock }));
      const fromMock = mock(() => ({ where: whereMock }));
      const selectMock = mock(() => ({ from: fromMock }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const insertMock: any = mock(() => ({ values: mock(() => Promise.resolve({})) }));

      const mockDb = {
        select: selectMock,
        insert: insertMock,
      };
      mockGetDb.mockReturnValue(mockDb);

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
      expect(response.status).toBe(200);
    });

    it('should handle checkout.session.completed with db update for existing subscription', async () => {
      mockGetEnv.mockReturnValue({
        appUrl: 'http://localhost:3000',
        stripeSecretKey: 'sk_test_123',
        stripeWebhookSecret: 'wh_secret_test',
      });

      mockStripeInstance.subscriptions.retrieve.mockResolvedValue({
        trial_end: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
        current_period_end: Math.floor(Date.now() / 1000) + 37 * 24 * 60 * 60,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateMock: any = mock(() => ({
        set: mock(() => ({ where: mock(() => Promise.resolve({})) })),
      }));
      const limitMock = mock(() => Promise.resolve([{ id: 'sub-123', userId: 'user-456' }]));
      const whereMock = mock(() => ({ limit: limitMock }));
      const fromMock = mock(() => ({ where: whereMock }));
      const selectMock = mock(() => ({ from: fromMock }));

      const mockDb = {
        select: selectMock,
        update: updateMock,
      };
      mockGetDb.mockReturnValue(mockDb);

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
      expect(response.status).toBe(200);
    });

    it('should handle customer.subscription.updated with db update', async () => {
      mockGetEnv.mockReturnValue({
        appUrl: 'http://localhost:3000',
        stripeSecretKey: 'sk_test_123',
        stripeWebhookSecret: 'wh_secret_test',
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateMock: any = mock(() => ({
        set: mock(() => ({ where: mock(() => Promise.resolve({})) })),
      }));
      const limitMock = mock(() => Promise.resolve([{ id: 'sub-123', userId: 'user-456' }]));
      const whereMock = mock(() => ({ limit: limitMock }));
      const fromMock = mock(() => ({ where: whereMock }));
      const selectMock = mock(() => ({ from: fromMock }));

      const mockDb = {
        select: selectMock,
        update: updateMock,
      };
      mockGetDb.mockReturnValue(mockDb);

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

    it('should handle customer.subscription.deleted with db update', async () => {
      mockGetEnv.mockReturnValue({
        appUrl: 'http://localhost:3000',
        stripeSecretKey: 'sk_test_123',
        stripeWebhookSecret: 'wh_secret_test',
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateMock: any = mock(() => ({
        set: mock(() => ({ where: mock(() => Promise.resolve({})) })),
      }));

      const mockDb = {
        update: updateMock,
      };
      mockGetDb.mockReturnValue(mockDb);

      const mockEvent = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test123',
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

    it('should handle invoice.payment_failed with db update', async () => {
      mockGetEnv.mockReturnValue({
        appUrl: 'http://localhost:3000',
        stripeSecretKey: 'sk_test_123',
        stripeWebhookSecret: 'wh_secret_test',
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateMock: any = mock(() => ({
        set: mock(() => ({ where: mock(() => Promise.resolve({})) })),
      }));

      const mockDb = {
        update: updateMock,
      };
      mockGetDb.mockReturnValue(mockDb);

      const mockEvent = {
        type: 'invoice.payment_failed',
        data: {
          object: {
            subscription: 'sub_test123',
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

    it('should handle customer.subscription.updated with canceled status', async () => {
      mockGetEnv.mockReturnValue({
        appUrl: 'http://localhost:3000',
        stripeSecretKey: 'sk_test_123',
        stripeWebhookSecret: 'wh_secret_test',
      });

      mockStripeInstance.subscriptions.retrieve.mockResolvedValue({
        id: 'sub_test123',
        status: 'canceled',
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateMock: any = mock(() => ({
        set: mock(() => ({ where: mock(() => Promise.resolve({})) })),
      }));
      const limitMock = mock(() => Promise.resolve([{ id: 'sub-123', userId: 'user-456' }]));
      const whereMock = mock(() => ({ limit: limitMock }));
      const fromMock = mock(() => ({ where: whereMock }));
      const selectMock = mock(() => ({ from: fromMock }));

      const mockDb = {
        select: selectMock,
        update: updateMock,
      };
      mockGetDb.mockReturnValue(mockDb);

      const mockEvent = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test123',
            status: 'canceled',
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

    it('should handle customer.subscription.updated with past_due status', async () => {
      mockGetEnv.mockReturnValue({
        appUrl: 'http://localhost:3000',
        stripeSecretKey: 'sk_test_123',
        stripeWebhookSecret: 'wh_secret_test',
      });

      mockStripeInstance.subscriptions.retrieve.mockResolvedValue({
        id: 'sub_test123',
        status: 'past_due',
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateMock: any = mock(() => ({
        set: mock(() => ({ where: mock(() => Promise.resolve({})) })),
      }));
      const limitMock = mock(() => Promise.resolve([{ id: 'sub-123', userId: 'user-456' }]));
      const whereMock = mock(() => ({ limit: limitMock }));
      const fromMock = mock(() => ({ where: whereMock }));
      const selectMock = mock(() => ({ from: fromMock }));

      const mockDb = {
        select: selectMock,
        update: updateMock,
      };
      mockGetDb.mockReturnValue(mockDb);

      const mockEvent = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test123',
            status: 'past_due',
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

    it('should handle customer.subscription.deleted when db is not configured', async () => {
      mockGetEnv.mockReturnValue({
        appUrl: 'http://localhost:3000',
        stripeSecretKey: 'sk_test_123',
        stripeWebhookSecret: 'wh_secret_test',
      });

      // Return null for db to exercise the early return
      mockGetDb.mockReturnValue(null);

      const mockEvent = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test123',
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

    it('should handle invoice.payment_failed when db is not configured', async () => {
      mockGetEnv.mockReturnValue({
        appUrl: 'http://localhost:3000',
        stripeSecretKey: 'sk_test_123',
        stripeWebhookSecret: 'wh_secret_test',
      });

      // Return null for db to exercise the early return
      mockGetDb.mockReturnValue(null);

      const mockEvent = {
        type: 'invoice.payment_failed',
        data: {
          object: {
            subscription: 'sub_test123',
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
