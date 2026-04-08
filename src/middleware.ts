import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_STORAGE_KEY } from '@/lib/supabase';

/**
 * Routes that require authentication
 */
const PROTECTED_ROUTES = ['/dashboard'];

/**
 * Routes that should redirect to dashboard if already authenticated
 */
const AUTH_ROUTES = ['/login', '/register'];

/**
 * Check if a pathname matches any of the given route prefixes
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/**
 * Extract the access token from the request cookies
 */
function getAccessToken(request: NextRequest): string | null {
  // Supabase stores auth in a cookie matching the storage key
  const authCookie = request.cookies.get(`sb-${getSupabaseProjectRef()}-auth-token`);
  if (authCookie) {
    try {
      const parsed = JSON.parse(authCookie.value);
      return parsed?.access_token || parsed?.[0] || null;
    } catch {
      return null;
    }
  }

  // Also check the custom storage key cookie
  const customCookie = request.cookies.get(SUPABASE_STORAGE_KEY);
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
 * Extract the Supabase project ref from the URL
 */
function getSupabaseProjectRef(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  // Extract project ref from URL like https://abc123.supabase.co
  const match = url.match(/https:\/\/([^.]+)\./);
  return match?.[1] || '';
}

/**
 * Verify a Supabase JWT access token by calling getUser
 */
async function verifySession(accessToken: string): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return false;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error } = await supabase.auth.getUser(accessToken);
    return !error && !!data.user;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware if Supabase is not configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  const isProtectedRoute = matchesRoute(pathname, PROTECTED_ROUTES);
  const isAuthRoute = matchesRoute(pathname, AUTH_ROUTES);

  // Only process protected or auth routes
  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  const accessToken = getAccessToken(request);
  const isAuthenticated = accessToken ? await verifySession(accessToken) : false;

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
