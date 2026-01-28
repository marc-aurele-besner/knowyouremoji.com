/**
 * Emoji data loader utility
 *
 * Provides functions to load and query emoji data from static JSON files.
 * Used in Phase 1 (static architecture without database).
 */

import type { Emoji, EmojiSummary } from '@/types/emoji';

// Import emoji JSON files at build time
// Note: Using Node.js fs for SSG/SSR context
import fs from 'fs';
import path from 'path';

// Cache for loaded emojis
let emojiCache: Emoji[] | null = null;

/**
 * Get the path to the emojis data directory
 */
function getEmojisDir(): string {
  return path.join(process.cwd(), 'src', 'data', 'emojis');
}

/**
 * Load all emoji data from JSON files
 * Results are cached after first load
 */
function loadEmojis(): Emoji[] {
  if (emojiCache !== null) {
    return emojiCache;
  }

  const emojisDir = getEmojisDir();

  // Check if directory exists
  if (!fs.existsSync(emojisDir)) {
    emojiCache = [];
    return emojiCache;
  }

  const files = fs.readdirSync(emojisDir).filter((file) => file.endsWith('.json'));

  emojiCache = files.map((file) => {
    const filePath = path.join(emojisDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as Emoji;
  });

  return emojiCache;
}

/**
 * Get all emojis
 * @returns Array of all emoji data
 */
export function getAllEmojis(): Emoji[] {
  return loadEmojis();
}

/**
 * Get an emoji by its slug
 * @param slug - URL-friendly identifier for the emoji
 * @returns Emoji data or undefined if not found
 */
export function getEmojiBySlug(slug: string): Emoji | undefined {
  return loadEmojis().find((emoji) => emoji.slug === slug);
}

/**
 * Get all emojis in a specific category
 * @param category - Category to filter by
 * @returns Array of emojis in the category
 */
export function getEmojisByCategory(category: string): Emoji[] {
  return loadEmojis().filter((emoji) => emoji.category === category);
}

/**
 * Get all unique categories from loaded emojis
 * @returns Array of unique category names
 */
export function getAllCategories(): string[] {
  const categories = loadEmojis().map((emoji) => emoji.category);
  return [...new Set(categories)];
}

/**
 * Search emojis by name, character, or short name
 * @param query - Search query string
 * @returns Array of matching emojis
 */
export function searchEmojis(query: string): Emoji[] {
  const normalizedQuery = query.toLowerCase();
  return loadEmojis().filter((emoji) => {
    return (
      emoji.name.toLowerCase().includes(normalizedQuery) ||
      emoji.shortName.toLowerCase().includes(normalizedQuery) ||
      emoji.character.includes(query) ||
      emoji.slug.toLowerCase().includes(normalizedQuery)
    );
  });
}

/**
 * Get the total count of emojis
 * @returns Number of emojis loaded
 */
export function getEmojiCount(): number {
  return loadEmojis().length;
}

/**
 * Get emoji summaries for list/grid display
 * @returns Array of emoji summaries
 */
export function getEmojiSummaries(): EmojiSummary[] {
  return loadEmojis().map((emoji) => ({
    slug: emoji.slug,
    character: emoji.character,
    name: emoji.name,
    category: emoji.category,
    tldr: emoji.tldr,
  }));
}

/**
 * Get all emoji slugs for static path generation
 * @returns Array of all emoji slugs
 */
export function getAllEmojiSlugs(): string[] {
  return loadEmojis().map((emoji) => emoji.slug);
}

/**
 * Get related emojis for a given emoji (same category, excluding the current emoji)
 * @param slug - Slug of the current emoji
 * @param limit - Maximum number of related emojis to return (default: 6)
 * @returns Array of related emoji summaries
 */
export function getRelatedEmojis(slug: string, limit: number = 6): EmojiSummary[] {
  const currentEmoji = getEmojiBySlug(slug);
  if (!currentEmoji) {
    return [];
  }

  const sameCategory = loadEmojis().filter(
    (emoji) => emoji.category === currentEmoji.category && emoji.slug !== slug
  );

  return sameCategory.slice(0, limit).map((emoji) => ({
    slug: emoji.slug,
    character: emoji.character,
    name: emoji.name,
    category: emoji.category,
    tldr: emoji.tldr,
  }));
}

/**
 * Clear the emoji cache (useful for testing)
 */
export function clearEmojiCache(): void {
  emojiCache = null;
}

// ============================================
// CATEGORY UTILITIES
// ============================================

/**
 * Valid emoji categories
 */
const VALID_CATEGORIES = [
  'faces',
  'people',
  'animals',
  'food',
  'travel',
  'activities',
  'objects',
  'symbols',
  'flags',
] as const;

/**
 * Category display names mapping
 */
const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  faces: 'Smileys & Faces',
  people: 'People & Body',
  animals: 'Animals & Nature',
  food: 'Food & Drink',
  travel: 'Travel & Places',
  activities: 'Activities',
  objects: 'Objects',
  symbols: 'Symbols',
  flags: 'Flags',
};

/**
 * Category descriptions mapping
 */
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  faces: 'Explore smileys, face expressions, and emotional emojis with their real-world meanings.',
  people:
    'Discover people, body parts, and gesture emojis and what they really mean in different contexts.',
  animals:
    'Learn about animal and nature emojis and their hidden meanings in modern communication.',
  food: 'Understand food and drink emojis beyond their literal meaning.',
  travel: 'Explore travel and places emojis and how they are used in everyday texting.',
  activities: 'Discover activities and sports emojis and their contextual meanings.',
  objects: 'Learn about object emojis and what they symbolize in different situations.',
  symbols: 'Understand symbol emojis and their significance in digital communication.',
  flags: 'Explore flag emojis and their usage in modern messaging.',
};

/**
 * Check if a category is valid
 * @param category - Category slug to check
 * @returns True if the category is valid
 */
export function isValidCategory(category: string): boolean {
  return VALID_CATEGORIES.includes(category as (typeof VALID_CATEGORIES)[number]);
}

/**
 * Get the display name for a category
 * @param category - Category slug
 * @returns Human-readable category name
 */
export function getCategoryDisplayName(category: string): string {
  return CATEGORY_DISPLAY_NAMES[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

/**
 * Get the description for a category
 * @param category - Category slug
 * @returns Category description
 */
export function getCategoryDescription(category: string): string {
  return (
    CATEGORY_DESCRIPTIONS[category] || `Explore ${category} emojis and their meanings in context.`
  );
}

/**
 * Category info for listing and display
 */
export interface CategoryInfo {
  /** Category slug */
  slug: string;
  /** Human-readable category name */
  displayName: string;
  /** Category description */
  description: string;
  /** Number of emojis in this category */
  emojiCount: number;
}

/**
 * Get info for a specific category
 * @param category - Category slug
 * @returns Category info or null if invalid
 */
export function getCategoryInfo(category: string): CategoryInfo | null {
  if (!isValidCategory(category)) {
    return null;
  }

  const emojis = getEmojisByCategory(category);

  return {
    slug: category,
    displayName: getCategoryDisplayName(category),
    description: getCategoryDescription(category),
    emojiCount: emojis.length,
  };
}

/**
 * Get info for all categories that have emojis
 * @returns Array of category info, sorted by emoji count descending
 */
export function getAllCategoryInfo(): CategoryInfo[] {
  const categories = getAllCategories();

  return categories
    .map((category) => ({
      slug: category,
      displayName: getCategoryDisplayName(category),
      description: getCategoryDescription(category),
      emojiCount: getEmojisByCategory(category).length,
    }))
    .sort((a, b) => b.emojiCount - a.emojiCount);
}

/**
 * Get emoji summaries for a specific category
 * @param category - Category slug
 * @returns Array of emoji summaries in the category
 */
export function getEmojiSummariesByCategory(category: string): EmojiSummary[] {
  return getEmojisByCategory(category).map((emoji) => ({
    slug: emoji.slug,
    character: emoji.character,
    name: emoji.name,
    category: emoji.category,
    tldr: emoji.tldr,
  }));
}
