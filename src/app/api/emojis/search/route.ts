import { NextRequest, NextResponse } from 'next/server';
import { getEmojiSummaries } from '@/lib/emoji-data';

// Cache headers for static emoji data
// - public: Can be cached by CDN and browser
// - max-age=3600: Cache for 1 hour
// - stale-while-revalidate=86400: Serve stale content for up to 24 hours while revalidating
const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
};

/**
 * GET /api/emojis/search
 * Returns emoji summaries for client-side search
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q')?.toLowerCase() || '';
  const limit = Math.min(parseInt(searchParams.get('limit') || '8', 10), 20);

  const emojis = getEmojiSummaries();

  if (!query) {
    return NextResponse.json({ emojis: emojis.slice(0, limit) }, { headers: CACHE_HEADERS });
  }

  const results = emojis.filter((emoji) => {
    return (
      emoji.name.toLowerCase().includes(query) ||
      emoji.character.includes(query) ||
      emoji.category.toLowerCase().includes(query) ||
      emoji.tldr.toLowerCase().includes(query) ||
      emoji.slug.toLowerCase().includes(query)
    );
  });

  return NextResponse.json({ emojis: results.slice(0, limit) }, { headers: CACHE_HEADERS });
}
