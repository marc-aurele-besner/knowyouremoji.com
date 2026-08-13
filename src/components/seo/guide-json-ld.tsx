/**
 * JSON-LD structured data for editorial guide pages.
 *
 * Emits Schema.org Article (or BlogPosting) markup so Google can treat
 * guides as first-class editorial content. This is a key signal for
 * AdSense reviewers and for rich-result eligibility.
 *
 * Mirrors the JSON-LD pattern used by `combo-json-ld.tsx` so the
 * search-engine surface stays consistent across content types.
 */

import type { Guide } from '@/types/guide';

interface GuideJsonLdProps {
  /** The guide to render structured data for. */
  guide: Guide;
  /** Base URL of the application (e.g. https://knowyouremoji.com) */
  appUrl: string;
  /** Name of the application */
  appName: string;
}

/**
 * Build the JSON-LD payload for a guide. Exported separately so the unit
 * tests can verify the shape without spinning up a React renderer.
 */
export function buildGuideJsonLd(guide: Guide, appUrl: string, appName: string) {
  const pageUrl = `${appUrl}/guides/${guide.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    url: pageUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    author: {
      '@type': 'Organization',
      name: guide.author || appName,
      url: appUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: appName,
      url: appUrl,
    },
    keywords: guide.tags.join(', '),
    articleSection: 'Guides',
    inLanguage: 'en',
  };
}

/**
 * Renders JSON-LD structured data for a guide page.
 */
export function GuideJsonLd({ guide, appUrl, appName }: GuideJsonLdProps) {
  const jsonLd = buildGuideJsonLd(guide, appUrl, appName);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
