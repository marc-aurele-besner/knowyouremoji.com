/**
 * JSON-LD structured data component for combo pages
 *
 * Generates Schema.org Article markup for rich snippets in search results.
 * Uses DefinedTerm to describe the emoji combo entity within the article.
 * When the combo ships FAQs (CONTENT-P1-001), an additional FAQPage entity
 * is emitted so search engines can pick up "People Also Ask" style answers.
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
 * Build an optional FAQPage entity when the combo has FAQs to expose.
 * Returns `undefined` when there are no FAQs so the Article payload stays
 * clean for thin pages.
 */
function buildFaqEntity(combo: EmojiCombo) {
  const faqs = combo.longForm?.faqs;
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
 * Generate JSON-LD structured data for a combo page
 *
 * Emits a single @graph with Article + (optional) FAQPage entries so
 * search engines can pick up both the article metadata and any
 * "People Also Ask" answers (CONTENT-P1-001).
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

  const article = {
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

  const faqEntity = buildFaqEntity(combo);
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
