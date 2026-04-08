import { describe, it, expect, mock, afterEach } from 'bun:test';
import { middleware, config, matchesRoute } from '@/middleware';

// Mock next-auth/jwt
const mockGetToken = mock((): Promise<Record<string, unknown> | null> => Promise.resolve(null));
mock.module('next-auth/jwt', () => ({
  getToken: mockGetToken,
}));

// Helper to create mock NextRequest
function createMockRequest(pathname: string) {
  return {
    nextUrl: { pathname },
    url: `http://localhost:3000${pathname}`,
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

describe('middleware', () => {
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
