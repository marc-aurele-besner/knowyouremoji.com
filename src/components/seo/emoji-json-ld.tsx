/**
 * JSON-LD structured data component for emoji pages
 *
 * Generates Schema.org Article markup for rich snippets in search results.
 * Uses DefinedTerm to describe the emoji entity within the article.
 */

import type { Emoji } from '@/types/emoji';

interface EmojiJsonLdProps {
  /** The emoji data to generate structured data for */
  emoji: Emoji;
  /** Base URL of the application */
  appUrl: string;
  /** Name of the application */
  appName: string;
}

/**
 * Capitalize the first letter of a string
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate JSON-LD structured data for an emoji page
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

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${emoji.character} ${emoji.name} Emoji Meaning`,
    description: emoji.tldr,
    url: pageUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: appName,
      url: appUrl,
    },
    keywords: keywords.join(', '),
    articleSection: capitalizeFirst(emoji.category),
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
