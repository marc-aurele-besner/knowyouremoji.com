import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { interpretations } from '@/lib/db/schema';

const PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(0, parseInt(searchParams.get('page') || '0', 10));

    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
    }

    const results = await db
      .select({
        id: interpretations.id,
        message: interpretations.message,
        interpretation: interpretations.interpretation,
        emojiCount: interpretations.emojiCount,
        createdAt: interpretations.createdAt,
      })
      .from(interpretations)
      .where(eq(interpretations.userId, session.user.id))
      .orderBy(desc(interpretations.createdAt))
      .limit(PAGE_SIZE + 1)
      .offset(page * PAGE_SIZE);

    const hasMore = results.length > PAGE_SIZE;
    const data = results.slice(0, PAGE_SIZE).map((row) => ({
      id: row.id,
      message: row.message,
      interpretation: row.interpretation,
      emoji_count: row.emojiCount,
      created_at: row.createdAt.toISOString(),
    }));

    return NextResponse.json({ data, hasMore });
  } catch {
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
