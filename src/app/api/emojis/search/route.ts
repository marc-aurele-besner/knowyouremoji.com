import { NextRequest, NextResponse } from 'next/server';
import { getEmojiSummaries } from '@/lib/emoji-data';

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
    return NextResponse.json({ emojis: emojis.slice(0, limit) });
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

  return NextResponse.json({ emojis: results.slice(0, limit) });
}
