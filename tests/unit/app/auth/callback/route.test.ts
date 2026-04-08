import { describe, it, expect, mock, beforeEach } from 'bun:test';

const mockExchangeCodeForSession = mock(
  (): Promise<{ error: { message: string } | null }> => Promise.resolve({ error: null })
);

mock.module('@/lib/supabase', () => ({
  getSupabaseServerClient: () => ({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
    },
  }),
}));

const { GET } = await import('@/app/auth/callback/route');

beforeEach(() => {
  mockExchangeCodeForSession.mockImplementation(() => Promise.resolve({ error: null }));
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
    // Override mock to return null (not configured)
    mock.module('@/lib/supabase', () => ({
      getSupabaseServerClient: () => null,
    }));
    const { GET: GET2 } = await import('@/app/auth/callback/route');
    const req = createMockRequest({ code: 'test-code' });
    const response = await GET2(req as any);
    const location = response.headers.get('location');
    expect(location).toContain('/login');
    expect(location).toContain('error=auth_not_configured');

    // Restore mock
    mock.module('@/lib/supabase', () => ({
      getSupabaseServerClient: () => ({
        auth: {
          exchangeCodeForSession: mockExchangeCodeForSession,
        },
      }),
    }));
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
