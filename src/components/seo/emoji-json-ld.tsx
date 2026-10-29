/**
 * JSON-LD structured data component for emoji pages
 *
 * Generates Schema.org Article markup for rich snippets in search results.
 * Uses DefinedTerm to describe the emoji entity within the article.
 * When the emoji ships FAQs (CONTENT-P1-001), an additional FAQPage entity
 * is emitted so search engines can pick up "People Also Ask" style answers.
 *
 * The Article node carries `author`, `datePublished`, `dateModified`,
 * `image`, and `inLanguage`. Google will not consider a page eligible for
 * an article rich result without the author and date fields, and the image
 * is what makes the result visual rather than a bare text link.
 */

import type { Emoji } from '@/types/emoji';
import {
  buildImageObject,
  buildIsPartOf,
  buildMainEntityOfPage,
  buildPublisher,
  resolveArticleDates,
} from '@/lib/seo-schema';
import { getCategoryDisplayName, resolveCategorySlug } from '@/lib/emoji-taxonomy';

interface EmojiJsonLdProps {
  /** The emoji data to generate structured data for */
  emoji: Emoji;
  /** Base URL of the application */
  appUrl: string;
  /** Name of the application */
  appName: string;
}

/**
 * Build an optional FAQPage entity when the emoji has FAQs to expose.
 * Returns `undefined` when there are no FAQs so the Article payload stays
 * clean for thin pages.
 */
function buildFaqEntity(emoji: Emoji) {
  const faqs = emoji.longForm?.faqs;
  if (!Array.isArray(faqs) || faqs.length === 0) return undefined;

  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate JSON-LD structured data for an emoji page
 *
 * Emits a single @graph with Article + (optional) FAQPage entries so
 * search engines can pick up both the article metadata and any
 * "People Also Ask" answers (CONTENT-P1-001).
 */
function generateEmojiJsonLd(emoji: Emoji, appUrl: string, appName: string) {
  const pageUrl = `${appUrl}/emoji/${emoji.slug}`;

  // Generate keywords array
  const keywords = [
    `${emoji.name.toLowerCase()} emoji`,
    emoji.character,
    `${emoji.character} meaning`,
    `what does ${emoji.character} mean`,
    emoji.shortName,
    emoji.category,
    'emoji meaning',
    'emoji guide',
  ];

  const headline = `${emoji.character} ${emoji.name} Emoji Meaning`;

  const article = {
    '@type': 'Article',
    headline,
    description: emoji.tldr,
    url: pageUrl,
    mainEntityOfPage: buildMainEntityOfPage(pageUrl, headline),
    author: buildPublisher(appName, appUrl),
    publisher: buildPublisher(appName, appUrl),
    image: buildImageObject(
      `${appUrl}/og/emoji/${emoji.slug}.png`,
      `${emoji.character} ${emoji.name} emoji meaning`
    ),
    ...resolveArticleDates(emoji.contentUpdatedAt),
    inLanguage: 'en',
    isPartOf: buildIsPartOf(appUrl),
    keywords: keywords.join(', '),
    articleSection: getCategoryDisplayName(resolveCategorySlug(emoji.category)),
    about: {
      '@type': 'DefinedTerm',
      name: emoji.name,
      description: emoji.baseMeaning,
      inDefinedTermSet: {
        '@type': 'DefinedTermSet',
        name: 'Unicode Emoji',
      },
    },
  };

  const faqEntity = buildFaqEntity(emoji);
  if (faqEntity) {
    return {
      '@context': 'https://schema.org',
      '@graph': [article, faqEntity],
    };
  }

  return {
    '@context': 'https://schema.org',
    ...article,
  };
}

/**
 * Renders JSON-LD structured data for an emoji page
 *
 * This component outputs a script tag with type application/ld+json
 * containing Schema.org Article markup for the emoji.
 */
export function EmojiJsonLd({ emoji, appUrl, appName }: EmojiJsonLdProps) {
  const jsonLd = generateEmojiJsonLd(emoji, appUrl, appName);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
