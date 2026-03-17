import { describe, it, expect, mock, beforeEach } from 'bun:test';
import type { Emoji } from '@/types/emoji';

const mockEmoji: Emoji = {
  unicode: '1F525',
  slug: 'fire',
  character: '🔥',
  name: 'Fire',
  shortName: 'fire',
  category: 'travel',
  subcategory: 'sky-weather',
  unicodeVersion: '6.0',
  baseMeaning: 'Fire or flames',
  tldr: 'Used to say something is amazing, attractive, or excellent',
  contextMeanings: [],
  platformNotes: [],
  generationalNotes: [],
  warnings: [],
  relatedCombos: [],
  seoTitle: '🔥 Fire Emoji Meaning',
  seoDescription: 'Learn what the fire emoji means',
};

const mockGetEmojiBySlug = mock<(slug: string) => Emoji | undefined>(() => undefined);
const mockGetCategoryDisplayName = mock<(category: string) => string>(() => 'Travel & Places');

mock.module('@/lib/emoji-data', () => ({
  getEmojiBySlug: mockGetEmojiBySlug,
  getCategoryDisplayName: mockGetCategoryDisplayName,
  getAllEmojiSlugs: mock(() => []),
  getAllEmojis: mock(() => []),
  getEmojisByCategory: mock(() => []),
  searchEmojis: mock(() => []),
  getEmojiCount: mock(() => 0),
  getEmojiSummaries: mock(() => []),
  getRelatedEmojis: mock(() => []),
  isValidCategory: mock(() => false),
  getCategoryDescription: mock(() => ''),
  getCategoryInfo: mock(() => null),
  getAllCategoryInfo: mock(() => []),
  getEmojiSummariesByCategory: mock(() => []),
}));

// Mock next/og ImageResponse
mock.module('next/og', () => ({
  ImageResponse: class MockImageResponse extends Response {
    constructor(
      element: React.ReactElement,
      options?: { width?: number; height?: number; headers?: Record<string, string> }
    ) {
      const headers = new Headers(options?.headers);
      headers.set('content-type', 'image/png');
      super('mock-image-data', { headers });
    }
  },
}));

// Import after mocks
const { GET } = await import('@/app/og/emoji/[slug]/route');

describe('Emoji OG Image Route', () => {
  beforeEach(() => {
    mockGetEmojiBySlug.mockReset();
    mockGetCategoryDisplayName.mockReset();
    mockGetCategoryDisplayName.mockImplementation(() => 'Travel & Places');
  });

  it('returns 404 for unknown emoji slug', async () => {
    mockGetEmojiBySlug.mockImplementation(() => undefined);

    const request = new Request('http://localhost/og/emoji/unknown');
    const response = await GET(request, { params: Promise.resolve({ slug: 'unknown' }) });

    expect(response.status).toBe(404);
  });

  it('returns image response for valid emoji', async () => {
    mockGetEmojiBySlug.mockImplementation(() => mockEmoji);

    const request = new Request('http://localhost/og/emoji/fire');
    const response = await GET(request, { params: Promise.resolve({ slug: 'fire' }) });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/png');
  });

  it('strips .png extension from slug', async () => {
    mockGetEmojiBySlug.mockImplementation((slug: string) => {
      if (slug === 'fire') return mockEmoji;
      return undefined;
    });

    const request = new Request('http://localhost/og/emoji/fire.png');
    const response = await GET(request, { params: Promise.resolve({ slug: 'fire.png' }) });

    expect(response.status).toBe(200);
  });

  it('sets cache-control header', async () => {
    mockGetEmojiBySlug.mockImplementation(() => mockEmoji);

    const request = new Request('http://localhost/og/emoji/fire');
    const response = await GET(request, { params: Promise.resolve({ slug: 'fire' }) });

    expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600, s-maxage=3600');
  });

  it('truncates long tldr text', async () => {
    const longTldrEmoji = { ...mockEmoji, tldr: 'A'.repeat(200) };
    mockGetEmojiBySlug.mockImplementation(() => longTldrEmoji);

    const request = new Request('http://localhost/og/emoji/fire');
    const response = await GET(request, { params: Promise.resolve({ slug: 'fire' }) });

    expect(response.status).toBe(200);
  });

  it('calls getCategoryDisplayName with emoji category', async () => {
    mockGetEmojiBySlug.mockImplementation(() => mockEmoji);

    const request = new Request('http://localhost/og/emoji/fire');
    await GET(request, { params: Promise.resolve({ slug: 'fire' }) });

    expect(mockGetCategoryDisplayName).toHaveBeenCalledWith('travel');
  });
});
