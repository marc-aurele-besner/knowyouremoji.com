import { describe, it, expect, afterEach, mock } from 'bun:test';
import type { EmojiSummary } from '@/types/emoji';

const defaultSqlImpl = async (strings: TemplateStringsArray): Promise<unknown[] | undefined> => {
  const head = strings[0] ?? '';
  if (head.includes('SELECT slug')) {
    return [
      { slug: 'third', view_count: 10 },
      { slug: 'first', view_count: 1 },
    ];
  }
  return [];
};

const mockSql = mock(defaultSqlImpl);

mock.module('@/lib/neon', () => ({
  getNeonSql: () =>
    process.env.DATABASE_URL ? (mockSql as unknown as import('@/lib/neon').NeonSql) : null,
}));

const sampleSummaries: EmojiSummary[] = [
  { slug: 'first', character: '1️⃣', name: 'First', category: 'symbols', tldr: 'a' },
  { slug: 'skull', character: '💀', name: 'Skull', category: 'people', tldr: 'b' },
  { slug: 'third', character: '3️⃣', name: 'Third', category: 'symbols', tldr: 'c' },
  { slug: 'fire', character: '🔥', name: 'Fire', category: 'nature', tldr: 'd' },
  { slug: 'eyes', character: '👀', name: 'Eyes', category: 'people', tldr: 'e' },
];

describe('emoji-popularity', () => {
  afterEach(() => {
    Reflect.deleteProperty(process.env, 'DATABASE_URL');
    mockSql.mockClear();
    mockSql.mockImplementation(defaultSqlImpl);
  });

  it('every curated slug exists in the emoji catalog', async () => {
    const { CURATED_HOME_EMOJI_SLUGS } = await import('@/lib/emoji-popularity');
    const { getEmojiSummaries } = await import('@/lib/emoji-data');
    const slugs = new Set(getEmojiSummaries().map((s) => s.slug));
    expect(CURATED_HOME_EMOJI_SLUGS.length).toBe(12);
    for (const slug of CURATED_HOME_EMOJI_SLUGS) {
      expect(slugs.has(slug)).toBe(true);
    }
  });

  it('returns most viewed emojis in view-count order when they fill the limit', async () => {
    process.env.DATABASE_URL = 'postgresql://test';
    const { getHomeEmojiSelection } = await import('@/lib/emoji-popularity');
    const result = await getHomeEmojiSelection(2, sampleSummaries);
    expect(result.source).toBe('most-viewed');
    expect(result.emojis.map((s) => s.slug)).toEqual(['third', 'first']);
  });

  it('only counts emojis that have at least one view', async () => {
    process.env.DATABASE_URL = 'postgresql://test';
    const { getHomeEmojiSelection } = await import('@/lib/emoji-popularity');
    await getHomeEmojiSelection(2, sampleSummaries);
    const query = mockSql.mock.calls[0]?.[0] as TemplateStringsArray;
    expect(query.join('?')).toContain('WHERE view_count > 0');
  });

  it('uses the curated list instead of catalog backfill when views do not fill the limit', async () => {
    process.env.DATABASE_URL = 'postgresql://test';
    const { getHomeEmojiSelection } = await import('@/lib/emoji-popularity');
    const result = await getHomeEmojiSelection(3, sampleSummaries);
    expect(result.source).toBe('curated');
    expect(result.emojis.map((s) => s.slug)).toEqual(['skull', 'eyes', 'fire']);
  });

  it('uses the curated list when Neon errors', async () => {
    process.env.DATABASE_URL = 'postgresql://test';
    const origErr = console.error;
    console.error = () => {};
    mockSql.mockImplementation(async () => {
      throw new Error('db down');
    });
    try {
      const { getHomeEmojiSelection } = await import('@/lib/emoji-popularity');
      const result = await getHomeEmojiSelection(2, sampleSummaries);
      expect(result.source).toBe('curated');
      expect(result.emojis.map((s) => s.slug)).toEqual(['skull', 'eyes']);
    } finally {
      console.error = origErr;
    }
  });

  it('uses the curated list when DATABASE_URL is unset', async () => {
    Reflect.deleteProperty(process.env, 'DATABASE_URL');
    const { getHomeEmojiSelection } = await import('@/lib/emoji-popularity');
    const result = await getHomeEmojiSelection(12, sampleSummaries);
    expect(result.source).toBe('curated');
    expect(result.emojis.map((s) => s.slug)).toEqual(['skull', 'eyes', 'fire']);
    expect(mockSql).not.toHaveBeenCalled();
  });

  it('returns an empty list for limit <= 0', async () => {
    const { getHomeEmojiSelection } = await import('@/lib/emoji-popularity');
    const result = await getHomeEmojiSelection(0, sampleSummaries);
    expect(result).toEqual({ source: 'curated', emojis: [] });
  });

  it('skips rows with invalid or unknown slugs', async () => {
    process.env.DATABASE_URL = 'postgresql://test';
    mockSql.mockImplementation(async (strings) => {
      if (strings[0]?.includes('SELECT slug')) {
        return [
          { slug: 'bad slug!', view_count: 100 },
          { slug: 'not-in-catalog', view_count: 50 },
          { slug: 'third', view_count: 10 },
          { slug: 'first', view_count: 5 },
          { slug: 'fire', view_count: 1 },
        ];
      }
      return [];
    });
    const { getHomeEmojiSelection } = await import('@/lib/emoji-popularity');
    const result = await getHomeEmojiSelection(2, sampleSummaries);
    expect(result.source).toBe('most-viewed');
    expect(result.emojis.map((s) => s.slug)).toEqual(['third', 'first']);
  });
});
