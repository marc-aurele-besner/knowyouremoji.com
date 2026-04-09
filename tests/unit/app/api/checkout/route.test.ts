import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';

const mockAuth = mock(() =>
  Promise.resolve({ user: { id: 'user-123', email: 'test@example.com' } })
);

const mockGetDb = mock(() => ({
  select: mock(() => ({
    from: mock(() => ({
      where: mock(() => ({
        limit: mock(() => Promise.resolve([{ email: 'test@example.com' }])),
      })),
    })),
  })),
}));

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

const mockCheckoutSessionsCreate = mock(() =>
  Promise.resolve({ url: 'https://checkout.stripe.com/session/test_456' })
);

const mockCustomersList = mock(() =>
  Promise.resolve({ data: [{ id: 'cus_existing_123' }] })
);

const mockCustomersCreate = mock(() =>
  Promise.resolve({ id: 'cus_new_456' })
);

const mockGetStripe = mock(() => ({
  checkout: {
    sessions: {
      create: mockCheckoutSessionsCreate,
    },
  },
  customers: {
    list: mockCustomersList,
    create: mockCustomersCreate,
  },
}));

const mockGetEnv = mock(() => ({
  appUrl: 'http://localhost:3000',
  stripeProPriceId: 'price_test_pro',
}));

mock.module('@/lib/auth', () => ({
  auth: mockAuth,
}));

mock.module('@/lib/db', () => ({
  getDb: mockGetDb,
}));

mock.module('@/lib/db/schema', () => ({
  users: { id: 'id', email: 'email' },
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

mock.module('@/lib/env', () => ({
  getEnv: mockGetEnv,
}));

mock.module('@/lib/subscriptions', () => ({
  getUserSubscription: mockGetUserSubscription,
}));

const { POST } = await import('@/app/api/checkout/route');

function createMockDb(rows: Array<{ email: string | null }> = [{ email: 'test@example.com' }]) {
  return {
    select: mock(() => ({
      from: mock(() => ({
        where: mock(() => ({
          limit: mock(() => Promise.resolve(rows)),
        })),
      })),
    })),
  };
}

describe('POST /api/checkout', () => {
  beforeEach(() => {
    mockAuth.mockImplementation(() =>
      Promise.resolve({ user: { id: 'user-123', email: 'test@example.com' } })
    );
    mockGetDb.mockImplementation(() => createMockDb() as never);
    mockGetStripe.mockImplementation(
      () =>
        ({
          checkout: { sessions: { create: mockCheckoutSessionsCreate } },
          customers: { list: mockCustomersList, create: mockCustomersCreate },
        }) as never
    );
    mockGetEnv.mockImplementation(
      () =>
        ({
          appUrl: 'http://localhost:3000',
          stripeProPriceId: 'price_test_pro',
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
    mockCheckoutSessionsCreate.mockImplementation(() =>
      Promise.resolve({ url: 'https://checkout.stripe.com/session/test_456' })
    );
    mockCustomersList.mockImplementation(() =>
      Promise.resolve({ data: [{ id: 'cus_existing_123' }] })
    );
    mockCustomersCreate.mockImplementation(() =>
      Promise.resolve({ id: 'cus_new_456' })
    );
  });

  afterEach(() => {
    mockAuth.mockClear();
    mockGetDb.mockClear();
    mockGetStripe.mockClear();
    mockGetEnv.mockClear();
    mockGetUserSubscription.mockClear();
    mockCheckoutSessionsCreate.mockClear();
    mockCustomersList.mockClear();
    mockCustomersCreate.mockClear();
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

  it('returns 503 when Stripe price is not configured', async () => {
    // No existing subscription so it needs to look up the user
    mockGetUserSubscription.mockImplementation((() => Promise.resolve(null)) as never);
    mockGetEnv.mockImplementation(
      () =>
        ({
          appUrl: 'http://localhost:3000',
          stripeProPriceId: undefined,
        }) as never
    );
    const res = await POST();
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toBe('Stripe price not configured');
  });

  it('uses existing stripeCustomerId from subscription', async () => {
    const res = await POST();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toBe('https://checkout.stripe.com/session/test_456');
    expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith({
      customer: 'cus_test_123',
      payment_method_types: ['card'],
      line_items: [{ price: 'price_test_pro', quantity: 1 }],
      mode: 'subscription',
      subscription_data: { trial_period_days: 7 },
      success_url: 'http://localhost:3000/dashboard?checkout=success',
      cancel_url: 'http://localhost:3000/dashboard?checkout=canceled',
      metadata: { userId: 'user-123' },
    });
  });

  it('finds existing Stripe customer by email when no subscription', async () => {
    mockGetUserSubscription.mockImplementation((() => Promise.resolve(null)) as never);
    mockCustomersList.mockImplementation(() =>
      Promise.resolve({ data: [{ id: 'cus_found_789' }] })
    );

    const res = await POST();
    expect(res.status).toBe(200);
    expect(mockCustomersList).toHaveBeenCalledWith({
      email: 'test@example.com',
      limit: 1,
    });
    expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ customer: 'cus_found_789' })
    );
  });

  it('creates new Stripe customer when none exists', async () => {
    mockGetUserSubscription.mockImplementation((() => Promise.resolve(null)) as never);
    mockCustomersList.mockImplementation(() =>
      Promise.resolve({ data: [] })
    );

    const res = await POST();
    expect(res.status).toBe(200);
    expect(mockCustomersCreate).toHaveBeenCalledWith({
      email: 'test@example.com',
      metadata: { userId: 'user-123' },
    });
    expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ customer: 'cus_new_456' })
    );
  });

  it('returns 400 when user email is not found', async () => {
    mockGetUserSubscription.mockImplementation((() => Promise.resolve(null)) as never);
    mockGetDb.mockImplementation(() => createMockDb([]) as never);

    const res = await POST();
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('User email not found');
  });

  it('uses subscription without stripeCustomerId and looks up email', async () => {
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
    expect(res.status).toBe(200);
    expect(mockCustomersList).toHaveBeenCalled();
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
