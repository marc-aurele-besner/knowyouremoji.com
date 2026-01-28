/**
 * JSON-LD structured data component for combo pages
 *
 * Generates Schema.org Article markup for rich snippets in search results.
 * Uses DefinedTerm to describe the emoji combo entity within the article.
 */

import type { EmojiCombo } from '@/types/combo';

interface ComboJsonLdProps {
  /** The combo data to generate structured data for */
  combo: EmojiCombo;
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
 * Generate JSON-LD structured data for a combo page
 */
function generateComboJsonLd(combo: EmojiCombo, appUrl: string, appName: string) {
  const pageUrl = `${appUrl}/combo/${combo.slug}`;

  // Generate keywords array
  const keywords = [
    `${combo.name.toLowerCase()} combo`,
    combo.combo,
    `${combo.combo} meaning`,
    `what does ${combo.combo} mean`,
    combo.category,
    'emoji combo',
    'emoji combination',
    ...(combo.tags || []),
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${combo.combo} ${combo.name} Combo Meaning`,
    description: combo.meaning,
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
    articleSection: capitalizeFirst(combo.category),
    about: {
      '@type': 'DefinedTerm',
      name: combo.name,
      description: combo.description,
      inDefinedTermSet: {
        '@type': 'DefinedTermSet',
        name: 'Emoji Combinations',
      },
    },
  };
}

/**
 * Renders JSON-LD structured data for a combo page
 *
 * This component outputs a script tag with type application/ld+json
 * containing Schema.org Article markup for the combo.
 */
export function ComboJsonLd({ combo, appUrl, appName }: ComboJsonLdProps) {
  const jsonLd = generateComboJsonLd(combo, appUrl, appName);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
