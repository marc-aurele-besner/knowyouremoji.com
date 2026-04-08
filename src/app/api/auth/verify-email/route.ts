import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { users, verificationTokens } from '@/lib/db/schema';
import { getEnv } from '@/lib/env';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const env = getEnv();

  if (!token || !email) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', env.appUrl));
  }

  const db = getDb();
  if (!db) {
    return NextResponse.redirect(new URL('/login?error=service_unavailable', env.appUrl));
  }

  try {
    const verificationToken = await db
      .select()
      .from(verificationTokens)
      .where(and(eq(verificationTokens.identifier, email), eq(verificationTokens.token, token)))
      .limit(1)
      .then((rows) => rows[0] ?? null);

    if (!verificationToken) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', env.appUrl));
    }

    if (verificationToken.expires < new Date()) {
      await db
        .delete(verificationTokens)
        .where(and(eq(verificationTokens.identifier, email), eq(verificationTokens.token, token)));
      return NextResponse.redirect(new URL('/login?error=token_expired', env.appUrl));
    }

    await db
      .update(users)
      .set({ emailVerified: new Date(), updatedAt: new Date() })
      .where(eq(users.email, email));

    await db
      .delete(verificationTokens)
      .where(and(eq(verificationTokens.identifier, email), eq(verificationTokens.token, token)));

    return NextResponse.redirect(new URL('/login?verified=true', env.appUrl));
  } catch {
    return NextResponse.redirect(new URL('/login?error=verification_failed', env.appUrl));
  }
}
