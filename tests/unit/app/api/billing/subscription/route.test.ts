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
    currentPeriodEnd: new Date('2026-06-01T00:00:00.000Z'),
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  })
);

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

mock.module('@/lib/subscriptions', () => ({
  getUserSubscription: mockGetUserSubscription,
}));

const { GET } = await import('@/app/api/billing/subscription/route');

describe('GET /api/billing/subscription', () => {
  beforeEach(() => {
    mockAuth.mockImplementation(() =>
      Promise.resolve({ user: { id: 'user-123', email: 'test@example.com' } })
    );
    mockGetDb.mockImplementation(() => ({}) as never);
    mockGetUserSubscription.mockImplementation(() =>
      Promise.resolve({
        id: 'sub-123',
        userId: 'user-123',
        status: 'active',
        plan: 'pro',
        stripeCustomerId: 'cus_test_123',
        stripeSubscriptionId: 'sub_test_123',
        currentPeriodEnd: new Date('2026-06-01T00:00:00.000Z'),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      })
    );
  });

  afterEach(() => {
    mockAuth.mockClear();
    mockGetDb.mockClear();
    mockGetUserSubscription.mockClear();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockImplementation((() => Promise.resolve(null)) as never);
    const res = await GET();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 401 when session has no user id', async () => {
    mockAuth.mockImplementation((() => Promise.resolve({ user: {} })) as never);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns 503 when database is not configured', async () => {
    mockGetDb.mockImplementation((() => null) as never);
    const res = await GET();
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toBe('Database is not configured');
  });

  it('returns free plan when no subscription exists', async () => {
    mockGetUserSubscription.mockImplementation((() => Promise.resolve(null)) as never);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('free');
    expect(body.plan).toBe('free');
    expect(body.stripeCustomerId).toBeNull();
    expect(body.stripeSubscriptionId).toBeNull();
    expect(body.currentPeriodEnd).toBeNull();
  });

  it('returns subscription data for active subscription', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('active');
    expect(body.plan).toBe('pro');
    expect(body.stripeCustomerId).toBe('cus_test_123');
    expect(body.stripeSubscriptionId).toBe('sub_test_123');
    expect(body.currentPeriodEnd).toBe('2026-06-01T00:00:00.000Z');
  });

  it('returns subscription data with null currentPeriodEnd', async () => {
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
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.currentPeriodEnd).toBeNull();
  });

  it('returns 500 when an unexpected error occurs', async () => {
    mockAuth.mockImplementation(() => {
      throw new Error('Unexpected');
    });
    const res = await GET();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('An unexpected error occurred');
  });
});
