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
 *
 * Pages remain visible to humans in every case — we only de-emphasize them
 * in Google Search so the site as a whole reads as a publisher, not a
 * template farm.
 *
 * See issue #344 (CONTENT-P1-006) and the sibling ticket CONTENT-P1-001 for
 * the content-tier taxonomy.
 */

import type { Emoji, ContentTier } from '@/types/emoji';

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
 * Order of precedence: explicit `contentTier` > skin-tone derivation > stub check.
 */
export function resolveContentTier(emoji: Emoji): ContentTier {
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
 */
export function getIndexingDecision(
  emoji: Emoji,
  pageUrl: string,
  basePageUrl?: string
): IndexingDecision {
  // Skin-tone variant → noindex + canonical to base.
  if (emoji.skinToneBase && basePageUrl) {
    return {
      index: false,
      follow: true,
      canonical: basePageUrl,
      reason: 'skin-tone variant → canonical to base emoji',
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
