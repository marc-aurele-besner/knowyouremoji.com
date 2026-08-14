import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/metadata';

/**
 * Generate robots.txt configuration for crawler directives.
 *
 * Public marketing, editorial, and tooling surfaces remain crawlable.
 * Private / dynamic app surfaces (API endpoints, authenticated
 * dashboards, admin tooling, future auth routes) are explicitly
 * disallowed as a belt-and-suspenders complement to the per-page
 * `robots: { index: false }` metadata those routes already set.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 * @see issue #355 (SEO-P1-001 sitemap / robots / thin-page alignment)
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard',
        '/admin',
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
