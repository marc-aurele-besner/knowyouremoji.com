import { describe, it, expect, mock, afterEach, beforeEach } from 'bun:test';

const mockAuth = mock(() =>
  Promise.resolve({ user: { id: 'user-123', email: 'test@example.com' } })
);

const mockDelete = mock(() => ({
  where: mock(() => Promise.resolve()),
}));

const mockGetDb = mock(() => ({
  delete: mockDelete,
}));

mock.module('@/lib/auth', () => ({
  auth: mockAuth,
}));

mock.module('@/lib/db', () => ({
  getDb: mockGetDb,
}));

mock.module('@/lib/db/schema', () => ({
  users: { id: 'id' },
}));

mock.module('drizzle-orm', () => ({
  eq: mock((col: unknown, val: unknown) => ({ col, val })),
}));

const { DELETE } = await import('@/app/api/auth/delete-account/route');

describe('DELETE /api/auth/delete-account', () => {
  beforeEach(() => {
    mockAuth.mockImplementation(() =>
      Promise.resolve({ user: { id: 'user-123', email: 'test@example.com' } })
    );
    mockGetDb.mockImplementation(
      () =>
        ({
          delete: mockDelete,
        }) as never
    );
    mockDelete.mockImplementation(
      () =>
        ({
          where: mock(() => Promise.resolve()),
        }) as never
    );
  });

  afterEach(() => {
    mockAuth.mockClear();
    mockGetDb.mockClear();
    mockDelete.mockClear();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockImplementation((() => Promise.resolve(null)) as never);
    const res = await DELETE();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 401 when session has no user id', async () => {
    mockAuth.mockImplementation((() => Promise.resolve({ user: {} })) as never);
    const res = await DELETE();
    expect(res.status).toBe(401);
  });

  it('returns 503 when database is not configured', async () => {
    mockGetDb.mockImplementation((() => null) as never);
    const res = await DELETE();
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toBe('Database is not configured');
  });

  it('deletes the user account successfully', async () => {
    const res = await DELETE();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(mockDelete).toHaveBeenCalled();
  });

  it('returns 500 when an unexpected error occurs', async () => {
    mockAuth.mockImplementation(() => {
      throw new Error('Unexpected');
    });
    const res = await DELETE();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('An unexpected error occurred');
  });
});
