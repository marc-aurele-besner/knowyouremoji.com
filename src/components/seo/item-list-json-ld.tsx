/**
 * JSON-LD structured data for pages that enumerate a collection.
 *
 * Category, platform, generation, and context hubs all render a list of
 * emoji meanings. Emitting an `ItemList` tells a search engine that the
 * page *is* a list of things (rather than a page that happens to mention
 * them), which is what unlocks list-style carousel rich results and
 * structured list parsing.
 *
 * For Agent Engine Optimization (AEO) the same signal helps an answer
 * engine decide that the page is a reliable enumeration of a set — the
 * shape it needs when the question is "which emojis mean X" rather than
 * "what does emoji X mean".
 */

interface ItemListJsonLdProps {
  /** Human-readable name of the list (e.g. "Smileys & Faces Emojis"). */
  name: string;
  /** Description of what the list contains. */
  description: string;
  /** Canonical URL of the page hosting the list. */
  pageUrl: string;
  /** The entries, in display order. */
  items: Array<{ name: string; url: string }>;
}

/**
 * Build the `ItemList` JSON-LD payload.
 *
 * Exported for unit tests so the shape can be asserted without rendering.
 */
export function buildItemListJsonLd({ name, description, pageUrl, items }: ItemListJsonLdProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    url: pageUrl,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

/**
 * Renders `ItemList` JSON-LD for a collection page.
 */
export function ItemListJsonLd(props: ItemListJsonLdProps) {
  const jsonLd = buildItemListJsonLd(props);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
