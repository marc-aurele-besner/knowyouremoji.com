import { describe, it, expect, mock } from 'bun:test';

// Mock next/og ImageResponse — does NOT mock combo-data to avoid contaminating other tests
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

// Import after mocks — uses real combo-data (JSON files)
const { GET } = await import('@/app/og/combo/[slug]/route');
const { getComboBySlug, getAllComboSlugs } = await import('@/lib/combo-data');

// Find a real combo slug to test with
const allSlugs = getAllComboSlugs();
const validSlug = allSlugs[0] ?? 'skull-laughing';
const validCombo = getComboBySlug(validSlug);

describe('Combo OG Image Route', () => {
  it('returns 404 for unknown combo slug', async () => {
    const request = new Request('http://localhost/og/combo/unknown-nonexistent-slug');
    const response = await GET(request, {
      params: Promise.resolve({ slug: 'unknown-nonexistent-slug' }),
    });

    expect(response.status).toBe(404);
  });

  it('returns image response for valid combo', async () => {
    const request = new Request(`http://localhost/og/combo/${validSlug}`);
    const response = await GET(request, { params: Promise.resolve({ slug: validSlug }) });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/png');
  });

  it('strips .png extension from slug', async () => {
    const request = new Request(`http://localhost/og/combo/${validSlug}.png`);
    const response = await GET(request, {
      params: Promise.resolve({ slug: `${validSlug}.png` }),
    });

    expect(response.status).toBe(200);
  });

  it('sets cache-control header', async () => {
    const request = new Request(`http://localhost/og/combo/${validSlug}`);
    const response = await GET(request, { params: Promise.resolve({ slug: validSlug }) });

    expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600, s-maxage=3600');
  });

  it('uses real combo data', () => {
    // Verify that the test data is real
    expect(validCombo).not.toBeUndefined();
    expect(validCombo?.combo).toBeTruthy();
    expect(validCombo?.name).toBeTruthy();
    expect(validCombo?.meaning).toBeTruthy();
  });
});
