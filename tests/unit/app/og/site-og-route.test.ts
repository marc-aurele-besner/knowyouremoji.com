import { describe, it, expect, mock } from 'bun:test';

// Capture what the route passes to ImageResponse so the card size is checked
const calls: { width?: number; height?: number }[] = [];

mock.module('next/og', () => ({
  ImageResponse: class MockImageResponse extends Response {
    constructor(
      _element: React.ReactElement,
      options?: { width?: number; height?: number; headers?: Record<string, string> }
    ) {
      calls.push({ width: options?.width, height: options?.height });
      const headers = new Headers(options?.headers);
      headers.set('content-type', 'image/png');
      super('mock-image-data', { headers });
    }
  },
}));

const { GET } = await import('@/app/og/site/route');

describe('Site OG Image Route', () => {
  it('returns a PNG image response', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/png');
  });

  it('renders at the 1200 x 630 social card size', async () => {
    await GET();

    expect(calls.at(-1)).toEqual({ width: 1200, height: 630 });
  });

  it('sets a day-long cache-control header', async () => {
    const response = await GET();

    expect(response.headers.get('Cache-Control')).toBe('public, max-age=86400, s-maxage=86400');
  });
});
