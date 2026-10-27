import { describe, it, expect } from 'bun:test';

describe('GET /llms.txt', () => {
  it('is prerendered and revalidated hourly', async () => {
    const route = await import('@/app/llms.txt/route');
    expect(route.dynamic).toBe('force-static');
    expect(route.revalidate).toBe(3600);
  });

  it('serves the curated index as plain text', async () => {
    const { GET } = await import('@/app/llms.txt/route');
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('Cache-Control')).toContain('s-maxage=3600');

    const body = await response.text();
    expect(body.startsWith('# KnowYourEmoji')).toBe(true);
    expect(body).toContain('## Emoji meanings');
  });
});

describe('GET /llms-full.txt', () => {
  it('is prerendered and revalidated hourly', async () => {
    const route = await import('@/app/llms-full.txt/route');
    expect(route.dynamic).toBe('force-static');
    expect(route.revalidate).toBe(3600);
  });

  it('serves the full corpus as plain text', async () => {
    const { GET } = await import('@/app/llms-full.txt/route');
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('Cache-Control')).toContain('s-maxage=3600');

    const body = await response.text();
    expect(body.startsWith('# KnowYourEmoji — Full Content')).toBe(true);
    expect(body).toContain('## Emoji meanings');
    expect(body).toContain('## Emoji combinations');
  });
});
