import { describe, it, expect, mock } from 'bun:test';

// Mock next/og ImageResponse — does NOT mock emoji-data to avoid contaminating other tests
mock.module('next/og', () => ({
  ImageResponse: class MockImageResponse extends Response {
    constructor(
      _element: React.ReactElement,
      options?: { width?: number; height?: number; headers?: Record<string, string> }
    ) {
      const headers = new Headers(options?.headers);
      headers.set('content-type', 'image/png');
      super('mock-image-data', { headers });
    }
  },
}));

// Import after mocks — uses real emoji-data (JSON files)
const { GET } = await import('@/app/og/emoji/[slug]/route');
const { getEmojiBySlug, getAllEmojiSlugs } = await import('@/lib/emoji-data');

// Find a real emoji slug to test with
const allSlugs = getAllEmojiSlugs();
const validSlug = allSlugs[0] ?? 'skull';
const validEmoji = getEmojiBySlug(validSlug);

describe('Emoji OG Image Route', () => {
  it('returns 404 for unknown emoji slug', async () => {
    const request = new Request('http://localhost/og/emoji/unknown-nonexistent-slug');
    const response = await GET(request, {
      params: Promise.resolve({ slug: 'unknown-nonexistent-slug' }),
    });

    expect(response.status).toBe(404);
  });

  it('returns image response for valid emoji', async () => {
    const request = new Request(`http://localhost/og/emoji/${validSlug}`);
    const response = await GET(request, { params: Promise.resolve({ slug: validSlug }) });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/png');
  });

  it('strips .png extension from slug', async () => {
    const request = new Request(`http://localhost/og/emoji/${validSlug}.png`);
    const response = await GET(request, {
      params: Promise.resolve({ slug: `${validSlug}.png` }),
    });

    expect(response.status).toBe(200);
  });

  it('sets cache-control header', async () => {
    const request = new Request(`http://localhost/og/emoji/${validSlug}`);
    const response = await GET(request, { params: Promise.resolve({ slug: validSlug }) });

    expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600, s-maxage=3600');
  });

  it('uses real emoji data', () => {
    // Verify that the test data is real
    expect(validEmoji).not.toBeUndefined();
    expect(validEmoji?.character).toBeTruthy();
    expect(validEmoji?.name).toBeTruthy();
    expect(validEmoji?.tldr).toBeTruthy();
  });
});
