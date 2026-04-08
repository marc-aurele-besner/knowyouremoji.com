import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';

const mockAuth = mock(() =>
  Promise.resolve({ user: { id: 'user-123', email: 'test@example.com' } })
);

const mockGetDb = mock(() => ({}));

const mockGetUserSubscription = mock(() =>
  Promise.resolve({
    id: 'sub-123',
    userId: 'user-123',
    status: 'active',
    plan: 'pro',
    stripeCustomerId: 'cus_test_123',
    stripeSubscriptionId: 'sub_test_123',
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  })
);

const mockPortalCreate = mock(() =>
  Promise.resolve({ url: 'https://billing.stripe.com/session/test_123' })
);

const mockGetStripe = mock(() => ({
  billingPortal: {
    sessions: {
      create: mockPortalCreate,
    },
  },
}));

const mockGetEnv = mock(() => ({
  appUrl: 'http://localhost:3000',
}));

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
  subscriptions: {},
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

mock.module('@/lib/env', () => ({
  getEnv: mockGetEnv,
}));

const { POST } = await import('@/app/api/billing/portal/route');

describe('POST /api/billing/portal', () => {
  beforeEach(() => {
    mockAuth.mockImplementation(() =>
      Promise.resolve({ user: { id: 'user-123', email: 'test@example.com' } })
    );
    mockGetDb.mockImplementation(() => ({}) as never);
    mockGetStripe.mockImplementation(
      () =>
        ({
          billingPortal: { sessions: { create: mockPortalCreate } },
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
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      })
    );
    mockPortalCreate.mockImplementation(() =>
      Promise.resolve({ url: 'https://billing.stripe.com/session/test_123' })
    );
    mockGetEnv.mockImplementation(
      () =>
        ({
          appUrl: 'http://localhost:3000',
        }) as never
    );
  });

  afterEach(() => {
    mockAuth.mockClear();
    mockGetDb.mockClear();
    mockGetStripe.mockClear();
    mockGetUserSubscription.mockClear();
    mockPortalCreate.mockClear();
    mockGetEnv.mockClear();
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
    expect(body.error).toBe('No billing account found');
  });

  it('returns 404 when subscription has no stripeCustomerId', async () => {
    mockGetUserSubscription.mockImplementation((() =>
      Promise.resolve({
        id: 'sub-123',
        userId: 'user-123',
        status: 'free',
        plan: 'free',
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        currentPeriodEnd: null,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      })) as never);
    const res = await POST();
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('No billing account found');
  });

  it('creates a billing portal session and returns the URL', async () => {
    const res = await POST();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toBe('https://billing.stripe.com/session/test_123');
    expect(mockPortalCreate).toHaveBeenCalledWith({
      customer: 'cus_test_123',
      return_url: 'http://localhost:3000/dashboard',
    });
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
