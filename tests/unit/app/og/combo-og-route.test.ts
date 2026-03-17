import { describe, it, expect, mock, beforeEach } from 'bun:test';
import type { EmojiCombo } from '@/types/combo';

const mockCombo: EmojiCombo = {
  slug: 'skull-laughing',
  combo: '💀😂',
  emojis: ['skull', 'face-with-tears-of-joy'],
  name: 'Dead Laughing',
  description: 'When something is so funny you die',
  meaning: 'Something is extremely hilarious',
  examples: ['That joke had me 💀😂'],
  category: 'humor',
  seoTitle: '💀😂 Dead Laughing Combo Meaning',
  seoDescription: 'Learn what 💀😂 means',
  relatedCombos: [],
  tags: ['humor', 'laughing'],
  popularity: 90,
};

const mockGetComboBySlug = mock<(slug: string) => EmojiCombo | undefined>(() => undefined);

mock.module('@/lib/combo-data', () => ({
  getComboBySlug: mockGetComboBySlug,
  getAllComboSlugs: mock(() => []),
  getAllCombos: mock(() => []),
  getCombosByCategory: mock(() => []),
  searchCombos: mock(() => []),
  getComboSummaries: mock(() => []),
  getRelatedCombos: mock(() => []),
  getCombosByEmoji: mock(() => []),
  getComboSummariesByEmoji: mock(() => []),
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

const { GET } = await import('@/app/og/combo/[slug]/route');

describe('Combo OG Image Route', () => {
  beforeEach(() => {
    mockGetComboBySlug.mockReset();
  });

  it('returns 404 for unknown combo slug', async () => {
    mockGetComboBySlug.mockImplementation(() => undefined);

    const request = new Request('http://localhost/og/combo/unknown');
    const response = await GET(request, { params: Promise.resolve({ slug: 'unknown' }) });

    expect(response.status).toBe(404);
  });

  it('returns image response for valid combo', async () => {
    mockGetComboBySlug.mockImplementation(() => mockCombo);

    const request = new Request('http://localhost/og/combo/skull-laughing');
    const response = await GET(request, { params: Promise.resolve({ slug: 'skull-laughing' }) });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/png');
  });

  it('strips .png extension from slug', async () => {
    mockGetComboBySlug.mockImplementation((slug: string) => {
      if (slug === 'skull-laughing') return mockCombo;
      return undefined;
    });

    const request = new Request('http://localhost/og/combo/skull-laughing.png');
    const response = await GET(request, {
      params: Promise.resolve({ slug: 'skull-laughing.png' }),
    });

    expect(response.status).toBe(200);
  });

  it('sets cache-control header', async () => {
    mockGetComboBySlug.mockImplementation(() => mockCombo);

    const request = new Request('http://localhost/og/combo/skull-laughing');
    const response = await GET(request, { params: Promise.resolve({ slug: 'skull-laughing' }) });

    expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600, s-maxage=3600');
  });

  it('truncates long meaning text', async () => {
    const longMeaningCombo = { ...mockCombo, meaning: 'A'.repeat(200) };
    mockGetComboBySlug.mockImplementation(() => longMeaningCombo);

    const request = new Request('http://localhost/og/combo/skull-laughing');
    const response = await GET(request, { params: Promise.resolve({ slug: 'skull-laughing' }) });

    expect(response.status).toBe(200);
  });
});
