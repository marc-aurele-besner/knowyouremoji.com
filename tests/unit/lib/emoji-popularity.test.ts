import { describe, it, expect, afterEach, mock } from 'bun:test';
import type { EmojiSummary } from '@/types/emoji';

const defaultSqlImpl = async (strings: TemplateStringsArray): Promise<unknown[] | undefined> => {
  const head = strings[0] ?? '';
  if (head.includes('SELECT slug')) {
    return [
      { slug: 'second', view_count: 10 },
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
  { slug: 'second', character: '2️⃣', name: 'Second', category: 'symbols', tldr: 'b' },
  { slug: 'third', character: '3️⃣', name: 'Third', category: 'symbols', tldr: 'c' },
];

describe('emoji-popularity', () => {
  afterEach(() => {
    Reflect.deleteProperty(process.env, 'DATABASE_URL');
    mockSql.mockClear();
    mockSql.mockImplementation(defaultSqlImpl);
  });

  it('getPopularEmojiSummariesForHome uses Neon order then fills from catalog', async () => {
    process.env.DATABASE_URL = 'postgresql://test';
    const { getPopularEmojiSummariesForHome } = await import('@/lib/emoji-popularity');
    const result = await getPopularEmojiSummariesForHome(3, sampleSummaries);
    expect(result.map((s) => s.slug)).toEqual(['second', 'first', 'third']);
  });

  it('getPopularEmojiSummariesForHome falls back to catalog order when Neon errors', async () => {
    process.env.DATABASE_URL = 'postgresql://test';
    const origErr = console.error;
    console.error = () => {};
    mockSql.mockImplementation(async () => {
      throw new Error('db down');
    });
    try {
      const { getPopularEmojiSummariesForHome } = await import('@/lib/emoji-popularity');
      const result = await getPopularEmojiSummariesForHome(2, sampleSummaries);
      expect(result).toEqual(sampleSummaries.slice(0, 2));
    } finally {
      console.error = origErr;
    }
  });

  it('getPopularEmojiSummariesForHome returns catalog slice when DATABASE_URL is unset', async () => {
    Reflect.deleteProperty(process.env, 'DATABASE_URL');
    const { getPopularEmojiSummariesForHome } = await import('@/lib/emoji-popularity');
    const result = await getPopularEmojiSummariesForHome(2, sampleSummaries);
    expect(result).toEqual(sampleSummaries.slice(0, 2));
  });

  it('getPopularEmojiSummariesForHome returns empty array for limit <= 0', async () => {
    const { getPopularEmojiSummariesForHome } = await import('@/lib/emoji-popularity');
    const result = await getPopularEmojiSummariesForHome(0, sampleSummaries);
    expect(result).toEqual([]);
  });

  it('getPopularEmojiSummariesForHome skips rows with invalid slugs', async () => {
    process.env.DATABASE_URL = 'postgresql://test';
    mockSql.mockImplementation(async (strings) => {
      if (strings[0]?.includes('SELECT slug')) {
        return [
          { slug: 'bad slug!', view_count: 100 },
          { slug: 'second', view_count: 10 },
        ];
      }
      return [];
    });
    const { getPopularEmojiSummariesForHome } = await import('@/lib/emoji-popularity');
    const result = await getPopularEmojiSummariesForHome(2, sampleSummaries);
    expect(result.map((s) => s.slug)).toEqual(['second', 'first']);
  });
});
