import { describe, expect, test } from 'bun:test';
import nextConfig from '../../next.config';
import { EMOJI_ALIASES } from '../../src/lib/emoji-aliases';

describe('next.config redirects', () => {
  test('redirects every alias slug to the page that owns the emoji (issue #482)', async () => {
    const redirects = (await nextConfig.redirects?.()) ?? [];
    const bySource = new Map(redirects.map((redirect) => [redirect.source, redirect]));

    expect(bySource.get('/emoji/100')).toMatchObject({
      destination: '/emoji/hundred-points',
      permanent: true,
    });
    for (const [alias, owner] of Object.entries(EMOJI_ALIASES)) {
      expect(bySource.get(`/emoji/${alias}`)?.destination).toBe(`/emoji/${owner}`);
    }
  });

  test('never redirects to a page that is itself redirected', async () => {
    const redirects = (await nextConfig.redirects?.()) ?? [];
    const sources = new Set(redirects.map((redirect) => redirect.source));

    expect(sources.size).toBe(redirects.length);
    expect(redirects.filter((redirect) => sources.has(redirect.destination))).toEqual([]);
  });
});
