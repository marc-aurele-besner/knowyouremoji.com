import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/metadata';

/**
 * Generate robots.txt configuration for crawler directives.
 *
 * Public marketing, editorial, and tooling surfaces remain crawlable.
 * Private / dynamic app surfaces (API endpoints, authenticated
 * dashboards and admin tooling) are disallowed. Public authentication
 * pages remain crawlable so search engines can read their noindex tags;
 * blocking them here could leave URL-only entries in search results.
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
      disallow: ['/api/', '/dashboard', '/admin'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
