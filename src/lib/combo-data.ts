/**
 * Combo data loader utility
 *
 * Provides functions to load and query emoji combo data from static JSON files.
 * Used in Phase 1 (static architecture without database).
 */

import type { EmojiCombo, EmojiComboSummary, EmojiComboCategoryName } from '@/types/combo';
import type { EmojiSlug } from '@/types/emoji';

// Import Node.js fs for SSG/SSR context
import fs from 'fs';
import path from 'path';

// Cache for loaded combos
let comboCache: EmojiCombo[] | null = null;

/**
 * Get the path to the combos data directory
 */
function getCombosDir(): string {
  return path.join(process.cwd(), 'src', 'data', 'combos');
}

/**
 * Load all combo data from JSON files
 * Results are cached after first load
 */
function loadCombos(): EmojiCombo[] {
  if (comboCache !== null) {
    return comboCache;
  }

  const combosDir = getCombosDir();

  // Check if directory exists
  if (!fs.existsSync(combosDir)) {
    comboCache = [];
    return comboCache;
  }

  const files = fs.readdirSync(combosDir).filter((file) => file.endsWith('.json'));

  comboCache = files.map((file) => {
    const filePath = path.join(combosDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as EmojiCombo;
  });

  return comboCache;
}

/**
 * Get all combos
 * @returns Array of all combo data
 */
export function getAllCombos(): EmojiCombo[] {
  return loadCombos();
}

/**
 * Get a combo by its slug
 * @param slug - URL-friendly identifier for the combo
 * @returns Combo data or undefined if not found
 */
export function getComboBySlug(slug: string): EmojiCombo | undefined {
  return loadCombos().find((combo) => combo.slug === slug);
}

/**
 * Get all combos in a specific category
 * @param category - Category to filter by
 * @returns Array of combos in the category
 */
export function getCombosByCategory(category: EmojiComboCategoryName): EmojiCombo[] {
  return loadCombos().filter((combo) => combo.category === category);
}

/**
 * Get all unique categories from loaded combos
 * @returns Array of unique category names
 */
export function getAllComboCategories(): EmojiComboCategoryName[] {
  const categories = loadCombos().map((combo) => combo.category);
  return [...new Set(categories)];
}

/**
 * Search combos by name, combo string, meaning, or description
 * @param query - Search query string
 * @returns Array of matching combos
 */
export function searchCombos(query: string): EmojiCombo[] {
  const normalizedQuery = query.toLowerCase();
  return loadCombos().filter((combo) => {
    return (
      combo.name.toLowerCase().includes(normalizedQuery) ||
      combo.combo.includes(query) ||
      combo.meaning.toLowerCase().includes(normalizedQuery) ||
      combo.description.toLowerCase().includes(normalizedQuery) ||
      combo.slug.toLowerCase().includes(normalizedQuery) ||
      (combo.tags && combo.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)))
    );
  });
}

/**
 * Get the total count of combos
 * @returns Number of combos loaded
 */
export function getComboCount(): number {
  return loadCombos().length;
}

/**
 * Get combo summaries for list/grid display
 * @returns Array of combo summaries
 */
export function getComboSummaries(): EmojiComboSummary[] {
  return loadCombos().map((combo) => ({
    slug: combo.slug,
    combo: combo.combo,
    name: combo.name,
    meaning: combo.meaning,
    category: combo.category,
  }));
}

/**
 * Get all combo slugs for static path generation
 * @returns Array of all combo slugs
 */
export function getAllComboSlugs(): string[] {
  return loadCombos().map((combo) => combo.slug);
}

/**
 * Get related combos for a given combo (same category, excluding the current combo)
 * @param slug - Slug of the current combo
 * @param limit - Maximum number of related combos to return (default: 6)
 * @returns Array of related combo summaries
 */
export function getRelatedCombos(slug: string, limit: number = 6): EmojiComboSummary[] {
  const currentCombo = getComboBySlug(slug);
  if (!currentCombo) {
    return [];
  }

  const sameCategory = loadCombos().filter(
    (combo) => combo.category === currentCombo.category && combo.slug !== slug
  );

  return sameCategory.slice(0, limit).map((combo) => ({
    slug: combo.slug,
    combo: combo.combo,
    name: combo.name,
    meaning: combo.meaning,
    category: combo.category,
  }));
}

/**
 * Get combos that contain a specific emoji
 * @param emojiSlug - Slug of the emoji to search for
 * @returns Array of combos containing the emoji
 */
export function getCombosByEmoji(emojiSlug: EmojiSlug): EmojiCombo[] {
  return loadCombos().filter((combo) => combo.emojis.includes(emojiSlug));
}

/**
 * Get combo summaries for a specific category
 * @param category - Category slug
 * @returns Array of combo summaries in the category
 */
export function getComboSummariesByCategory(category: EmojiComboCategoryName): EmojiComboSummary[] {
  return getCombosByCategory(category).map((combo) => ({
    slug: combo.slug,
    combo: combo.combo,
    name: combo.name,
    meaning: combo.meaning,
    category: combo.category,
  }));
}

/**
 * Get combo summaries that contain a specific emoji
 * @param emojiSlug - Slug of the emoji to search for
 * @param limit - Maximum number of combos to return (default: 6)
 * @returns Array of combo summaries containing the emoji
 */
export function getComboSummariesByEmoji(
  emojiSlug: EmojiSlug,
  limit: number = 6
): EmojiComboSummary[] {
  const combos = getCombosByEmoji(emojiSlug);
  return combos.slice(0, limit).map((combo) => ({
    slug: combo.slug,
    combo: combo.combo,
    name: combo.name,
    meaning: combo.meaning,
    category: combo.category,
  }));
}

/**
 * Combo category display names mapping
 */
const COMBO_CATEGORY_DISPLAY_NAMES: Record<EmojiComboCategoryName, string> = {
  humor: 'Humor',
  flirting: 'Flirting',
  sarcasm: 'Sarcasm',
  celebration: 'Celebration',
  emotion: 'Emotion',
  reaction: 'Reaction',
  relationship: 'Relationship',
  work: 'Work',
  food: 'Food',
  travel: 'Travel',
  other: 'Other',
};

/**
 * Combo category descriptions mapping
 */
const COMBO_CATEGORY_DESCRIPTIONS: Record<EmojiComboCategoryName, string> = {
  humor:
    'The best emoji combos for humor and jokes. Make people laugh with these emoji combinations.',
  flirting:
    'Flirty emoji combinations for dating and romantic messages. Perfect for catching attention.',
  sarcasm: 'Sarcastic emoji combos for ironic and tongue-in-cheek messages.',
  celebration:
    'Celebrate with these emoji combinations perfect for exciting news and achievements.',
  emotion: 'Express emotions with these meaningful emoji combinations.',
  reaction: 'React to messages with these expressive emoji combinations.',
  relationship: 'Relationship-themed emoji combos for friends and family.',
  work: 'Work-appropriate emoji combinations for professional settings.',
  food: 'Food and drink emoji combinations for culinary conversations.',
  travel: 'Travel and vacation emoji combinations for wanderlust.',
  other: "Unique emoji combinations that don't fit other categories.",
};

/**
 * Valid combo categories
 */
const VALID_COMBO_CATEGORIES: EmojiComboCategoryName[] = [
  'humor',
  'flirting',
  'sarcasm',
  'celebration',
  'emotion',
  'reaction',
  'relationship',
  'work',
  'food',
  'travel',
  'other',
];

/**
 * Check if a combo category is valid
 * @param category - Category slug to check
 * @returns True if the category is valid
 */
export function isValidComboCategory(category: string): category is EmojiComboCategoryName {
  return VALID_COMBO_CATEGORIES.includes(category as EmojiComboCategoryName);
}

/**
 * Get the display name for a combo category
 * @param category - Category slug
 * @returns Human-readable category name
 */
export function getComboCategoryDisplayName(category: string): string {
  return (
    COMBO_CATEGORY_DISPLAY_NAMES[category as EmojiComboCategoryName] ||
    category.charAt(0).toUpperCase() + category.slice(1)
  );
}

/**
 * Get the description for a combo category
 * @param category - Category slug
 * @returns Category description
 */
export function getComboCategoryDescription(category: string): string {
  return (
    COMBO_CATEGORY_DESCRIPTIONS[category as EmojiComboCategoryName] ||
    `Explore ${category} emoji combos and their meanings.`
  );
}

/**
 * Combo category info for listing and display
 */
export interface ComboCategoryInfo {
  /** Category slug */
  slug: EmojiComboCategoryName;
  /** Human-readable category name */
  displayName: string;
  /** Category description */
  description: string;
  /** Number of combos in this category */
  comboCount: number;
}

/**
 * Get info for a specific combo category
 * @param category - Category slug
 * @returns Category info or null if invalid
 */
export function getComboCategoryInfo(category: string): ComboCategoryInfo | null {
  if (!isValidComboCategory(category)) {
    return null;
  }

  const combos = getCombosByCategory(category);

  return {
    slug: category,
    displayName: getComboCategoryDisplayName(category),
    description: getComboCategoryDescription(category),
    comboCount: combos.length,
  };
}

/**
 * Get info for all combo categories
 * @returns Array of combo category info, sorted by combo count descending
 */
export function getAllComboCategoryInfo(): ComboCategoryInfo[] {
  const categories = getAllComboCategories();

  return categories
    .map((category) => ({
      slug: category,
      displayName: getComboCategoryDisplayName(category),
      description: getComboCategoryDescription(category),
      comboCount: getCombosByCategory(category).length,
    }))
    .sort((a, b) => b.comboCount - a.comboCount);
}

/**
 * Clear the combo cache (useful for testing)
 */
export function clearComboCache(): void {
  comboCache = null;
}
