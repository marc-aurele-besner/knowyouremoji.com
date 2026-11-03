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

const defaultEnv = {
  appUrl: 'http://localhost:3000',
  stripeSecretKey: 'sk_test_123',
  stripeWebhookSecret: 'wh_secret_test',
};

const mockGetStripe = mock(() => mockStripeInstance);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockGetEnv: any = mock(() => defaultEnv);
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
  eq: mock((column: unknown, value: unknown) => ({ column, value })),
}));

// Import route module to test
import { POST } from '@/app/api/webhooks/stripe/route';

const DAY = 24 * 60 * 60;
const nowSeconds = () => Math.floor(Date.now() / 1000);

/** A Stripe subscription in the 2025-03-31.basil+ shape (period end on items). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stripeSubscription(overrides: Record<string, any> = {}) {
  return {
    id: 'sub_test123',
    status: 'trialing',
    trial_end: nowSeconds() + 7 * DAY,
    items: { data: [{ current_period_end: nowSeconds() + 7 * DAY }] },
    ...overrides,
  };
}

/**
 * Build a mock Drizzle db that records every write.
 * `existingRows` is what `select().from().where().limit()` resolves to.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createMockDb(existingRows: any[] = []) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: { values: any; where: any }[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inserts: any[] = [];

  const db = {
    select: mock(() => ({
      from: mock(() => ({
        where: mock(() => ({ limit: mock(() => Promise.resolve(existingRows)) })),
      })),
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    update: mock(() => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      set: mock((values: any) => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        where: mock((where: any) => {
          updates.push({ values, where });
          return Promise.resolve({});
        }),
      })),
    })),
    insert: mock(() => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      values: mock((values: any) => {
        inserts.push(values);
        return Promise.resolve({});
      }),
    })),
  };

  return { db, updates, inserts };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendEvent(event: any, signature: string | null = 'sig_test') {
  mockStripeInstance.webhooks.constructEvent.mockReturnValue(event);
  const headers: Record<string, string> = {};
  if (signature) {
    headers['stripe-signature'] = signature;
  }
  return POST(
    new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      headers,
      body: JSON.stringify(event),
    })
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function checkoutEvent(overrides: Record<string, any> = {}) {
  return {
    type: 'checkout.session.completed',
    data: {
      object: {
        mode: 'subscription',
        metadata: { userId: 'user-123' },
        subscription: 'sub_test123',
        customer: 'cus_test123',
        ...overrides,
      },
    },
  };
}

function invoiceEvent(type: string, subscription: unknown) {
  return {
    type,
    data: {
      object: {
        id: 'in_123',
        parent: subscription
          ? { type: 'subscription_details', subscription_details: { subscription } }
          : null,
      },
    },
  };
}

describe('Stripe webhook handler', () => {
  beforeEach(() => {
    mockGetStripe.mockReset();
    mockGetStripe.mockReturnValue(mockStripeInstance);
    mockGetEnv.mockReset();
    mockGetEnv.mockReturnValue(defaultEnv);
    mockGetDb.mockReset();
    mockGetDb.mockReturnValue(null);

    mockStripeInstance.webhooks.constructEvent.mockReset();
    mockStripeInstance.webhooks.constructEvent.mockReturnValue(null);
    mockStripeInstance.subscriptions.retrieve.mockReset();
    mockStripeInstance.subscriptions.retrieve.mockResolvedValue(stripeSubscription());
  });

  afterEach(() => {
    // Ensure mockGetStripe is restored for other tests
    mockGetStripe.mockReset();
    mockGetStripe.mockReturnValue(mockStripeInstance);
  });

  describe('request verification', () => {
    it('returns 400 when the signature header is missing', async () => {
      const response = await sendEvent({ type: 'test' }, null);
      expect(response.status).toBe(400);
      expect((await response.json()).error).toBe('Missing signature');
    });

    it('returns 400 when signature verification throws', async () => {
      mockStripeInstance.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('No signatures found matching the expected signature');
      });

      const response = await POST(
        new Request('http://localhost/api/webhooks/stripe', {
          method: 'POST',
          headers: { 'stripe-signature': 'invalid_signature' },
          body: '{}',
        })
      );

      expect(response.status).toBe(400);
      expect((await response.json()).error).toBe('Invalid signature');
    });

    it('returns 400 when Stripe is not configured', async () => {
      mockGetStripe.mockReturnValue(null);
      const response = await sendEvent(checkoutEvent());
      expect(response.status).toBe(400);
    });

    it('returns 400 when the webhook secret is not configured', async () => {
      mockGetEnv.mockReturnValue({ ...defaultEnv, stripeWebhookSecret: undefined });
      const response = await sendEvent(checkoutEvent());
      expect(response.status).toBe(400);
      expect(mockStripeInstance.webhooks.constructEvent).not.toHaveBeenCalled();
    });

    it('verifies the raw payload with the webhook secret', async () => {
      await sendEvent({ type: 'some.other.event', data: { object: {} } });
      const [payload, signature, secret] = mockStripeInstance.webhooks.constructEvent.mock.calls[0];
      expect(typeof payload).toBe('string');
      expect(signature).toBe('sig_test');
      expect(secret).toBe('wh_secret_test');
    });
  });

  it('acknowledges unhandled event types with 200', async () => {
    const response = await sendEvent({ type: 'some.other.event', data: { object: {} } });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true });
  });

  describe('checkout.session.completed', () => {
    it('ignores non-subscription checkouts', async () => {
      const { db } = createMockDb();
      mockGetDb.mockReturnValue(db);

      const response = await sendEvent(checkoutEvent({ mode: 'payment', subscription: null }));

      expect(response.status).toBe(200);
      expect(mockStripeInstance.subscriptions.retrieve).not.toHaveBeenCalled();
    });

    it('ignores sessions without a userId', async () => {
      const response = await sendEvent(checkoutEvent({ metadata: {} }));
      expect(response.status).toBe(200);
      expect(mockStripeInstance.subscriptions.retrieve).not.toHaveBeenCalled();
    });

    it('ignores sessions without a subscription', async () => {
      const response = await sendEvent(checkoutEvent({ subscription: null }));
      expect(response.status).toBe(200);
      expect(mockStripeInstance.subscriptions.retrieve).not.toHaveBeenCalled();
    });

    it('returns 200 without writing when the database is not configured', async () => {
      const response = await sendEvent(checkoutEvent());
      expect(response.status).toBe(200);
      expect(mockStripeInstance.subscriptions.retrieve).not.toHaveBeenCalled();
    });

    it('inserts a subscription row for a new subscriber', async () => {
      const trialEnd = nowSeconds() + 7 * DAY;
      const periodEnd = nowSeconds() + 7 * DAY;
      mockStripeInstance.subscriptions.retrieve.mockResolvedValue(
        stripeSubscription({
          trial_end: trialEnd,
          items: { data: [{ current_period_end: periodEnd }] },
        })
      );
      const { db, inserts, updates } = createMockDb([]);
      mockGetDb.mockReturnValue(db);

      const response = await sendEvent(checkoutEvent());

      expect(response.status).toBe(200);
      expect(mockStripeInstance.subscriptions.retrieve).toHaveBeenCalledWith('sub_test123');
      expect(updates).toHaveLength(0);
      expect(inserts).toHaveLength(1);
      expect(inserts[0]).toMatchObject({
        userId: 'user-123',
        stripeSubscriptionId: 'sub_test123',
        stripeCustomerId: 'cus_test123',
        status: 'active',
        plan: 'pro',
      });
      expect(inserts[0].trialEndsAt.getTime()).toBe(trialEnd * 1000);
      expect(inserts[0].currentPeriodEnd.getTime()).toBe(periodEnd * 1000);
    });

    it('updates the existing row for a returning user', async () => {
      const { db, inserts, updates } = createMockDb([{ id: 'row-1', userId: 'user-123' }]);
      mockGetDb.mockReturnValue(db);

      const response = await sendEvent(checkoutEvent());

      expect(response.status).toBe(200);
      expect(inserts).toHaveLength(0);
      expect(updates).toHaveLength(1);
      expect(updates[0].values).toMatchObject({
        stripeSubscriptionId: 'sub_test123',
        stripeCustomerId: 'cus_test123',
        status: 'active',
        plan: 'pro',
      });
      expect(updates[0].values.updatedAt).toBeInstanceOf(Date);
      expect(updates[0].where.value).toBe('user-123');
    });

    it('accepts expanded subscription and customer objects', async () => {
      const { db, inserts } = createMockDb([]);
      mockGetDb.mockReturnValue(db);

      await sendEvent(
        checkoutEvent({ subscription: { id: 'sub_expanded' }, customer: { id: 'cus_expanded' } })
      );

      expect(mockStripeInstance.subscriptions.retrieve).toHaveBeenCalledWith('sub_expanded');
      expect(inserts[0].stripeCustomerId).toBe('cus_expanded');
    });

    it('stores a null customer when the session has none', async () => {
      const { db, inserts } = createMockDb([]);
      mockGetDb.mockReturnValue(db);

      await sendEvent(checkoutEvent({ customer: null }));

      expect(inserts[0].stripeCustomerId).toBeNull();
    });

    it('falls back to a 7-day trial when Stripe omits trial_end', async () => {
      mockStripeInstance.subscriptions.retrieve.mockResolvedValue(
        stripeSubscription({ status: 'active', trial_end: null, items: { data: [] } })
      );
      const { db, inserts } = createMockDb([]);
      mockGetDb.mockReturnValue(db);

      const response = await sendEvent(checkoutEvent());

      expect(response.status).toBe(200);
      const expectedTrialEnd = Date.now() + 7 * DAY * 1000;
      expect(inserts[0].trialEndsAt.getTime()).toBeGreaterThan(expectedTrialEnd - 60_000);
      expect(inserts[0].trialEndsAt.getTime()).toBeLessThan(expectedTrialEnd + 60_000);
      expect(inserts[0].currentPeriodEnd).toBeNull();
    });

    it('stores the real Stripe status instead of assuming active', async () => {
      mockStripeInstance.subscriptions.retrieve.mockResolvedValue(
        stripeSubscription({ status: 'incomplete_expired' })
      );
      const { db, inserts } = createMockDb([]);
      mockGetDb.mockReturnValue(db);

      await sendEvent(checkoutEvent());

      expect(inserts[0].status).toBe('canceled');
      expect(inserts[0].trialEndsAt).toBeNull();
    });

    it('acknowledges the event when the subscription no longer exists in Stripe', async () => {
      mockStripeInstance.subscriptions.retrieve.mockRejectedValue(
        Object.assign(new Error('No such subscription'), { code: 'resource_missing' })
      );
      const { db, inserts, updates } = createMockDb([]);
      mockGetDb.mockReturnValue(db);

      const response = await sendEvent(checkoutEvent());

      expect(response.status).toBe(200);
      expect(inserts).toHaveLength(0);
      expect(updates).toHaveLength(0);
    });

    it('returns 500 so Stripe retries when retrieving the subscription fails', async () => {
      mockStripeInstance.subscriptions.retrieve.mockRejectedValue(new Error('Stripe API down'));
      const { db } = createMockDb([]);
      mockGetDb.mockReturnValue(db);

      const response = await sendEvent(checkoutEvent());

      expect(response.status).toBe(500);
      expect((await response.json()).error).toBe('Webhook handler failed');
    });
  });

  describe.each([
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'customer.subscription.paused',
    'customer.subscription.resumed',
  ])('%s', (type) => {
    const event = {
      type,
      data: { object: { id: 'sub_test123', status: 'active', trial_end: null } },
    };

    it('re-fetches the subscription and writes its current state', async () => {
      const periodEnd = nowSeconds() + 30 * DAY;
      mockStripeInstance.subscriptions.retrieve.mockResolvedValue(
        stripeSubscription({
          status: 'active',
          trial_end: null,
          items: { data: [{ current_period_end: periodEnd }] },
        })
      );
      const { db, updates } = createMockDb();
      mockGetDb.mockReturnValue(db);

      const response = await sendEvent(event);

      expect(response.status).toBe(200);
      expect(mockStripeInstance.subscriptions.retrieve).toHaveBeenCalledWith('sub_test123');
      expect(updates).toHaveLength(1);
      expect(updates[0].values).toMatchObject({ status: 'active', plan: 'pro', trialEndsAt: null });
      expect(updates[0].values.currentPeriodEnd.getTime()).toBe(periodEnd * 1000);
      expect(updates[0].where.value).toBe('sub_test123');
    });

    it('returns 200 without writing when the database is not configured', async () => {
      const response = await sendEvent(event);
      expect(response.status).toBe(200);
      expect(mockStripeInstance.subscriptions.retrieve).not.toHaveBeenCalled();
    });
  });

  describe('subscription state sync', () => {
    const updatedEvent = {
      type: 'customer.subscription.updated',
      data: { object: { id: 'sub_test123', status: 'active' } },
    };

    it('applies the latest Stripe state, not the stale event payload (out-of-order delivery)', async () => {
      // A delayed "active" update arrives after the subscription was canceled.
      mockStripeInstance.subscriptions.retrieve.mockResolvedValue(
        stripeSubscription({ status: 'canceled' })
      );
      const { db, updates } = createMockDb();
      mockGetDb.mockReturnValue(db);

      await sendEvent(updatedEvent);

      expect(updates[0].values.status).toBe('canceled');
    });

    it('keeps the trial end while trialing', async () => {
      const trialEnd = nowSeconds() + 3 * DAY;
      mockStripeInstance.subscriptions.retrieve.mockResolvedValue(
        stripeSubscription({ status: 'trialing', trial_end: trialEnd })
      );
      const { db, updates } = createMockDb();
      mockGetDb.mockReturnValue(db);

      await sendEvent(updatedEvent);

      expect(updates[0].values.status).toBe('active');
      expect(updates[0].values.trialEndsAt.getTime()).toBe(trialEnd * 1000);
    });

    it('clears the trial end when a trial is canceled so access is revoked', async () => {
      mockStripeInstance.subscriptions.retrieve.mockResolvedValue(
        stripeSubscription({ status: 'canceled', trial_end: nowSeconds() + 3 * DAY })
      );
      const { db, updates } = createMockDb();
      mockGetDb.mockReturnValue(db);

      await sendEvent({ ...updatedEvent, type: 'customer.subscription.deleted' });

      expect(updates[0].values.status).toBe('canceled');
      expect(updates[0].values.trialEndsAt).toBeNull();
    });

    it('maps unpaid subscriptions to past_due', async () => {
      mockStripeInstance.subscriptions.retrieve.mockResolvedValue(
        stripeSubscription({ status: 'unpaid', trial_end: null })
      );
      const { db, updates } = createMockDb();
      mockGetDb.mockReturnValue(db);

      await sendEvent(updatedEvent);

      expect(updates[0].values.status).toBe('past_due');
    });

    it('acknowledges the event when the subscription no longer exists in Stripe', async () => {
      mockStripeInstance.subscriptions.retrieve.mockRejectedValue({ code: 'resource_missing' });
      const { db, updates } = createMockDb();
      mockGetDb.mockReturnValue(db);

      const response = await sendEvent(updatedEvent);

      expect(response.status).toBe(200);
      expect(updates).toHaveLength(0);
    });

    it('returns 500 so Stripe retries when the database write fails', async () => {
      mockGetDb.mockReturnValue({
        update: mock(() => {
          throw new Error('db exploded');
        }),
      });

      const response = await sendEvent(updatedEvent);

      expect(response.status).toBe(500);
      expect((await response.json()).error).toBe('Webhook handler failed');
    });
  });

  describe.each(['invoice.paid', 'invoice.payment_failed'])('%s', (type) => {
    it('syncs the subscription referenced by invoice.parent', async () => {
      const { db, updates } = createMockDb();
      mockGetDb.mockReturnValue(db);

      const response = await sendEvent(invoiceEvent(type, 'sub_from_invoice'));

      expect(response.status).toBe(200);
      expect(mockStripeInstance.subscriptions.retrieve).toHaveBeenCalledWith('sub_from_invoice');
      expect(updates).toHaveLength(1);
    });

    it('ignores invoices that are not for a subscription', async () => {
      const { db, updates } = createMockDb();
      mockGetDb.mockReturnValue(db);

      const response = await sendEvent(invoiceEvent(type, null));

      expect(response.status).toBe(200);
      expect(mockStripeInstance.subscriptions.retrieve).not.toHaveBeenCalled();
      expect(updates).toHaveLength(0);
    });
  });

  it('marks the subscription past_due after a failed payment', async () => {
    mockStripeInstance.subscriptions.retrieve.mockResolvedValue(
      stripeSubscription({ status: 'past_due', trial_end: null })
    );
    const { db, updates } = createMockDb();
    mockGetDb.mockReturnValue(db);

    await sendEvent(invoiceEvent('invoice.payment_failed', 'sub_test123'));

    expect(updates[0].values.status).toBe('past_due');
  });

  it('restores active status once a past-due invoice is paid', async () => {
    mockStripeInstance.subscriptions.retrieve.mockResolvedValue(
      stripeSubscription({ status: 'active', trial_end: null })
    );
    const { db, updates } = createMockDb();
    mockGetDb.mockReturnValue(db);

    await sendEvent(invoiceEvent('invoice.paid', { id: 'sub_test123' }));

    expect(mockStripeInstance.subscriptions.retrieve).toHaveBeenCalledWith('sub_test123');
    expect(updates[0].values.status).toBe('active');
  });
});
