import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/metadata';

/**
 * Generate robots.txt configuration for crawler directives
 *
 * This configuration:
 * - Allows crawling of all public pages
 * - Disallows crawling of API routes (server-only endpoints)
 * - Links to the sitemap for crawler discovery
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
