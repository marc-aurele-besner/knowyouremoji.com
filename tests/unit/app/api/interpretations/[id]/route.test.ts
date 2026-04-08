import { describe, it, expect, mock, afterEach, beforeEach } from 'bun:test';

const mockAuth = mock(() =>
  Promise.resolve({ user: { id: 'user-123', email: 'test@example.com' } })
);

const sampleRow = {
  id: 'interp-1',
  message: 'Hey 😊',
  interpretation: 'A friendly greeting.',
  emojiCount: 1,
  createdAt: new Date('2026-04-01T10:00:00Z'),
};

const mockLimit = mock(() => Promise.resolve([sampleRow]));

const mockWhere = mock(() => ({
  limit: mockLimit,
}));

const mockFrom = mock(() => ({
  where: mockWhere,
}));

const mockSelect = mock(() => ({
  from: mockFrom,
}));

const mockGetDb = mock(
  () =>
    ({
      select: mockSelect,
    }) as never
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
  interpretations: {
    id: 'id',
    userId: 'user_id',
    message: 'message',
    interpretation: 'interpretation',
    emojiCount: 'emoji_count',
    createdAt: 'created_at',
  },
  emojiPageViews: {},
}));

mock.module('drizzle-orm', () => ({
  eq: mock((col: unknown, val: unknown) => ({ col, val })),
  and: mock((...conditions: unknown[]) => ({ conditions })),
  desc: mock((col: unknown) => ({ col, direction: 'desc' })),
}));

const { GET } = await import('@/app/api/interpretations/[id]/route');

const makeRequest = () => new Request('http://localhost:3000/api/interpretations/interp-1');
const makeParams = (id = 'interp-1') => ({ params: Promise.resolve({ id }) });

describe('GET /api/interpretations/[id]', () => {
  beforeEach(() => {
    mockAuth.mockImplementation(() =>
      Promise.resolve({ user: { id: 'user-123', email: 'test@example.com' } })
    );
    mockGetDb.mockImplementation(
      () =>
        ({
          select: mockSelect,
        }) as never
    );
    mockSelect.mockImplementation(() => ({
      from: mockFrom,
    }));
    mockFrom.mockImplementation(() => ({
      where: mockWhere,
    }));
    mockWhere.mockImplementation(() => ({
      limit: mockLimit,
    }));
    mockLimit.mockImplementation(() => Promise.resolve([sampleRow]));
  });

  afterEach(() => {
    mockAuth.mockClear();
    mockGetDb.mockClear();
    mockSelect.mockClear();
    mockFrom.mockClear();
    mockWhere.mockClear();
    mockLimit.mockClear();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockImplementation(() => Promise.resolve(null) as never);
    const response = await GET(makeRequest(), makeParams());
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 401 when session has no user id', async () => {
    mockAuth.mockImplementation(() => Promise.resolve({ user: {} }) as never);
    const response = await GET(makeRequest(), makeParams());
    expect(response.status).toBe(401);
  });

  it('returns 503 when database is not configured', async () => {
    mockGetDb.mockImplementation(() => null as never);
    const response = await GET(makeRequest(), makeParams());
    expect(response.status).toBe(503);
    const data = await response.json();
    expect(data.error).toBe('Database is not configured');
  });

  it('returns 404 when interpretation not found', async () => {
    mockLimit.mockImplementation(() => Promise.resolve([]));
    const response = await GET(makeRequest(), makeParams('nonexistent'));
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Interpretation not found');
  });

  it('returns interpretation data successfully', async () => {
    const response = await GET(makeRequest(), makeParams());
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.data).toEqual({
      id: 'interp-1',
      message: 'Hey 😊',
      interpretation: 'A friendly greeting.',
      emoji_count: 1,
      created_at: '2026-04-01T10:00:00.000Z',
    });
  });

  it('returns 500 on unexpected error', async () => {
    mockSelect.mockImplementation(() => {
      throw new Error('Unexpected');
    });
    const response = await GET(makeRequest(), makeParams());
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('An unexpected error occurred');
  });
});
