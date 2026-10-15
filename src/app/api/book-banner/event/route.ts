import { NextRequest, NextResponse } from 'next/server';
import { getNeonSql } from '@/lib/neon';
import { BOOK_BANNER_IDS } from '@/lib/book-banners';

const EVENT_TYPES = ['view', 'click'] as const;
const MAX_PATH_LENGTH = 512;

type BookBannerEventType = (typeof EVENT_TYPES)[number];

interface BookBannerEventBody {
  type?: unknown;
  banner?: unknown;
  path?: unknown;
}

function isEventType(value: unknown): value is BookBannerEventType {
  return typeof value === 'string' && (EVENT_TYPES as readonly string[]).includes(value);
}

function isBannerId(value: unknown): value is string {
  return typeof value === 'string' && BOOK_BANNER_IDS.includes(value);
}

function isPagePath(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('/') && value.length <= MAX_PATH_LENGTH;
}

/**
 * POST /api/book-banner/event
 * Records a single book banner view or click in Neon.
 * Body: { "type": "view" | "click", "banner": "book-cover-01", "path": "/emoji/fire" }
 */
export async function POST(request: NextRequest) {
  const sql = getNeonSql();
  if (!sql) {
    return NextResponse.json({ ok: true });
  }

  let body: BookBannerEventBody;
  try {
    body = ((await request.json()) as BookBannerEventBody | null) ?? {};
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { type, banner, path } = body;
  if (!isEventType(type) || !isBannerId(banner) || !isPagePath(path)) {
    return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
  }

  try {
    await sql`
      INSERT INTO book_banner_events (event_type, banner, page_path)
      VALUES (${type}, ${banner}, ${path})
    `;
  } catch (err) {
    console.error('[book-banner] Failed to record event:', err);
  }

  return NextResponse.json({ ok: true });
}
