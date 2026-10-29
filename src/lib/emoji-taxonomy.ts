/**
 * The canonical emoji category taxonomy.
 *
 * This module is deliberately **pure** — no `fs`, no server-only imports.
 * The emoji *loader* (`src/lib/emoji-data.ts`) reads JSON from disk and can
 * therefore only run on the server, but the taxonomy itself is needed by
 * client components too: any component that renders a link to a category
 * page has to resolve the same canonical slug the server uses, or it will
 * link to a URL that does not exist.
 */

/**
 * The valid category slugs. Every category page in the site uses one of
 * these.
 */
export const EMOJI_CATEGORY_SLUGS = [
  'faces',
  'people',
  'animals',
  'food',
  'travel',
  'activities',
  'objects',
  'symbols',
  'flags',
] as const;

/**
 * A canonical category slug.
 */
export type EmojiCategorySlug = (typeof EMOJI_CATEGORY_SLUGS)[number];

/**
 * Category display names mapping
 */
export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  faces: 'Smileys & Faces',
  people: 'People & Body',
  animals: 'Animals & Nature',
  food: 'Food & Drink',
  travel: 'Travel & Places',
  activities: 'Activities',
  objects: 'Objects',
  symbols: 'Symbols',
  flags: 'Flags',
};

/**
 * Category descriptions mapping
 */
export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  faces: 'Explore smileys, face expressions, and emotional emojis with their real-world meanings.',
  people:
    'Discover people, body parts, and gesture emojis and what they really mean in different contexts.',
  animals:
    'Learn about animal and nature emojis and their hidden meanings in modern communication.',
  food: 'Understand food and drink emojis beyond their literal meaning.',
  travel: 'Explore travel and places emojis and how they are used in everyday texting.',
  activities: 'Discover activities and sports emojis and their contextual meanings.',
  objects: 'Learn about object emojis and what they symbolize in different situations.',
  symbols: 'Understand symbol emojis and their significance in digital communication.',
  flags: 'Explore flag emojis and their usage in modern messaging.',
};

/**
 * Maps the category strings found in the emoji corpus onto the canonical
 * category taxonomy.
 *
 * The corpus was seeded over time with several parallel taxonomies —
 * `food-drink` alongside `food`, `smileys-emotion` alongside `faces`, and
 * even one category literally named `"People & Body"` (with a space and an
 * ampersand, which is not a URL slug at all).
 *
 * Left alone, those strings cause three separate problems:
 *
 * 1. Internal links point at `/emoji/category/<legacy>`, which is not a
 *    page — the visitor lands on a 404. On the homepage, two of the eight
 *    "Browse by category" tiles linked to a 404.
 * 2. The canonical category pages were incomplete, because the aliased
 *    emojis were filtered out of them.
 * 3. Each alias generated its own prerendered 404 page that still carried
 *    the site's default `index, follow` robots directives and the
 *    *homepage's* canonical URL — telling search engines that the homepage
 *    is the canonical version of a category page.
 *
 * Resolving every category to its canonical slug fixes all three without
 * touching the underlying JSON files. The mapping lives in one place so
 * it can be corrected as the taxonomy is cleaned up.
 */
export const CATEGORY_ALIASES: Record<string, EmojiCategorySlug> = {
  'food-drink': 'food',
  'animals-nature': 'animals',
  nature: 'animals',
  'smileys-emotion': 'faces',
  smileys: 'faces',
  'sky-weather': 'travel',
  weather: 'travel',
  'travel-places': 'travel',
  'people-body': 'people',
  'People & Body': 'people',
  celebration: 'activities',
};

/**
 * Resolve a raw category string to its canonical category slug.
 *
 * Unknown categories are returned unchanged, so a category added to the
 * corpus before its alias is defined still resolves to itself rather than
 * silently disappearing.
 */
export function resolveCategorySlug(category: string): string {
  return CATEGORY_ALIASES[category] ?? category;
}

/**
 * Check if a category slug is one of the canonical categories.
 *
 * @param category - Category slug to check
 * @returns True if the category is valid
 */
export function isValidCategorySlug(category: string): boolean {
  return (EMOJI_CATEGORY_SLUGS as readonly string[]).includes(category);
}

/**
 * Get the display name for a category.
 *
 * Accepts a raw or canonical category string; legacy strings are resolved
 * first so they get the same human-readable label as their canonical
 * counterpart.
 */
export function getCategoryDisplayName(category: string): string {
  const slug = resolveCategorySlug(category);
  return CATEGORY_DISPLAY_NAMES[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
}

/**
 * Get the description for a category.
 */
export function getCategoryDescription(category: string): string {
  const slug = resolveCategorySlug(category);
  return CATEGORY_DESCRIPTIONS[slug] || `Explore ${slug} emojis and their meanings in context.`;
}
