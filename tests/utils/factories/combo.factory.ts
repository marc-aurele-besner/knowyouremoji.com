/**
 * Mock factories for EmojiCombo types
 *
 * These factories generate realistic test data for combo-related types.
 * Use these in tests instead of inline mock objects for consistency.
 */

import type { EmojiCombo, EmojiComboSummary } from '../../../src/types/combo';

// Counter for generating unique slugs
let comboCounter = 0;

/**
 * Create a valid EmojiCombo with default values
 * @param overrides - Partial combo fields to override defaults
 */
export function createEmojiCombo(overrides: Partial<EmojiCombo> = {}): EmojiCombo {
  comboCounter++;
  const slug = overrides.slug ?? `test-combo-${comboCounter}`;

  return {
    slug,
    combo: '😀😎',
    emojis: ['grinning-face', 'smiling-face-with-sunglasses'],
    name: `Test Combo ${comboCounter}`,
    description: `A test combo created for unit testing purposes.`,
    meaning: 'Feeling happy and cool',
    examples: ['Great job today 😀😎', 'Weekend vibes 😀😎'],
    category: 'humor',
    seoTitle: `Test Combo ${comboCounter} Meaning - Emoji Combination`,
    seoDescription: `Learn what the 😀😎 emoji combo means and how to use it.`,
    ...overrides,
  };
}

/**
 * Create a valid EmojiComboSummary with default values
 * @param overrides - Partial summary fields to override defaults
 */
export function createEmojiComboSummary(
  overrides: Partial<EmojiComboSummary> = {}
): EmojiComboSummary {
  comboCounter++;

  return {
    slug: `test-combo-${comboCounter}`,
    combo: '😀😎',
    name: `Test Combo ${comboCounter}`,
    meaning: 'Feeling happy and cool',
    category: 'humor',
    ...overrides,
  };
}

/**
 * Create multiple EmojiCombo objects with unique slugs
 * @param count - Number of combos to create
 * @param overrides - Partial fields to apply to all combos
 */
export function createMultipleCombos(
  count: number,
  overrides: Partial<EmojiCombo> = {}
): EmojiCombo[] {
  return Array.from({ length: count }, () => createEmojiCombo(overrides));
}

/**
 * Create multiple EmojiComboSummary objects with unique slugs
 * @param count - Number of summaries to create
 * @param overrides - Partial fields to apply to all summaries
 */
export function createMultipleComboSummaries(
  count: number,
  overrides: Partial<EmojiComboSummary> = {}
): EmojiComboSummary[] {
  return Array.from({ length: count }, () => createEmojiComboSummary(overrides));
}
