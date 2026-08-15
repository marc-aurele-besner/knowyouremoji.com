import type { MetadataRoute } from 'next';
import { buildSitemap } from '@/lib/sitemap-entries';

/**
 * Generate the dynamic sitemap for all indexable, public pages.
 *
 * Composition lives in `src/lib/sitemap-entries.ts` so the per-surface
 * rules (skin-tone exclusion, `thin` exclusion, trust/hub coverage,
 * priority differentiation, content-derived `lastModified`) can be unit
 * tested in isolation.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 * @see issue #355 (SEO-P1-001 sitemap / robots / thin-page alignment)
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap();
}
