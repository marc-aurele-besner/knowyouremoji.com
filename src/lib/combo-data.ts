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
 * Clear the combo cache (useful for testing)
 */
export function clearComboCache(): void {
  comboCache = null;
}
