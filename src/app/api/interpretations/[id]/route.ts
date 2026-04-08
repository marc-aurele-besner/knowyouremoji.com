import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { interpretations } from '@/lib/db/schema';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

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
      .where(and(eq(interpretations.id, id), eq(interpretations.userId, session.user.id)))
      .limit(1);

    if (results.length === 0) {
      return NextResponse.json({ error: 'Interpretation not found' }, { status: 404 });
    }

    const row = results[0];
    return NextResponse.json({
      data: {
        id: row.id,
        message: row.message,
        interpretation: row.interpretation,
        emoji_count: row.emojiCount,
        created_at: row.createdAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
