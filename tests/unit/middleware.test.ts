import { describe, it, expect, beforeEach, afterEach, spyOn } from 'bun:test';
import {
  middleware,
  config,
  matchesRoute,
  getAccessToken,
  verifySession,
} from '@/middleware';

// Store original env
const originalEnv = { ...process.env };

// Helper to create mock NextRequest
function createMockRequest(
  pathname: string,
  cookies: Record<string, string> = {}
) {
  return {
    nextUrl: { pathname },
    url: `http://localhost:3000${pathname}`,
    cookies: {
      get: (name: string) => {
        const value = cookies[name];
        return value !== undefined ? { value } : undefined;
      },
    },
  } as any;
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://testproject.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe('matchesRoute', () => {
  it('matches exact route', () => {
    expect(matchesRoute('/dashboard', ['/dashboard'])).toBe(true);
  });

  it('matches sub-routes', () => {
    expect(matchesRoute('/dashboard/history', ['/dashboard'])).toBe(true);
  });

  it('does not match unrelated routes', () => {
    expect(matchesRoute('/emoji', ['/dashboard'])).toBe(false);
  });

  it('does not match partial prefix', () => {
    expect(matchesRoute('/dashboardx', ['/dashboard'])).toBe(false);
  });
});

describe('getAccessToken', () => {
  it('returns null when no cookies', () => {
    const req = createMockRequest('/dashboard');
    expect(getAccessToken(req)).toBeNull();
  });

  it('extracts token from sb-project-auth-token cookie', () => {
    const req = createMockRequest('/dashboard', {
      'sb-testproject-auth-token': JSON.stringify({ access_token: 'my-token' }),
    });
    expect(getAccessToken(req)).toBe('my-token');
  });

  it('extracts token from array format cookie', () => {
    const req = createMockRequest('/dashboard', {
      'sb-testproject-auth-token': JSON.stringify(['array-token']),
    });
    expect(getAccessToken(req)).toBe('array-token');
  });

  it('extracts token from custom storage key cookie', () => {
    const req = createMockRequest('/dashboard', {
      'kye-auth-token': JSON.stringify({ access_token: 'custom-token' }),
    });
    expect(getAccessToken(req)).toBe('custom-token');
  });

  it('returns null for invalid JSON in sb cookie', () => {
    const req = createMockRequest('/dashboard', {
      'sb-testproject-auth-token': 'not-json',
    });
    expect(getAccessToken(req)).toBeNull();
  });

  it('returns null for invalid JSON in custom cookie', () => {
    const req = createMockRequest('/dashboard', {
      'kye-auth-token': 'not-json',
    });
    expect(getAccessToken(req)).toBeNull();
  });
});

describe('verifySession', () => {
  it('returns false when Supabase URL is missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    expect(await verifySession('token')).toBe(false);
  });

  it('returns false when anon key is missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(await verifySession('token')).toBe(false);
  });

  it('returns true when API responds ok', async () => {
    const spy = spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{}', { status: 200 })
    );
    expect(await verifySession('valid-token')).toBe(true);
    expect(spy).toHaveBeenCalledWith(
      'https://testproject.supabase.co/auth/v1/user',
      {
        headers: {
          Authorization: 'Bearer valid-token',
          apikey: 'test-anon-key',
        },
      }
    );
    spy.mockRestore();
  });

  it('returns false when API responds with error', async () => {
    const spy = spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Unauthorized', { status: 401 })
    );
    expect(await verifySession('bad-token')).toBe(false);
    spy.mockRestore();
  });

  it('returns false when fetch throws', async () => {
    const spy = spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));
    expect(await verifySession('token')).toBe(false);
    spy.mockRestore();
  });
});

describe('middleware', () => {
  describe('config', () => {
    it('has correct matcher patterns', () => {
      expect(config.matcher).toContain('/dashboard/:path*');
      expect(config.matcher).toContain('/login');
      expect(config.matcher).toContain('/register');
    });
  });

  describe('when Supabase is not configured', () => {
    it('passes through all routes', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const req = createMockRequest('/dashboard');
      const response = await middleware(req);
      expect(response.headers.get('location')).toBeNull();
    });
  });

  describe('non-protected routes', () => {
    it('passes through for non-protected routes', async () => {
      const req = createMockRequest('/emoji/fire');
      const response = await middleware(req);
      expect(response.headers.get('location')).toBeNull();
    });

    it('passes through for root path', async () => {
      const req = createMockRequest('/');
      const response = await middleware(req);
      expect(response.headers.get('location')).toBeNull();
    });
  });

  describe('protected routes (unauthenticated)', () => {
    it('redirects /dashboard to /login when no auth cookie', async () => {
      const req = createMockRequest('/dashboard');
      const response = await middleware(req);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('redirect=%2Fdashboard');
    });

    it('redirects /dashboard/history to /login', async () => {
      const req = createMockRequest('/dashboard/history');
      const response = await middleware(req);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('redirect=%2Fdashboard%2Fhistory');
    });

    it('redirects /dashboard/settings to /login', async () => {
      const req = createMockRequest('/dashboard/settings');
      const response = await middleware(req);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
    });
  });

  describe('protected routes (authenticated)', () => {
    it('allows access to /dashboard with valid session', async () => {
      const spy = spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('{}', { status: 200 })
      );
      const cookies = {
        'sb-testproject-auth-token': JSON.stringify({ access_token: 'valid-token' }),
      };
      const req = createMockRequest('/dashboard', cookies);
      const response = await middleware(req);
      expect(response.headers.get('location')).toBeNull();
      spy.mockRestore();
    });

    it('allows access with custom storage key cookie', async () => {
      const spy = spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('{}', { status: 200 })
      );
      const cookies = {
        'kye-auth-token': JSON.stringify({ access_token: 'valid-token' }),
      };
      const req = createMockRequest('/dashboard', cookies);
      const response = await middleware(req);
      expect(response.headers.get('location')).toBeNull();
      spy.mockRestore();
    });

    it('redirects to login when session verification fails', async () => {
      const spy = spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('Unauthorized', { status: 401 })
      );
      const cookies = {
        'sb-testproject-auth-token': JSON.stringify({ access_token: 'bad-token' }),
      };
      const req = createMockRequest('/dashboard', cookies);
      const response = await middleware(req);
      expect(response.headers.get('location')).toContain('/login');
      spy.mockRestore();
    });
  });

  describe('auth routes (authenticated)', () => {
    it('redirects /login to /dashboard when authenticated', async () => {
      const spy = spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('{}', { status: 200 })
      );
      const cookies = {
        'sb-testproject-auth-token': JSON.stringify({ access_token: 'valid-token' }),
      };
      const req = createMockRequest('/login', cookies);
      const response = await middleware(req);
      expect(response.headers.get('location')).toContain('/dashboard');
      spy.mockRestore();
    });

    it('redirects /register to /dashboard when authenticated', async () => {
      const spy = spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('{}', { status: 200 })
      );
      const cookies = {
        'sb-testproject-auth-token': JSON.stringify({ access_token: 'valid-token' }),
      };
      const req = createMockRequest('/register', cookies);
      const response = await middleware(req);
      expect(response.headers.get('location')).toContain('/dashboard');
      spy.mockRestore();
    });
  });

  describe('auth routes (unauthenticated)', () => {
    it('allows access to /login when not authenticated', async () => {
      const req = createMockRequest('/login');
      const response = await middleware(req);
      expect(response.headers.get('location')).toBeNull();
    });

    it('allows access to /register when not authenticated', async () => {
      const req = createMockRequest('/register');
      const response = await middleware(req);
      expect(response.headers.get('location')).toBeNull();
    });
  });
});
