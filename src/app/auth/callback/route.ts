import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

/**
 * Auth callback handler for Supabase OAuth and magic link flows.
 * Exchanges the authorization code for a session and redirects to dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  if (!code) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'missing_code');
    return NextResponse.redirect(loginUrl);
  }

  try {
    const supabase = getSupabaseServerClient();

    if (!supabase) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'auth_not_configured');
      return NextResponse.redirect(loginUrl);
    }

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'auth_failed');
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.redirect(new URL(redirectTo, request.url));
  } catch {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'auth_error');
    return NextResponse.redirect(loginUrl);
  }
}
