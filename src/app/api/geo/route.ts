import { NextRequest, NextResponse } from 'next/server';

const COUNTRY_PATTERN = /^[A-Z]{2}$/;

/**
 * GET /api/geo
 * Returns the visitor's country from Vercel's IP geolocation header, so
 * statically rendered pages can link to the nearest Amazon storefront.
 * Response: { "country": "DE" } or { "country": null } when unknown.
 * Nothing about the request is stored.
 */
export function GET(request: NextRequest) {
  const header = request.headers.get('x-vercel-ip-country')?.toUpperCase() ?? '';
  const country = COUNTRY_PATTERN.test(header) ? header : null;
  return NextResponse.json({ country }, { headers: { 'Cache-Control': 'private, no-store' } });
}
