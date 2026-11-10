import { NextRequest, NextResponse } from 'next/server';
import { getEmojiSummaries } from '@/lib/emoji-data';
import type { EmojiSummary } from '@/types/emoji';

// Cache headers for static emoji data
// - public: Can be cached by CDN and browser
// - max-age=3600: Cache for 1 hour
// - stale-while-revalidate=86400: Serve stale content for up to 24 hours while revalidating
const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
};

/**
 * Relevance of an emoji for a (trimmed, lowercased) query. Lower is better.
 * Returns null when the emoji does not match at all.
 *
 * 0: exact name, slug or character ("fire" → Fire)
 * 1: name or slug starts with the query ("fire" → Fire Extinguisher)
 * 2: a word in the name starts with the query ("face" → Crying Face)
 * 3: name contains the query
 * 4: only the slug, character, category or tldr match
 */
function rankEmoji(emoji: EmojiSummary, query: string): number | null {
  const name = emoji.name.toLowerCase();
  const slug = emoji.slug.toLowerCase();

  if (name === query || slug === query || emoji.character === query) return 0;
  if (name.startsWith(query) || slug.startsWith(query)) return 1;
  if (name.split(/[\s-]+/).some((word) => word.startsWith(query))) return 2;
  if (name.includes(query)) return 3;
  if (
    slug.includes(query) ||
    emoji.character.includes(query) ||
    emoji.category.toLowerCase().includes(query) ||
    emoji.tldr.toLowerCase().includes(query)
  ) {
    return 4;
  }
  return null;
}

/**
 * GET /api/emojis/search
 * Returns emoji summaries for client-side search, best matches first
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q')?.trim().toLowerCase() || '';
  const limit = Math.min(parseInt(searchParams.get('limit') || '8', 10), 20);

  const emojis = getEmojiSummaries();

  if (!query) {
    return NextResponse.json({ emojis: emojis.slice(0, limit) }, { headers: CACHE_HEADERS });
  }

  // Array.prototype.sort is stable, so emojis with equal rank keep their data order.
  const results = emojis
    .flatMap((emoji) => {
      const rank = rankEmoji(emoji, query);
      return rank === null ? [] : [{ emoji, rank }];
    })
    .sort((a, b) => a.rank - b.rank)
    .map(({ emoji }) => emoji);

  return NextResponse.json({ emojis: results.slice(0, limit) }, { headers: CACHE_HEADERS });
}
