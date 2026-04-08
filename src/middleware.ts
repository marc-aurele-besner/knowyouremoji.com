import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Routes that require authentication
 */
const PROTECTED_ROUTES = ['/dashboard'];

/**
 * Routes that should redirect to dashboard if already authenticated
 */
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

/**
 * Storage key for Supabase auth session
 */
const STORAGE_KEY = 'kye-auth-token';

/**
 * Check if a pathname matches any of the given route prefixes
 */
export function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/**
 * Extract the Supabase project ref from the URL
 */
function getSupabaseProjectRef(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const match = url.match(/https:\/\/([^.]+)\./);
  return match?.[1] || '';
}

/**
 * Extract the access token from the request cookies
 */
export function getAccessToken(request: NextRequest): string | null {
  const authCookie = request.cookies.get(`sb-${getSupabaseProjectRef()}-auth-token`);
  if (authCookie) {
    try {
      const parsed = JSON.parse(authCookie.value);
      return parsed?.access_token || parsed?.[0] || null;
    } catch {
      return null;
    }
  }

  const customCookie = request.cookies.get(STORAGE_KEY);
  if (customCookie) {
    try {
      const parsed = JSON.parse(customCookie.value);
      return parsed?.access_token || parsed?.[0] || null;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Verify a Supabase JWT access token by calling the Supabase REST API directly.
 * This avoids importing @supabase/supabase-js in middleware, which would
 * cause mock contamination issues in tests.
 */
export async function verifySession(accessToken: string): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return false;
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: supabaseAnonKey,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  const isProtectedRoute = matchesRoute(pathname, PROTECTED_ROUTES);
  const isAuthRoute = matchesRoute(pathname, AUTH_ROUTES);

  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  const accessToken = getAccessToken(request);
  const isAuthenticated = accessToken ? await verifySession(accessToken) : false;

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register', '/forgot-password', '/reset-password'],
};
