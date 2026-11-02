import { describe, it, expect } from 'bun:test';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/geo/route';

function request(country?: string) {
  return new NextRequest('http://localhost/api/geo', {
    headers: country === undefined ? {} : { 'x-vercel-ip-country': country },
  });
}

describe('GET /api/geo', () => {
  it('returns the country from the Vercel geolocation header', async () => {
    const response = GET(request('DE'));
    expect(await response.json()).toEqual({ country: 'DE' });
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  });

  it('normalizes the case', async () => {
    expect(await GET(request('gb')).json()).toEqual({ country: 'GB' });
  });

  it('returns null when the header is missing or malformed', async () => {
    expect(await GET(request()).json()).toEqual({ country: null });
    expect(await GET(request('XXX')).json()).toEqual({ country: null });
    expect(await GET(request('1A')).json()).toEqual({ country: null });
  });
});
