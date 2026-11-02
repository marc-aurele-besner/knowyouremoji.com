import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Routes that require authentication
 */
const PROTECTED_ROUTES = ['/dashboard'];

/**
 * Routes that should redirect to dashboard if already authenticated
 */
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

/**
 * Check if a pathname matches any of the given route prefixes
 */
export function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/**
 * Whether the request carries Auth.js's secure (`__Secure-` prefixed) session cookie.
 *
 * Auth.js sets `__Secure-authjs.session-token` when serving over HTTPS, but `getToken`
 * defaults to looking up the non-secure `authjs.session-token` name. Without telling it
 * which one to read, every production (HTTPS) request looks unauthenticated and the
 * dashboard redirects back to /login. Session tokens may be chunked (`.0`, `.1`, ...),
 * hence the prefix match.
 */
export function hasSecureSessionCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith('__Secure-authjs.session-token'));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = matchesRoute(pathname, PROTECTED_ROUTES);
  const isAuthRoute = matchesRoute(pathname, AUTH_ROUTES);

  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: hasSecureSessionCookie(request),
  });
  const isAuthenticated = !!token;

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
