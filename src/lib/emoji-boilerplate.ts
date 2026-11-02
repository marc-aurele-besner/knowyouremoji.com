/**
 * Detection of batch-generated ("templated") emoji copy.
 *
 * A large batch of the catalog was produced by running one page template
 * over the whole emoji list. The template filled in the word-count and
 * FAQ-count thresholds that the publishing QA pipeline checks, so every
 * generated page was stamped `contentTier: "deep"` and every one of them
 * shipped a FAQ array. What the template could not do was write about a
 * particular emoji, so the pages share their sentences: the same clause in
 * the overview, the same clause in the FAQ answers, and the same "-coded"
 * compound sprayed through the long-form.
 *
 * Those pages are not deep by accident — they are near-duplicates of each
 * other. Publishing them as indexable originals is exactly the doorway-page
 * pattern the site's own indexing policy is written to avoid, so the copy
 * has to be checked rather than the tier stamped on the file.
 *
 * The markers below are the ones the batch is known to carry. They are
 * deliberately specific: a page is only flagged when it matches the
 * template, so hand-written pages keep their place in the index — including
 * the ones that legitimately use "-coded" compounds a few times.
 *
 * @see issue #479
 */

import type { Emoji } from '@/types/emoji';

/**
 * Phrases the batch generator pasted into the opening of `longForm.overview`.
 *
 * "is the emoji of" turns a sentence about the glyph into a sentence about
 * the category: "ginger root is the emoji of ginger root-coded ginger root
 * flex". It reads as a sentence but says nothing about the emoji.
 */
export const EMOJI_TEMPLATE_OVERVIEW_PHRASES: readonly string[] = ['is the emoji of'];

/**
 * Phrases the batch generator pasted into FAQ answers.
 *
 * "is a natural fit for" is the tell that a FAQ answer was assembled from
 * the emoji's own name rather than written about how people use it.
 */
export const EMOJI_TEMPLATE_FAQ_PHRASES: readonly string[] = ['is a natural fit for'];

/**
 * The compound the generator used to bolt an identity onto a meaning
 * ("olive-coded reference", "shush-coded monkey").
 */
export const EMOJI_TEMPLATE_CODED_TOKEN = '-coded';

/**
 * How many "-coded" compounds the long-form may carry before the page
 * reads as generated rather than written.
 */
export const EMOJI_TEMPLATE_CODED_TOKEN_LIMIT = 10;

/**
 * Lowercase and collapse whitespace so comparisons ignore case and wrapping.
 */
export function normalizeProse(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Count the "-coded" compounds in a piece of prose.
 *
 * The compound is counted as one token, so "olive-coded" matches once
 * rather than once per overlapping entry.
 */
export function countCodedTokens(text: string): number {
  const normalized = normalizeProse(text);
  return (normalized.match(/-coded/g) ?? []).length;
}

/**
 * The long-form prose a reader actually sees on an emoji page.
 *
 * The scan is scoped to the long-form rather than to the whole record: the
 * short fields (`tldr`, `contextMeanings`, `conversationExamples`) are
 * written by hand on pages the generator never touched, and they carry
 * "-coded" compounds of their own.
 */
export function emojiLongFormProse(emoji: Pick<Emoji, 'longForm'>): string {
  const longForm = emoji.longForm;
  if (!longForm) return '';

  return [
    longForm.overview ?? '',
    longForm.howPeopleUseIt ?? '',
    longForm.whenNotToUse ?? '',
    longForm.howToReply ?? '',
    ...(longForm.faqs ?? []).flatMap((faq) => [faq.question ?? '', faq.answer ?? '']),
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * The kind of rule that matched a page.
 */
export type EmojiTemplateMarkerKind = 'overview-phrase' | 'faq-phrase' | 'coded-token';

/**
 * A single reason a page was flagged as templated.
 */
export interface EmojiTemplateFinding {
  /** Which rule matched. */
  kind: EmojiTemplateMarkerKind;
  /** The phrase or token that matched, as it appears in the copy. */
  match: string;
}

/**
 * Find every template marker present in an emoji's long-form.
 *
 * Returns an empty array for a hand-written page, so this doubles as the
 * test for "does this page still read like a page about one emoji".
 */
export function findEmojiTemplateMarkers(emoji: Pick<Emoji, 'longForm'>): EmojiTemplateFinding[] {
  const findings: EmojiTemplateFinding[] = [];
  const longForm = emoji.longForm;
  if (!longForm) return findings;

  const overview = normalizeProse(longForm.overview ?? '');
  for (const phrase of EMOJI_TEMPLATE_OVERVIEW_PHRASES) {
    if (overview.includes(phrase)) {
      findings.push({ kind: 'overview-phrase', match: phrase });
    }
  }

  for (const faq of longForm.faqs ?? []) {
    const faqText = normalizeProse(`${faq.question ?? ''} ${faq.answer ?? ''}`);
    for (const phrase of EMOJI_TEMPLATE_FAQ_PHRASES) {
      if (faqText.includes(phrase)) {
        findings.push({ kind: 'faq-phrase', match: phrase });
      }
    }
  }

  const codedCount = countCodedTokens(emojiLongFormProse(emoji));
  if (codedCount >= EMOJI_TEMPLATE_CODED_TOKEN_LIMIT) {
    findings.push({
      kind: 'coded-token',
      match: `${EMOJI_TEMPLATE_CODED_TOKEN} × ${codedCount}`,
    });
  }

  return findings;
}

/**
 * Whether an emoji page was produced by the batch template.
 *
 * A templated page is a doorway page: it stays online for the readers who
 * land on it, but it must not be indexed as an original article.
 */
export function isEmojiTemplated(emoji: Pick<Emoji, 'longForm'>): boolean {
  return findEmojiTemplateMarkers(emoji).length > 0;
}
