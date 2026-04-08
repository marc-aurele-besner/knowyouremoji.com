import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';

const mockAuth = mock(() =>
  Promise.resolve({ user: { id: 'user-123', email: 'test@example.com' } })
);

const mockGetDb = mock(() => ({}));

const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

const mockGetUserSubscription = mock(() =>
  Promise.resolve({
    id: 'sub-123',
    userId: 'user-123',
    status: 'active',
    plan: 'pro',
    stripeCustomerId: 'cus_test_123',
    stripeSubscriptionId: 'sub_test_123',
    currentPeriodEnd: futureDate,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  })
);

const mockSubscriptionsUpdate = mock(() =>
  Promise.resolve({
    id: 'sub_test_123',
    cancel_at_period_end: true,
    cancel_at: Math.floor(futureDate.getTime() / 1000),
  })
);

const mockGetStripe = mock(() => ({
  subscriptions: {
    update: mockSubscriptionsUpdate,
  },
}));

const mockDbUpdate = mock(() => ({
  set: mock(() => ({
    where: mock(() => Promise.resolve()),
  })),
}));

const mockDb = {
  update: mockDbUpdate,
};

mock.module('@/lib/auth', () => ({
  auth: mockAuth,
}));

mock.module('@/lib/db', () => ({
  getDb: mockGetDb,
}));

mock.module('@/lib/db/schema', () => ({
  users: { id: 'id' },
  accounts: {},
  sessions: {},
  verificationTokens: {},
  interpretations: {},
  subscriptions: { id: 'id' },
  emojiPageViews: {},
}));

mock.module('drizzle-orm', () => ({
  eq: mock((col: unknown, val: unknown) => ({ col, val })),
}));

mock.module('@/lib/stripe', () => ({
  getStripe: mockGetStripe,
}));

mock.module('@/lib/subscriptions', () => ({
  getUserSubscription: mockGetUserSubscription,
}));

const { POST } = await import('@/app/api/billing/cancel/route');

describe('POST /api/billing/cancel', () => {
  beforeEach(() => {
    mockAuth.mockImplementation(() =>
      Promise.resolve({ user: { id: 'user-123', email: 'test@example.com' } })
    );
    mockGetDb.mockImplementation(() => mockDb as never);
    mockGetStripe.mockImplementation(
      () =>
        ({
          subscriptions: { update: mockSubscriptionsUpdate },
        }) as never
    );
    mockGetUserSubscription.mockImplementation(() =>
      Promise.resolve({
        id: 'sub-123',
        userId: 'user-123',
        status: 'active',
        plan: 'pro',
        stripeCustomerId: 'cus_test_123',
        stripeSubscriptionId: 'sub_test_123',
        currentPeriodEnd: futureDate,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      })
    );
    mockSubscriptionsUpdate.mockImplementation(() =>
      Promise.resolve({
        id: 'sub_test_123',
        cancel_at_period_end: true,
        cancel_at: Math.floor(futureDate.getTime() / 1000),
      })
    );
    mockDbUpdate.mockImplementation(
      () =>
        ({
          set: mock(() => ({
            where: mock(() => Promise.resolve()),
          })),
        }) as never
    );
  });

  afterEach(() => {
    mockAuth.mockClear();
    mockGetDb.mockClear();
    mockGetStripe.mockClear();
    mockGetUserSubscription.mockClear();
    mockSubscriptionsUpdate.mockClear();
    mockDbUpdate.mockClear();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockImplementation((() => Promise.resolve(null)) as never);
    const res = await POST();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 401 when session has no user id', async () => {
    mockAuth.mockImplementation((() => Promise.resolve({ user: {} })) as never);
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it('returns 503 when database is not configured', async () => {
    mockGetDb.mockImplementation((() => null) as never);
    const res = await POST();
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toBe('Database is not configured');
  });

  it('returns 503 when Stripe is not configured', async () => {
    mockGetStripe.mockImplementation((() => null) as never);
    const res = await POST();
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toBe('Stripe is not configured');
  });

  it('returns 404 when user has no subscription', async () => {
    mockGetUserSubscription.mockImplementation((() => Promise.resolve(null)) as never);
    const res = await POST();
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('No active subscription found');
  });

  it('returns 404 when subscription has no stripeSubscriptionId', async () => {
    mockGetUserSubscription.mockImplementation((() =>
      Promise.resolve({
        id: 'sub-123',
        userId: 'user-123',
        status: 'active',
        plan: 'pro',
        stripeCustomerId: 'cus_test_123',
        stripeSubscriptionId: null,
        currentPeriodEnd: futureDate,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      })) as never);
    const res = await POST();
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('No active subscription found');
  });

  it('returns 400 when subscription is not active', async () => {
    mockGetUserSubscription.mockImplementation((() =>
      Promise.resolve({
        id: 'sub-123',
        userId: 'user-123',
        status: 'canceled',
        plan: 'pro',
        stripeCustomerId: 'cus_test_123',
        stripeSubscriptionId: 'sub_test_123',
        currentPeriodEnd: futureDate,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      })) as never);
    const res = await POST();
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Subscription is not active');
  });

  it('returns 400 when subscription status is free', async () => {
    mockGetUserSubscription.mockImplementation((() =>
      Promise.resolve({
        id: 'sub-123',
        userId: 'user-123',
        status: 'free',
        plan: 'free',
        stripeCustomerId: 'cus_test_123',
        stripeSubscriptionId: 'sub_test_123',
        currentPeriodEnd: null,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      })) as never);
    const res = await POST();
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Subscription is not active');
  });

  it('cancels subscription and returns accessUntil date', async () => {
    const res = await POST();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe('Subscription canceled');
    expect(body.accessUntil).toBeDefined();
    expect(mockSubscriptionsUpdate).toHaveBeenCalledWith('sub_test_123', {
      cancel_at_period_end: true,
    });
    expect(mockDbUpdate).toHaveBeenCalled();
  });

  it('uses existing currentPeriodEnd when Stripe returns no cancel_at', async () => {
    mockSubscriptionsUpdate.mockImplementation((() =>
      Promise.resolve({
        id: 'sub_test_123',
        cancel_at_period_end: true,
        cancel_at: null,
      })) as never);
    const res = await POST();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe('Subscription canceled');
    expect(body.accessUntil).toBe(futureDate.toISOString());
  });

  it('returns null accessUntil when no period end available', async () => {
    mockGetUserSubscription.mockImplementation((() =>
      Promise.resolve({
        id: 'sub-123',
        userId: 'user-123',
        status: 'active',
        plan: 'pro',
        stripeCustomerId: 'cus_test_123',
        stripeSubscriptionId: 'sub_test_123',
        currentPeriodEnd: null,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      })) as never);
    mockSubscriptionsUpdate.mockImplementation((() =>
      Promise.resolve({
        id: 'sub_test_123',
        cancel_at_period_end: true,
        cancel_at: null,
      })) as never);
    const res = await POST();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe('Subscription canceled');
    expect(body.accessUntil).toBeNull();
  });

  it('returns 500 when an unexpected error occurs', async () => {
    mockAuth.mockImplementation(() => {
      throw new Error('Unexpected');
    });
    const res = await POST();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('An unexpected error occurred');
  });
});
