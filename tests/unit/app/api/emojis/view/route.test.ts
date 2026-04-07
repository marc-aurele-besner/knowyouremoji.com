import { describe, it, expect, mock, afterEach } from 'bun:test';
import { NextRequest } from 'next/server';

const mockSql = mock(async () => []);

mock.module('@/lib/neon', () => ({
  getNeonSql: () =>
    process.env.DATABASE_URL ? (mockSql as unknown as import('@/lib/neon').NeonSql) : null,
}));

const { POST } = await import('@/app/api/emojis/view/route');

describe('POST /api/emojis/view', () => {
  afterEach(() => {
    Reflect.deleteProperty(process.env, 'DATABASE_URL');
    mockSql.mockClear();
    mockSql.mockImplementation(async () => []);
  });

  it('returns ok when DATABASE_URL is not set', async () => {
    Reflect.deleteProperty(process.env, 'DATABASE_URL');
    const req = new NextRequest('http://localhost/api/emojis/view', {
      method: 'POST',
      body: JSON.stringify({ slug: 'fire' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(mockSql).not.toHaveBeenCalled();
  });

  it('records a page view for a valid slug', async () => {
    process.env.DATABASE_URL = 'postgresql://test';
    const req = new NextRequest('http://localhost/api/emojis/view', {
      method: 'POST',
      body: JSON.stringify({ slug: 'fire' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockSql).toHaveBeenCalled();
  });

  it('returns 400 for invalid slug', async () => {
    process.env.DATABASE_URL = 'postgresql://test';
    const req = new NextRequest('http://localhost/api/emojis/view', {
      method: 'POST',
      body: JSON.stringify({ slug: 'bad slug!' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(mockSql).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid JSON', async () => {
    process.env.DATABASE_URL = 'postgresql://test';
    const req = new NextRequest('http://localhost/api/emojis/view', {
      method: 'POST',
      body: 'not json',
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing slug', async () => {
    process.env.DATABASE_URL = 'postgresql://test';
    const req = new NextRequest('http://localhost/api/emojis/view', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns ok even when SQL insert fails', async () => {
    process.env.DATABASE_URL = 'postgresql://test';
    const origErr = console.error;
    console.error = () => {};
    mockSql.mockImplementation(async () => {
      throw new Error('db error');
    });
    try {
      const req = new NextRequest('http://localhost/api/emojis/view', {
        method: 'POST',
        body: JSON.stringify({ slug: 'fire' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      expect((await res.json()).ok).toBe(true);
    } finally {
      console.error = origErr;
    }
  });
});
