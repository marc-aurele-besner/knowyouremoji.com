import { describe, it, expect, mock, afterEach } from 'bun:test';
import { NextRequest } from 'next/server';

const mockSql = mock(async (..._args: unknown[]) => [] as unknown[]);

mock.module('@/lib/neon', () => ({
  getNeonSql: () =>
    process.env.DATABASE_URL ? (mockSql as unknown as import('@/lib/neon').NeonSql) : null,
}));

const { POST } = await import('@/app/api/book-banner/event/route');

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/book-banner/event', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

const validEvent = { type: 'view', banner: 'card-texting-in-code', path: '/emoji/fire' };

describe('POST /api/book-banner/event', () => {
  afterEach(() => {
    Reflect.deleteProperty(process.env, 'DATABASE_URL');
    mockSql.mockClear();
    mockSql.mockImplementation(async () => []);
  });

  it('returns ok without touching the database when DATABASE_URL is not set', async () => {
    const res = await POST(makeRequest(validEvent));
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
    expect(mockSql).not.toHaveBeenCalled();
  });

  it('records a view event', async () => {
    process.env.DATABASE_URL = 'postgresql://test';
    const res = await POST(makeRequest(validEvent));
    expect(res.status).toBe(200);
    expect(mockSql).toHaveBeenCalledTimes(1);
    const [strings, ...values] = mockSql.mock.calls[0] as [TemplateStringsArray, ...unknown[]];
    expect(strings.join('?')).toContain('INSERT INTO book_banner_events');
    expect(values).toEqual(['view', 'card-texting-in-code', '/emoji/fire']);
  });

  it('records a click event', async () => {
    process.env.DATABASE_URL = 'postgresql://test';
    const res = await POST(makeRequest({ ...validEvent, type: 'click', banner: 'card-ts-pmo' }));
    expect(res.status).toBe(200);
    const [, ...values] = mockSql.mock.calls[0] as [TemplateStringsArray, ...unknown[]];
    expect(values).toEqual(['click', 'card-ts-pmo', '/emoji/fire']);
  });

  it.each([
    ['unknown event type', { ...validEvent, type: 'hover' }],
    ['unknown banner', { ...validEvent, banner: 'book-cover-01' }],
    ['relative path', { ...validEvent, path: 'emoji/fire' }],
    ['overlong path', { ...validEvent, path: `/${'a'.repeat(600)}` }],
    ['missing fields', {}],
    ['null body', null],
  ])('returns 400 for %s', async (_label, body) => {
    process.env.DATABASE_URL = 'postgresql://test';
    const res = await POST(makeRequest(body));
    expect(res.status).toBe(400);
    expect(mockSql).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid JSON', async () => {
    process.env.DATABASE_URL = 'postgresql://test';
    const res = await POST(makeRequest('not json'));
    expect(res.status).toBe(400);
  });

  it('returns ok even when the insert fails', async () => {
    process.env.DATABASE_URL = 'postgresql://test';
    const origErr = console.error;
    console.error = () => {};
    mockSql.mockImplementation(async () => {
      throw new Error('db error');
    });
    try {
      const res = await POST(makeRequest(validEvent));
      expect(res.status).toBe(200);
      expect((await res.json()).ok).toBe(true);
    } finally {
      console.error = origErr;
    }
  });
});
