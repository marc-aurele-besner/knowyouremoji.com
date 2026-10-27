/**
 * Shared helpers for building Schema.org payloads.
 *
 * The emoji, combo, and guide pages all publish `Article` markup. Rather
 * than hand-rolling the same publisher/date/image fields three times (and
 * letting them drift apart), the common pieces live here.
 *
 * The Article structured data requirements are stricter than they look:
 * Google expects `headline`, `image`, `datePublished`, `dateModified`,
 * and `author` before it will consider a page eligible for an article
 * rich result. `author` and `image` were missing from the emoji and combo
 * markup, which is why those pages were never eligible.
 */

/**
 * Normalize a possibly-missing ISO date into a stable `YYYY-MM-DD` string.
 *
 * Returns `undefined` when the value is missing or unparseable, so callers
 * omit the field rather than emitting a fabricated date.
 */
export function toIsoDay(isoDate: string | undefined): string | undefined {
  if (!isoDate) return undefined;
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
}

/**
 * Resolve the publish/modify dates for an Article entity.
 *
 * Our content model tracks a single editorial timestamp
 * (`contentUpdatedAt`) — the day the interpretation was last written or
 * refreshed. There is no separate original-publication date in the data,
 * and these pages are authored and revised as a unit, so the same date is
 * published for both. Omitting `datePublished` entirely would drop the
 * page out of article rich-result eligibility, which is the worse trade.
 */
export function resolveArticleDates(contentUpdatedAt: string | undefined): {
  datePublished?: string;
  dateModified?: string;
} {
  const day = toIsoDay(contentUpdatedAt);
  if (!day) return {};
  return { datePublished: day, dateModified: day };
}

/**
 * Build the `Organization` publisher entity.
 */
export function buildPublisher(appName: string, appUrl: string) {
  return {
    '@type': 'Organization',
    name: appName,
    url: appUrl,
  };
}

/**
 * Build the `mainEntityOfPage` reference for an Article.
 *
 * The `WebPage` node carries the page's own name and its breadcrumb id,
 * which lets Google stitch the article, the breadcrumb trail, and the
 * site identity together in one knowledge graph.
 */
export function buildMainEntityOfPage(pageUrl: string, name: string) {
  return {
    '@type': 'WebPage',
    '@id': pageUrl,
    name,
  };
}

/**
 * Build an `ImageObject` reference for the social/hero image of a page.
 */
export function buildImageObject(url: string, alt: string) {
  return {
    '@type': 'ImageObject',
    url,
    width: 1200,
    height: 630,
    alt,
  };
}

/**
 * Build the `isPartOf` reference linking a page entity to the site.
 *
 * The `@id` matches the `WebSite` node emitted site-wide by
 * `src/components/seo/site-json-ld.tsx`.
 */
export function buildIsPartOf(appUrl: string) {
  const baseUrl = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;
  return { '@id': `${baseUrl}/#website` };
}

/**
 * Minimal shape needed to build an `ItemList` entry for an emoji.
 */
export interface ListableEmoji {
  slug: string;
  character: string;
  name: string;
}

/**
 * Minimal shape needed to build an `ItemList` entry for a combo.
 */
export interface ListableCombo {
  slug: string;
  combo: string;
  name: string;
}

/**
 * Build `ItemList` entries for a set of emoji.
 *
 * The entry name carries the emoji character so the list reads correctly
 * in a search result: "💀 Skull" rather than a bare "Skull".
 */
export function buildEmojiListItems(appUrl: string, emojis: ListableEmoji[]) {
  const baseUrl = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;
  return emojis.map((emoji) => ({
    name: `${emoji.character} ${emoji.name}`,
    url: `${baseUrl}/emoji/${emoji.slug}`,
  }));
}

/**
 * Build `ItemList` entries for a set of emoji combos.
 */
export function buildComboListItems(appUrl: string, combos: ListableCombo[]) {
  const baseUrl = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;
  return combos.map((combo) => ({
    name: `${combo.combo} ${combo.name}`,
    url: `${baseUrl}/combo/${combo.slug}`,
  }));
}
