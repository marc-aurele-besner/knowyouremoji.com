import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';

const originalEnv = { ...process.env };

const mockExchangeCodeForSession = mock((): Promise<{ error: { message: string } | null }> => Promise.resolve({ error: null }));
const mockCreateClient = mock(() => ({
  auth: {
    exchangeCodeForSession: mockExchangeCodeForSession,
  },
}));

mock.module('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}));

const { GET } = await import('@/app/auth/callback/route');

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://testproject.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  mockExchangeCodeForSession.mockImplementation(() => Promise.resolve({ error: null }));
});

afterEach(() => {
  process.env = { ...originalEnv };
  mockExchangeCodeForSession.mockClear();
  mockCreateClient.mockClear();
});

function createMockRequest(searchParams: Record<string, string> = {}): Request {
  const url = new URL('http://localhost:3000/auth/callback');
  Object.entries(searchParams).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString());
}

describe('GET /auth/callback', () => {
  it('redirects to login with error when no code provided', async () => {
    const req = createMockRequest();
    const response = await GET(req as any);
    const location = response.headers.get('location');
    expect(location).toContain('/login');
    expect(location).toContain('error=missing_code');
  });

  it('redirects to login when Supabase is not configured', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const req = createMockRequest({ code: 'test-code' });
    const response = await GET(req as any);
    const location = response.headers.get('location');
    expect(location).toContain('/login');
    expect(location).toContain('error=auth_not_configured');
  });

  it('exchanges code for session and redirects to dashboard', async () => {
    const req = createMockRequest({ code: 'valid-code' });
    const response = await GET(req as any);
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('valid-code');
    const location = response.headers.get('location');
    expect(location).toContain('/dashboard');
  });

  it('redirects to custom redirect URL on success', async () => {
    const req = createMockRequest({ code: 'valid-code', redirect: '/dashboard/settings' });
    const response = await GET(req as any);
    const location = response.headers.get('location');
    expect(location).toContain('/dashboard/settings');
  });

  it('redirects to login with error when exchange fails', async () => {
    mockExchangeCodeForSession.mockImplementation(() =>
      Promise.resolve({ error: { message: 'Invalid code' } })
    );
    const req = createMockRequest({ code: 'bad-code' });
    const response = await GET(req as any);
    const location = response.headers.get('location');
    expect(location).toContain('/login');
    expect(location).toContain('error=auth_failed');
  });

  it('redirects to login with error when exchange throws', async () => {
    mockExchangeCodeForSession.mockImplementation(() =>
      Promise.reject(new Error('Network error'))
    );
    const req = createMockRequest({ code: 'code' });
    const response = await GET(req as any);
    const location = response.headers.get('location');
    expect(location).toContain('/login');
    expect(location).toContain('error=auth_error');
  });
});
