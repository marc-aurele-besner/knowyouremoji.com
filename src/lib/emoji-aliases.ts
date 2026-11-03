/**
 * One canonical page per emoji glyph.
 *
 * The catalog publishes several slugs for the same character (`100` and
 * `hundred-points` for 💯, four slugs for 😈, ...). Left alone, every one of
 * them is an indexable page with the same title pattern, so search engines
 * get two to four URLs per glyph (issue #482).
 *
 * `src/data/emoji-aliases.json` maps every slug that duplicates another
 * page's glyph to the slug that owns the glyph. Alias pages are noindexed
 * with a canonical to the owner (`src/lib/seo-policy.ts`), left out of the
 * sitemap (`src/lib/sitemap-entries.ts`), and redirected to the owner
 * (`next.config.ts`). The map is written by
 * `scripts/generate-emoji-aliases.ts` and checked by
 * `scripts/validate-emojis.ts`.
 *
 * This module is imported by `next.config.ts`, so it uses relative imports
 * only.
 */

import aliases from '../data/emoji-aliases.json';

/** Alias slug → slug of the page that owns the glyph. */
export const EMOJI_ALIASES: Readonly<Record<string, string>> = aliases;

/**
 * Slugs that share a glyph with another page but are not aliases of it: the
 * slug names a different emoji than the one the page shows (the
 * `face-with-tears-of-joy` page shows 🤣, not 😂). Redirecting them to the
 * page for the glyph they show would send readers looking for the named
 * emoji to the wrong one, so they stay out of the alias map until the page
 * is relabeled or rewritten.
 */
export const MISLABELED_EMOJI_SLUGS: readonly string[] = [
  'blossom',
  'face-with-tears-of-joy',
  'fish',
  'monkey',
  'post-office',
  'rabbit',
];

/** Whether the slug duplicates another page's glyph. */
export function isEmojiAlias(slug: string): boolean {
  return Object.hasOwn(EMOJI_ALIASES, slug);
}

/** The slug of the page that owns this slug's glyph (the slug itself when it is not an alias). */
export function getCanonicalEmojiSlug(slug: string): string {
  return isEmojiAlias(slug) ? EMOJI_ALIASES[slug] : slug;
}
