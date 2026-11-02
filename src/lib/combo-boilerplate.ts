/**
 * Detection of batch-generated ("templated") combo copy.
 *
 * A batch of 750 combo pages was produced by running one page template over
 * the whole catalog. The template filled in the word-count and FAQ-count
 * thresholds that the publishing QA pipeline checks, so every generated page
 * was stamped `contentTier: "deep"` and every one of them shipped a FAQ
 * array. What the template could not do was write about a particular pair of
 * emoji, so the pages shared their sentences: the same clause in the
 * overview, the same clause in the FAQ answers, and the same "-coded"
 * compound sprayed through the long-form.
 *
 * Those pages are not deep by accident — they are near-duplicates of each
 * other. Publishing them as indexable originals is exactly the doorway-page
 * pattern the site's own indexing policy is written to avoid, so the copy
 * has to be checked rather than the tier stamped on the file. That is the
 * same rule the emoji catalog follows (`src/lib/emoji-boilerplate.ts`).
 *
 * The markers below are deliberately specific: a page is only flagged when
 * it matches the template, so hand-written pages keep their place in the
 * index — including the ones that legitimately use "-coded" compounds a few
 * times.
 *
 * @see issue #481
 */

import type { EmojiCombo } from '@/types/combo';

/**
 * Phrases the batch generator used to fill a slot with the combo's own name.
 *
 * "The read depends on context, but the register itself does not" was the
 * tell that a sentence had been assembled from the template rather than
 * written about the pair. It ran through the `whenNotToUse` and `howToReply`
 * sections of hundreds of pages.
 *
 * The rest are the other fillers the generator used to reach a word minimum,
 * the paragraphs it appended to every overview, the per-family habitat
 * paragraphs, and the per-category archetype openers. They are scanned
 * across the whole long-form rather than only in the slot the batch happened
 * to fill, because they are the batch's language wherever they appear.
 */
export const COMBO_TEMPLATE_PHRASES: readonly string[] = [
  // The six fillers the generator used to reach a word minimum.
  'the read depends on context, but the register itself does not',
  'across platforms the meaning is consistent, and the cadence stays the same',
  'the combo lands in 1:1 threads, on instagram, and on tiktok without losing the read',
  'in tight groups it carries more warmth; in cross-functional work threads it carries less',
  'the receiver reads the combo the same whether it lands at the end of a sentence or as a stand-alone reaction',
  'most platforms render the two emojis side by side, but the read does not change with spacing',

  // The paragraphs the generator appended to every overview.
  'the two-emoji register is consistent across audiences',
  'borrows the register most senders in the family expect',
  'the cue sticks whether',
  'so it lands as expected rather than as a surprise',

  // The per-family habitat paragraphs.
  'combos in the hearts & love family are',
  'combos in the smileys & emotion family are',
  'combos in the hands & body family are',
  'combos in the animals & creatures family are',
  'combos in the food & drink family are',
  'combos in the travel & places family are',
  'combos in the weather, nature & seasons family are',
  'combos in the sports, music & activities family are',
  'combos in the symbols, sparkles & effects are',
  'combos in the objects, tools & tech family are',

  // The per-category archetype openers.
  'the two emojis do the joke work together',
  'is the humor-coded reaction',
  'lives in the work-coded space',
  'uses two emojis to do reaction work one alone',
  'is the reaction-coded close',
  'carries an emotion-coded reaction',
  'pairs two emojis to do the joke work in one move',
  'lives in the emotion-coded space',
  'signals a reaction-coded reply',
  'used to react to a moment the sender wants punctuated',
];

/**
 * The compound the generator used to bolt an identity onto a meaning
 * ("olive-coded reference", "shush-coded monkey").
 */
export const COMBO_TEMPLATE_CODED_TOKEN = '-coded';

/**
 * How many "-coded" compounds the long-form may carry before the page
 * reads as generated rather than written.
 */
export const COMBO_TEMPLATE_CODED_TOKEN_LIMIT = 10;

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
 * The long-form prose a reader actually sees on a combo page.
 *
 * The scan is scoped to the long-form rather than to the whole record: the
 * short fields (`description`, `meaning`, `examples`) are written by hand on
 * pages the generator never touched, and they carry "-coded" compounds of
 * their own.
 */
export function comboLongFormProse(combo: Pick<EmojiCombo, 'longForm'>): string {
  const longForm = combo.longForm;
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
export type ComboTemplateMarkerKind = 'template-phrase' | 'coded-token';

/**
 * A single reason a page was flagged as templated.
 */
export interface ComboTemplateFinding {
  /** Which rule matched. */
  kind: ComboTemplateMarkerKind;
  /** The phrase or token that matched, as it appears in the copy. */
  match: string;
}

/**
 * Find every template marker present in a combo's long-form.
 *
 * Returns an empty array for a hand-written page, so this doubles as the
 * test for "does this page still read like a page about one pair of emoji".
 */
export function findComboTemplateMarkers(
  combo: Pick<EmojiCombo, 'longForm'>
): ComboTemplateFinding[] {
  const findings: ComboTemplateFinding[] = [];
  const longForm = combo.longForm;
  if (!longForm) return findings;

  const prose = normalizeProse(comboLongFormProse(combo));

  for (const phrase of COMBO_TEMPLATE_PHRASES) {
    if (prose.includes(phrase)) {
      findings.push({ kind: 'template-phrase', match: phrase });
    }
  }

  const codedCount = countCodedTokens(comboLongFormProse(combo));
  if (codedCount >= COMBO_TEMPLATE_CODED_TOKEN_LIMIT) {
    findings.push({
      kind: 'coded-token',
      match: `${COMBO_TEMPLATE_CODED_TOKEN} × ${codedCount}`,
    });
  }

  return findings;
}

/**
 * Whether a combo page was produced by the batch template.
 *
 * A templated page is a doorway page: it stays online for the readers who
 * land on it, but it must not be indexed as an original article.
 */
export function isComboTemplated(combo: Pick<EmojiCombo, 'longForm'>): boolean {
  return findComboTemplateMarkers(combo).length > 0;
}
