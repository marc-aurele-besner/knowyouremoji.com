import { describe, expect, test, mock, afterEach } from 'bun:test';
import { render, screen, cleanup, within } from '@testing-library/react';
import type { Emoji } from '@/types/emoji';
import type { EmojiComparison } from '@/types/comparison';

// Module mocks leak across test files in bun, so the mocks below only *add*
// fixture entries (with test-only slugs) and delegate everything else to the
// real loaders captured here.
const realComparisonData = await import('@/lib/comparison-data');
const realGetAllComparisons = realComparisonData.getAllComparisons;
const realGetComparisonBySlug = realComparisonData.getComparisonBySlug;
const realGetAllComparisonSlugs = realComparisonData.getAllComparisonSlugs;
const realEmojiData = await import('@/lib/emoji-data');
const realGetEmojiBySlug = realEmojiData.getEmojiBySlug;

const comparisons: EmojiComparison[] = [
  {
    slug: 'test-skull-laughing',
    emoji1Slug: 'test-skull',
    emoji2Slug: 'test-joy',
    seoTitle: 'Skull vs Joy',
    seoDescription: 'What is the difference between skull and joy?',
    comparisonPoints: [{ aspect: 'Intensity', emoji1Note: 'Skull note', emoji2Note: 'Joy note' }],
  },
  {
    slug: 'test-fire-sparkles',
    emoji1Slug: 'test-fire',
    emoji2Slug: 'test-sparkles',
    seoTitle: 'Fire vs Sparkles',
    seoDescription: 'Fire or sparkles?',
    comparisonPoints: [{ aspect: 'Vibe', emoji1Note: 'Hot', emoji2Note: 'Magic' }],
  },
  {
    slug: 'test-heart-white',
    emoji1Slug: 'test-heart',
    emoji2Slug: 'test-white-heart',
    seoTitle: 'Heart vs White Heart',
    seoDescription: 'Hearts.',
    comparisonPoints: [],
  },
];

mock.module('@/lib/comparison-data', () => ({
  getAllComparisons: () => [...comparisons, ...realGetAllComparisons()],
  getAllComparisonSlugs: () => [
    ...comparisons.map((c) => c.slug),
    'test-missing-slug',
    ...realGetAllComparisonSlugs(),
  ],
  getComparisonBySlug: (slug: string) =>
    comparisons.find((c) => c.slug === slug) ?? realGetComparisonBySlug(slug),
}));

function makeEmoji(slug: string, character: string, name: string, rich: boolean): Emoji {
  return {
    unicode: '1F480',
    slug,
    character,
    name,
    shortName: slug,
    category: 'faces',
    unicodeVersion: '6.0',
    baseMeaning: name,
    tldr: `${name} tldr`,
    contextMeanings: rich
      ? [{ context: 'SLANG', meaning: `${name} slang`, example: 'ex', riskLevel: 'LOW' }]
      : [],
    platformNotes: [],
    generationalNotes: rich ? [{ generation: 'GEN_Z', note: `${name} gen z note` }] : [],
    warnings: [],
    relatedCombos: [],
    seoTitle: name,
    seoDescription: name,
  };
}

const emojiFixtures: Record<string, Emoji> = {
  'test-skull': makeEmoji('test-skull', '💀', 'Skull', true),
  'test-joy': makeEmoji('test-joy', '😂', 'Face with Tears of Joy', false),
  'test-fire': makeEmoji('test-fire', '🔥', 'Fire', false),
  'test-sparkles': makeEmoji('test-sparkles', '✨', 'Sparkles', false),
  'test-heart': makeEmoji('test-heart', '❤️', 'Red Heart', false),
};

mock.module('@/lib/emoji-data', () => ({
  getEmojiBySlug: (slug: string) => emojiFixtures[slug] ?? realGetEmojiBySlug(slug),
}));

const pageModule = await import('@/app/compare/[emoji1]/[emoji2]/page');
const ComparePage = pageModule.default;
const { generateMetadata, generateStaticParams, revalidate } = pageModule;

const params = (emoji1: string, emoji2: string) => ({
  params: Promise.resolve({ emoji1, emoji2 }),
});

afterEach(() => {
  cleanup();
});

describe('Compare page configuration', () => {
  test('uses hourly ISR', () => {
    expect(revalidate).toBe(3600);
  });

  test('generates params for every known comparison', async () => {
    const result = await generateStaticParams();
    expect(result).toEqual(
      expect.arrayContaining([
        { emoji1: 'test-skull', emoji2: 'test-joy' },
        { emoji1: 'test-fire', emoji2: 'test-sparkles' },
        { emoji1: 'test-heart', emoji2: 'test-white-heart' },
      ])
    );
    // Unknown slugs are filtered out
    expect(result).not.toContain(null);
  });
});

describe('Compare page metadata', () => {
  test('resolves a comparison by slug', async () => {
    const metadata = await generateMetadata(params('test-fire', 'test-sparkles'));
    expect(metadata.title).toBe('Fire vs Sparkles');
    expect(metadata.alternates?.canonical).toEqual(
      expect.stringMatching(/\/compare\/test-fire\/test-sparkles$/)
    );
  });

  test('resolves a comparison by its emoji pair when the slug differs', async () => {
    const metadata = await generateMetadata(params('test-skull', 'test-joy'));
    expect(metadata.title).toBe('Skull vs Joy');
  });

  test('canonicalises the reversed order', async () => {
    const metadata = await generateMetadata(params('test-joy', 'test-skull'));
    expect(metadata.title).toBe('Skull vs Joy');
    expect(metadata.alternates?.canonical).toEqual(
      expect.stringMatching(/\/compare\/test-skull\/test-joy$/)
    );
  });

  test('also resolves reversed slugs', async () => {
    const metadata = await generateMetadata(params('test-sparkles', 'test-fire'));
    expect(metadata.alternates?.canonical).toEqual(
      expect.stringMatching(/\/compare\/test-fire\/test-sparkles$/)
    );
  });

  test('returns empty metadata for unknown pairs', async () => {
    expect(await generateMetadata(params('nope', 'nada'))).toEqual({});
  });
});

describe('Compare page', () => {
  test('renders the head, swap link, key differences and both columns', async () => {
    render(await ComparePage(params('test-skull', 'test-joy')));

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('💀 vs 😂');
    expect(screen.getByText('What is the difference between skull and joy?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /swap/i })).toHaveAttribute(
      'href',
      '/compare/test-joy/test-skull'
    );

    const differences = screen.getByRole('region', { name: 'Key Differences' });
    expect(within(differences).getByRole('heading', { name: 'Intensity' })).toBeInTheDocument();
    expect(within(differences).getByText('Skull note')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Learn more about Skull' })).toHaveAttribute(
      'href',
      '/emoji/test-skull'
    );
    expect(screen.getByText('Skull slang')).toBeInTheDocument();
    expect(screen.getByText('Skull gen z note')).toBeInTheDocument();
    expect(screen.getByText('Face with Tears of Joy tldr')).toBeInTheDocument();
  });

  test('lists other comparisons whose emojis exist', async () => {
    render(await ComparePage(params('test-skull', 'test-joy')));
    const popular = screen.getByRole('region', { name: 'Popular comparisons' });
    expect(within(popular).getByRole('link', { name: 'Fire vs Sparkles' })).toHaveAttribute(
      'href',
      '/compare/test-fire/test-sparkles'
    );
    // heart vs white-heart is skipped because white-heart has no emoji page
    expect(
      within(popular)
        .queryAllByRole('link')
        .some((link) => link.getAttribute('href') === '/compare/test-heart/test-white-heart')
    ).toBe(false);
  });

  test('follows the URL order when reversed', async () => {
    render(await ComparePage(params('test-joy', 'test-skull')));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('😂 vs 💀');
    const differences = screen.getByRole('region', { name: 'Key Differences' });
    const notes = within(differences)
      .getAllByText(/note$/)
      .map((el) => el.textContent);
    expect(notes[0]).toContain('Joy note');
  });

  test('calls notFound for unknown comparisons', async () => {
    await expect(ComparePage(params('nope', 'nada'))).rejects.toThrow();
  });

  test('calls notFound when an emoji is missing', async () => {
    await expect(ComparePage(params('test-heart', 'test-white-heart'))).rejects.toThrow();
  });
});
