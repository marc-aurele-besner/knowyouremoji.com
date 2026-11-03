/**
 * Indexing / robots policy for KnowYourEmoji
 *
 * AdSense reviewers flag large volumes of auto-generated, near-duplicate pages.
 * To stay out of the "thin doorway" bucket we classify every emoji page by
 * `contentTier` and apply the following rules:
 *
 * 1. `deep`     pages  → index, follow (canonical = self)
 * 2. `standard` pages  → index, follow (canonical = self)
 * 3. `thin`     pages  → noindex, follow (canonical = self, page still serves users)
 * 4. Skin-tone variations of a base emoji → noindex, follow, canonical = base emoji
 * 5. Low-content "stub" emoji JSON (no context meanings AND no long-form)
 *    → noindex, follow (canonical = self)
 * 6. Batch-generated combo copy (same rule as the emoji side) → noindex,
 *    follow (canonical = self, page still serves users)
 * 7. Alias slugs — a second page for a glyph another page owns
 *    (`src/lib/emoji-aliases.ts`) → noindex, follow, canonical = owner.
 *    `next.config.ts` also redirects them, so this is the fallback.
 *
 * Pages remain visible to humans in every case — we only de-emphasize them
 * in Google Search so the site as a whole reads as a publisher, not a
 * template farm.
 *
 * A `contentTier` stamp is not sufficient on its own. The batch generator
 * wrote `deep` onto the pages it produced, because the template satisfied
 * the deep-tier word and FAQ thresholds. Those pages are near-duplicates of
 * each other, so the tier is checked against the copy itself: an emoji
 * whose long-form still carries the template markers is treated as `thin`
 * no matter what the file claims. The combo catalog follows the same rule.
 *
 * See issue #344 (CONTENT-P1-006) and the sibling ticket CONTENT-P1-001 for
 * the content-tier taxonomy. See issue #479 for the emoji template markers
 * and issue #481 for the combo ones.
 */

import type { Emoji, ContentTier } from '@/types/emoji';
import type { EmojiCombo, ComboContentTier } from '@/types/combo';
import { findEmojiTemplateMarkers, isEmojiTemplated } from '@/lib/emoji-boilerplate';
import { findComboTemplateMarkers, isComboTemplated } from '@/lib/combo-boilerplate';

export interface IndexingDecision {
  /** Whether search engines should index the page */
  index: boolean;
  /** Whether crawlers should follow links on the page */
  follow: boolean;
  /** Whether to set a canonical URL (string = absolute URL, false = no canonical) */
  canonical: string | false;
  /** Reason for the decision, surfaced for debugging + JSON-LD */
  reason: string;
}

/**
 * Effective content tier after applying thin-page heuristics.
 * Order of precedence: template detection > explicit `contentTier` >
 * skin-tone derivation > stub check.
 */
export function resolveContentTier(emoji: Emoji): ContentTier {
  // Batch-generated copy is thin by definition: the template satisfied the
  // deep-tier thresholds, so the stamped tier proves nothing. Checked
  // first so a templated page cannot buy its way into the index.
  if (isEmojiTemplated(emoji)) return 'thin';

  if (emoji.contentTier) return emoji.contentTier;

  // Skin-tone variations are by definition thin duplicates.
  if (emoji.skinToneBase) return 'thin';

  // Stub JSON: no context meanings, no platform/generational notes, no long-form.
  const isStub =
    emoji.contextMeanings.length === 0 &&
    emoji.platformNotes.length === 0 &&
    emoji.generationalNotes.length === 0 &&
    !emoji.longForm &&
    !emoji.conversationExamples?.length;

  return isStub ? 'thin' : 'standard';
}

/**
 * Decide how a given emoji page should be indexed and canonicalized.
 *
 * @param emoji        The full emoji record.
 * @param pageUrl      Absolute URL of the page being generated (used for canonical).
 * @param basePageUrl  Absolute URL of the skin-tone base page, when applicable.
 * @param ownerPageUrl Absolute URL of the page that owns this glyph, when the
 *                     slug is an alias (see `src/lib/emoji-aliases.ts`).
 */
export function getIndexingDecision(
  emoji: Emoji,
  pageUrl: string,
  basePageUrl?: string,
  ownerPageUrl?: string
): IndexingDecision {
  // Alias of another page for the same glyph → noindex + canonical to the
  // owner, so each emoji has one indexable URL (issue #482).
  if (ownerPageUrl) {
    return {
      index: false,
      follow: true,
      canonical: ownerPageUrl,
      reason: 'alias slug → canonical to the page that owns the emoji',
    };
  }

  // Skin-tone variant → noindex + canonical to base.
  if (emoji.skinToneBase && basePageUrl) {
    return {
      index: false,
      follow: true,
      canonical: basePageUrl,
      reason: 'skin-tone variant → canonical to base emoji',
    };
  }

  // Batch-generated copy → noindex. The page keeps serving readers, but it
  // must not be indexed as an original article, and it must not carry FAQ
  // structured data (see `emoji-json-ld.tsx`).
  const templateMarkers = findEmojiTemplateMarkers(emoji);
  if (templateMarkers.length > 0) {
    return {
      index: false,
      follow: true,
      canonical: pageUrl,
      reason: `templated copy (${templateMarkers.map((marker) => marker.match).join(', ')}) → noindex, keep reachable for users`,
    };
  }

  const tier = resolveContentTier(emoji);

  if (tier === 'thin') {
    return {
      index: false,
      follow: true,
      canonical: pageUrl,
      reason: 'thin content → keep reachable for users, de-emphasize in search',
    };
  }

  return {
    index: true,
    follow: true,
    canonical: pageUrl,
    reason: `${tier} content → index,follow`,
  };
}

/**
 * Convert an {@link IndexingDecision} into the Next.js `robots` metadata shape
 * (`Metadata.robots`).
 */
export function decisionToRobots(decision: IndexingDecision) {
  return {
    index: decision.index,
    follow: decision.follow,
    googleBot: {
      index: decision.index,
      follow: decision.follow,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  };
}

/**
 * Effective content tier for a combo, mirroring {@link resolveContentTier}
 * for emojis. Combos do not have skin-tone variants, so the rules are:
 *
 * 1. Batch-generated copy is `thin` no matter what the file claims.
 * 2. Explicit `contentTier: 'thin' | 'standard' | 'deep'` wins.
 * 3. Otherwise: pages with `longForm` (article-style content) or any
 *    `conversationExamples` are treated as `standard`. Bare-bones combos
 *    with only `meaning`/`description`/`examples` are treated as `thin`
 *    until someone fills them in.
 */
export function resolveComboContentTier(combo: EmojiCombo): ComboContentTier {
  // Batch-generated copy is thin by definition: the template satisfied the
  // deep-tier thresholds, so the stamped tier proves nothing. Checked
  // first so a templated page cannot buy its way into the index.
  if (isComboTemplated(combo)) return 'thin';

  if (combo.contentTier) return combo.contentTier;

  const hasLongForm =
    Boolean(combo.longForm) &&
    (Boolean(combo.longForm?.overview) ||
      Boolean(combo.longForm?.howPeopleUseIt) ||
      Boolean(combo.longForm?.whenNotToUse) ||
      Boolean(combo.longForm?.howToReply) ||
      (combo.longForm?.faqs?.length ?? 0) > 0);

  if (hasLongForm) return 'deep';

  if ((combo.conversationExamples?.length ?? 0) > 0) return 'standard';

  // Bare meaning/description/examples only — treat as thin until enriched.
  return 'thin';
}

/**
 * Decide how a combo page should be indexed and canonicalized.
 *
 * Mirrors {@link getIndexingDecision} for emojis. Combos do not have
 * skin-tone variants, so the policy is simpler:
 *
 * - batch-generated copy → noindex, follow (page still serves users)
 * - `deep`     → index, follow
 * - `standard` → index, follow
 * - `thin`     → noindex, follow (page still serves users)
 */
export function getComboIndexingDecision(combo: EmojiCombo, pageUrl: string): IndexingDecision {
  // Batch-generated copy → noindex. The page keeps serving readers, but it
  // must not be indexed as an original article.
  const templateMarkers = findComboTemplateMarkers(combo);
  if (templateMarkers.length > 0) {
    return {
      index: false,
      follow: true,
      canonical: pageUrl,
      reason: `templated copy (${templateMarkers.map((marker) => marker.match).join(', ')}) → noindex, keep reachable for users`,
    };
  }

  const tier = resolveComboContentTier(combo);

  if (tier === 'thin') {
    return {
      index: false,
      follow: true,
      canonical: pageUrl,
      reason: 'thin content → keep reachable for users, de-emphasize in search',
    };
  }

  return {
    index: true,
    follow: true,
    canonical: pageUrl,
    reason: `${tier} content → index,follow`,
  };
}
