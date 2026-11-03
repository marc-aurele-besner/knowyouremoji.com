import { describe, it, expect, mock, afterEach } from 'bun:test';
import { middleware, config, matchesRoute, hasSecureSessionCookie } from '@/middleware';

// Mock next-auth/jwt
const mockGetToken = mock((): Promise<Record<string, unknown> | null> => Promise.resolve(null));
mock.module('next-auth/jwt', () => ({
  getToken: mockGetToken,
}));

// Helper to create mock NextRequest
function createMockRequest(pathname: string, cookieNames: string[] = []) {
  return {
    nextUrl: { pathname },
    url: `http://localhost:3000${pathname}`,
    cookies: { getAll: () => cookieNames.map((name) => ({ name, value: 'token' })) },
  } as never;
}

afterEach(() => {
  mockGetToken.mockClear();
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

describe('hasSecureSessionCookie', () => {
  it('returns false when there are no cookies', () => {
    expect(hasSecureSessionCookie(createMockRequest('/dashboard'))).toBe(false);
  });

  it('returns false for the non-secure session cookie', () => {
    expect(hasSecureSessionCookie(createMockRequest('/dashboard', ['authjs.session-token']))).toBe(
      false
    );
  });

  it('returns true for the secure session cookie', () => {
    expect(
      hasSecureSessionCookie(createMockRequest('/dashboard', ['__Secure-authjs.session-token']))
    ).toBe(true);
  });

  it('returns true for a chunked secure session cookie', () => {
    expect(
      hasSecureSessionCookie(createMockRequest('/dashboard', ['__Secure-authjs.session-token.0']))
    ).toBe(true);
  });
});

describe('middleware', () => {
  describe('session cookie lookup', () => {
    it('reads the secure cookie when the request carries one (HTTPS)', async () => {
      mockGetToken.mockResolvedValue({ id: 'user-123' });
      const req = createMockRequest('/dashboard/history', ['__Secure-authjs.session-token']);
      const response = await middleware(req);
      expect(response.headers.get('location')).toBeNull();
      expect(mockGetToken).toHaveBeenCalledWith(expect.objectContaining({ secureCookie: true }));
    });

    it('reads the non-secure cookie otherwise (local HTTP)', async () => {
      mockGetToken.mockResolvedValue({ id: 'user-123' });
      const req = createMockRequest('/dashboard/settings', ['authjs.session-token']);
      await middleware(req);
      expect(mockGetToken).toHaveBeenCalledWith(expect.objectContaining({ secureCookie: false }));
    });
  });

  describe('config', () => {
    it('has correct matcher patterns', () => {
      expect(config.matcher).toContain('/dashboard/:path*');
      expect(config.matcher).toContain('/login');
      expect(config.matcher).toContain('/register');
      expect(config.matcher).toContain('/forgot-password');
      expect(config.matcher).toContain('/reset-password');
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
    it('redirects /dashboard to /login when no token', async () => {
      mockGetToken.mockResolvedValue(null);
      const req = createMockRequest('/dashboard');
      const response = await middleware(req);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('redirect=%2Fdashboard');
    });

    it('redirects /dashboard/history to /login', async () => {
      mockGetToken.mockResolvedValue(null);
      const req = createMockRequest('/dashboard/history');
      const response = await middleware(req);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('redirect=%2Fdashboard%2Fhistory');
    });

    it('redirects /dashboard/settings to /login', async () => {
      mockGetToken.mockResolvedValue(null);
      const req = createMockRequest('/dashboard/settings');
      const response = await middleware(req);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
    });
  });

  describe('protected routes (authenticated)', () => {
    it('allows access to /dashboard with valid token', async () => {
      mockGetToken.mockResolvedValue({ id: 'user-123', email: 'test@example.com' });
      const req = createMockRequest('/dashboard');
      const response = await middleware(req);
      expect(response.headers.get('location')).toBeNull();
    });
  });

  describe('auth routes (authenticated)', () => {
    it('redirects /login to /dashboard when authenticated', async () => {
      mockGetToken.mockResolvedValue({ id: 'user-123' });
      const req = createMockRequest('/login');
      const response = await middleware(req);
      expect(response.headers.get('location')).toContain('/dashboard');
    });

    it('redirects /register to /dashboard when authenticated', async () => {
      mockGetToken.mockResolvedValue({ id: 'user-123' });
      const req = createMockRequest('/register');
      const response = await middleware(req);
      expect(response.headers.get('location')).toContain('/dashboard');
    });

    it('redirects /forgot-password to /dashboard when authenticated', async () => {
      mockGetToken.mockResolvedValue({ id: 'user-123' });
      const req = createMockRequest('/forgot-password');
      const response = await middleware(req);
      expect(response.headers.get('location')).toContain('/dashboard');
    });

    it('redirects /reset-password to /dashboard when authenticated', async () => {
      mockGetToken.mockResolvedValue({ id: 'user-123' });
      const req = createMockRequest('/reset-password');
      const response = await middleware(req);
      expect(response.headers.get('location')).toContain('/dashboard');
    });
  });

  describe('auth routes (unauthenticated)', () => {
    it('allows access to /login when not authenticated', async () => {
      mockGetToken.mockResolvedValue(null);
      const req = createMockRequest('/login');
      const response = await middleware(req);
      expect(response.headers.get('location')).toBeNull();
    });

    it('allows access to /register when not authenticated', async () => {
      mockGetToken.mockResolvedValue(null);
      const req = createMockRequest('/register');
      const response = await middleware(req);
      expect(response.headers.get('location')).toBeNull();
    });

    it('allows access to /forgot-password when not authenticated', async () => {
      mockGetToken.mockResolvedValue(null);
      const req = createMockRequest('/forgot-password');
      const response = await middleware(req);
      expect(response.headers.get('location')).toBeNull();
    });

    it('allows access to /reset-password when not authenticated', async () => {
      mockGetToken.mockResolvedValue(null);
      const req = createMockRequest('/reset-password');
      const response = await middleware(req);
      expect(response.headers.get('location')).toBeNull();
    });
  });
});
