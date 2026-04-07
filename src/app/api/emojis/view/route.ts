import { NextRequest, NextResponse } from 'next/server';
import { getNeonSql } from '@/lib/neon';

const SLUG_PATTERN = /^[a-z0-9-]+$/;

/**
 * POST /api/emojis/view
 * Records a page view for an emoji slug in Neon.
 * Body: { "slug": "fire" }
 */
export async function POST(request: NextRequest) {
  const sql = getNeonSql();
  if (!sql) {
    return NextResponse.json({ ok: true });
  }

  let slug: string;
  try {
    const body = (await request.json()) as { slug?: string };
    slug = body.slug ?? '';
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!SLUG_PATTERN.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }

  try {
    await sql`
      INSERT INTO emoji_page_views (slug, view_count, updated_at)
      VALUES (${slug}, 1, now())
      ON CONFLICT (slug) DO UPDATE SET
        view_count = emoji_page_views.view_count + 1,
        updated_at = now()
    `;
  } catch (err) {
    console.error('[emoji-view] Failed to record page view:', err);
  }

  return NextResponse.json({ ok: true });
}
