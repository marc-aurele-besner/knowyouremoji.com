import type { MetadataRoute } from 'next';
import { getAllEmojiSlugs, getAllCategories } from '@/lib/emoji-data';
import { getAllComboSlugs } from '@/lib/combo-data';
import { getSiteUrl } from '@/lib/metadata';

/**
 * Generate a dynamic sitemap for all pages
 *
 * This sitemap includes:
 * - Static pages (homepage, interpreter)
 * - Dynamic emoji pages (one per emoji)
 * - Dynamic combo pages (one per combo)
 * - Category index pages
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const lastModified = new Date();

  // Static pages with high priority
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/interpreter`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // Generate emoji pages
  const emojiSlugs = getAllEmojiSlugs();
  const emojiPages: MetadataRoute.Sitemap = emojiSlugs.map((slug) => ({
    url: `${baseUrl}/emoji/${slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Generate combo pages
  const comboSlugs = getAllComboSlugs();
  const comboPages: MetadataRoute.Sitemap = comboSlugs.map((slug) => ({
    url: `${baseUrl}/combo/${slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Generate category index pages
  const categories = getAllCategories();
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/emoji/category/${category}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticPages, ...emojiPages, ...comboPages, ...categoryPages];
}
