/**
 * The shared definition of "templated combo copy".
 *
 * A batch of 750 combo pages was generated from a template that pasted the
 * same paragraphs into every file. Those paragraphs were specific enough to
 * pass a word-count check and vague enough to say nothing, and because they
 * were byte-identical across hundreds of pages they read as one page repeated
 * seven hundred times.
 *
 * Three consumers depend on this list:
 *
 *   1. `scripts/validate-emojis.ts` — rejects a combo whose prose contains
 *      any of these phrases, so the template cannot be reintroduced.
 *   2. `scripts/check-content-similarity.ts` — reports how much of the
 *      catalog still carries the shared boilerplate.
 *   3. `scripts/regenerate-combo-content.ts` — tells the writer which combos
 *      need rewriting, forbids the phrases in the prompt, and rejects a
 *      completion that reintroduces one.
 *
 * Keep the phrase list matched to the style guide rather than the other way
 * round: these are the sentences that made the catalog read as generated.
 */

/**
 * Full sentences and clauses that were pasted across the catalog. Matched
 * case-insensitively against normalized prose.
 */
export const COMBO_BOILERPLATE_PHRASES: string[] = [
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
 * Words the catalog leaned on to describe meaning abstractly instead of
 * describing what people actually do. They are not banned outright — "cue"
 * and "energy" read fine in moderation — but a combination of them is the
 * signature of the old template.
 */
export const COMBO_JARGON_WORDS: string[] = [
  'register',
  'cadence',
  'the read',
  // "-coded" covers "coded", "shallow-coded", "reaction-coded" and the rest,
  // so the compound is counted once instead of once per overlapping entry.
  '-coded',
  'travels without losing',
  'the cue',
];

/**
 * Phrases that are long enough that a single appearance proves the paragraph
 * came from the template.
 */
export const COMBO_STRONG_JARGON_PHRASES: string[] = [
  'without losing the read',
  'without losing the cue',
  'the register itself',
  'the meaning is consistent',
  'shallow-coded',
  '-coded',
];

/**
 * Lowercase and collapse whitespace so comparisons ignore case and wrapping.
 */
export function normalizeProse(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Find every boilerplate phrase present in a piece of prose.
 */
export function findBoilerplate(text: string): string[] {
  const normalized = normalizeProse(text);
  const hits: string[] = [];

  for (const phrase of COMBO_BOILERPLATE_PHRASES) {
    // "which is why" is only a marker in the company it keeps; it is dropped
    // from the phrase list below and checked as part of the longer clause.
    if (phrase === 'which is why') continue;
    if (normalized.includes(phrase)) hits.push(phrase);
  }

  for (const phrase of COMBO_STRONG_JARGON_PHRASES) {
    if (normalized.includes(phrase)) hits.push(phrase);
  }

  return [...new Set(hits)];
}

/**
 * Count the jargon words in a piece of prose. A high count means the prose
 * is describing meaning abstractly rather than describing behaviour.
 */
export function countJargon(text: string): number {
  const normalized = normalizeProse(text);
  let count = 0;
  for (const word of COMBO_JARGON_WORDS) {
    if (word.startsWith('-')) {
      count += (
        normalized.match(new RegExp(word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g')) ?? []
      ).length;
    } else {
      const matches = normalized.match(
        new RegExp(`\\b${word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'g')
      );
      count += matches ? matches.length : 0;
    }
  }
  return count;
}

/**
 * The prose fields on a combo that a reader actually sees. Used when
 * scanning a combo for boilerplate.
 */
export const COMBO_PROSE_FIELDS = [
  'description',
  'meaning',
  'longForm.overview',
  'longForm.howPeopleUseIt',
  'longForm.whenNotToUse',
  'longForm.howToReply',
] as const;

/**
 * Pull the reader-visible prose out of a combo record.
 *
 * Both the validator and the similarity checker scan the same text, so it is
 * gathered in one place — if a field is added to the page, it only has to be
 * added here.
 */
export function comboProse(combo: {
  description?: string;
  meaning?: string;
  longForm?: {
    overview?: string;
    howPeopleUseIt?: string;
    whenNotToUse?: string;
    howToReply?: string;
    faqs?: Array<{ question?: string; answer?: string }>;
  };
  conversationExamples?: Array<{ message?: string; interpretation?: string }>;
}): string {
  return [
    combo.description ?? '',
    combo.meaning ?? '',
    combo.longForm?.overview ?? '',
    combo.longForm?.howPeopleUseIt ?? '',
    combo.longForm?.whenNotToUse ?? '',
    combo.longForm?.howToReply ?? '',
    ...(combo.longForm?.faqs ?? []).flatMap((faq) => [faq.question ?? '', faq.answer ?? '']),
    ...(combo.conversationExamples ?? []).flatMap((example) => [
      example.message ?? '',
      example.interpretation ?? '',
    ]),
  ].join('\n');
}

/**
 * Find the shared template language in a combo record.
 */
export function findComboBoilerplate(combo: Parameters<typeof comboProse>[0]): string[] {
  return findBoilerplate(comboProse(combo));
}
