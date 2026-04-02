import { describe, it, expect, afterEach, mock } from 'bun:test';
import type { EmojiSummary } from '@/types/emoji';

const mockAfter = mock((fn: () => void | Promise<void>) => {
  void fn();
});

mock.module('next/server', () => ({
  after: mockAfter,
}));

const defaultSqlImpl = async (
  strings: TemplateStringsArray,
  ..._values: unknown[]
): Promise<unknown[] | undefined> => {
  const head = strings[0] ?? '';
  if (head.includes('CREATE TABLE')) {
    return undefined;
  }
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
    mockAfter.mockClear();
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

  it('recordEmojiPageView schedules work after response', async () => {
    process.env.DATABASE_URL = 'postgresql://test';
    mockSql.mockImplementation(async (strings) => {
      if (strings[0]?.includes('CREATE TABLE')) return undefined;
      if (strings[0]?.includes('INSERT INTO')) return undefined;
      return [];
    });
    const { recordEmojiPageView } = await import('@/lib/emoji-popularity');
    await recordEmojiPageView('valid-slug');
    expect(mockAfter).toHaveBeenCalled();
  });

  it('recordEmojiPageView ignores invalid slugs', async () => {
    process.env.DATABASE_URL = 'postgresql://test';
    const { recordEmojiPageView } = await import('@/lib/emoji-popularity');
    await recordEmojiPageView('bad slug!');
    expect(mockAfter).not.toHaveBeenCalled();
  });

  it('recordEmojiPageView no-ops when DATABASE_URL is unset', async () => {
    Reflect.deleteProperty(process.env, 'DATABASE_URL');
    const { recordEmojiPageView } = await import('@/lib/emoji-popularity');
    await recordEmojiPageView('ok-slug');
    expect(mockAfter).not.toHaveBeenCalled();
  });

  it('recordEmojiPageView logs when the insert fails', async () => {
    process.env.DATABASE_URL = 'postgresql://test';
    const errSpy = mock(() => {});
    const origErr = console.error;
    console.error = errSpy as typeof console.error;

    let call = 0;
    mockSql.mockImplementation(async (strings) => {
      const head = strings[0] ?? '';
      if (head.includes('CREATE TABLE')) {
        return undefined;
      }
      call += 1;
      if (head.includes('INSERT INTO')) {
        throw new Error('insert failed');
      }
      return [];
    });

    try {
      const { recordEmojiPageView } = await import('@/lib/emoji-popularity');
      await recordEmojiPageView('valid-slug');
      expect(mockAfter).toHaveBeenCalled();
      await mockAfter.mock.calls[0][0]();
      expect(errSpy).toHaveBeenCalled();
    } finally {
      console.error = origErr;
      mockSql.mockImplementation(defaultSqlImpl);
    }
  });
});
