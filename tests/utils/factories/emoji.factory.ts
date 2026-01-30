/**
 * Mock factories for Emoji types
 *
 * These factories generate realistic test data for emoji-related types.
 * Use these in tests instead of inline mock objects for consistency.
 */

import type {
  Emoji,
  EmojiSummary,
  ContextMeaning,
  PlatformNote,
  GenerationalNote,
  EmojiWarning,
} from '../../../src/types/emoji';

// Counter for generating unique slugs
let emojiCounter = 0;

/**
 * Create a valid Emoji with default values
 * @param overrides - Partial emoji fields to override defaults
 */
export function createEmoji(overrides: Partial<Emoji> = {}): Emoji {
  emojiCounter++;
  const slug = overrides.slug ?? `test-emoji-${emojiCounter}`;

  return {
    unicode: '1F600',
    slug,
    character: '😀',
    name: `Test Emoji ${emojiCounter}`,
    shortName: 'test',
    category: 'faces',
    unicodeVersion: '6.0',
    baseMeaning: 'A test emoji for unit testing',
    tldr: 'Used for testing purposes',
    contextMeanings: [],
    platformNotes: [],
    generationalNotes: [],
    warnings: [],
    relatedCombos: [],
    seoTitle: `Test Emoji ${emojiCounter} - What Does It Mean?`,
    seoDescription: `Learn what the test emoji ${emojiCounter} really means in different contexts.`,
    ...overrides,
  };
}

/**
 * Create a valid EmojiSummary with default values
 * @param overrides - Partial summary fields to override defaults
 */
export function createEmojiSummary(overrides: Partial<EmojiSummary> = {}): EmojiSummary {
  emojiCounter++;

  return {
    slug: `test-emoji-${emojiCounter}`,
    character: '😀',
    name: `Test Emoji ${emojiCounter}`,
    category: 'faces',
    tldr: 'Used for testing purposes',
    ...overrides,
  };
}

/**
 * Create a valid ContextMeaning with default values
 * @param overrides - Partial context meaning fields to override defaults
 */
export function createContextMeaning(overrides: Partial<ContextMeaning> = {}): ContextMeaning {
  return {
    context: 'LITERAL',
    meaning: 'A straightforward, literal interpretation',
    example: 'I am happy today 😀',
    riskLevel: 'LOW',
    ...overrides,
  };
}

/**
 * Create a valid PlatformNote with default values
 * @param overrides - Partial platform note fields to override defaults
 */
export function createPlatformNote(overrides: Partial<PlatformNote> = {}): PlatformNote {
  return {
    platform: 'IMESSAGE',
    note: 'Commonly used in casual conversations',
    ...overrides,
  };
}

/**
 * Create a valid GenerationalNote with default values
 * @param overrides - Partial generational note fields to override defaults
 */
export function createGenerationalNote(
  overrides: Partial<GenerationalNote> = {}
): GenerationalNote {
  return {
    generation: 'MILLENNIAL',
    note: 'Often used sincerely to express happiness',
    ...overrides,
  };
}

/**
 * Create a valid EmojiWarning with default values
 * @param overrides - Partial warning fields to override defaults
 */
export function createEmojiWarning(overrides: Partial<EmojiWarning> = {}): EmojiWarning {
  return {
    title: 'Context Matters',
    description: 'This emoji can be interpreted differently depending on context',
    severity: 'LOW',
    ...overrides,
  };
}

/**
 * Create multiple Emoji objects with unique slugs
 * @param count - Number of emojis to create
 * @param overrides - Partial fields to apply to all emojis
 */
export function createMultipleEmojis(count: number, overrides: Partial<Emoji> = {}): Emoji[] {
  return Array.from({ length: count }, () => createEmoji(overrides));
}

/**
 * Create multiple EmojiSummary objects with unique slugs
 * @param count - Number of summaries to create
 * @param overrides - Partial fields to apply to all summaries
 */
export function createMultipleEmojiSummaries(
  count: number,
  overrides: Partial<EmojiSummary> = {}
): EmojiSummary[] {
  return Array.from({ length: count }, () => createEmojiSummary(overrides));
}
