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

// ============================================
// PLATFORM UTILITIES
// ============================================

import type { Platform } from '@/types/emoji';

/**
 * Platform display names mapping
 */
const PLATFORM_DISPLAY_NAMES: Record<Platform, string> = {
  IMESSAGE: 'iMessage',
  INSTAGRAM: 'Instagram',
  TIKTOK: 'TikTok',
  WHATSAPP: 'WhatsApp',
  SLACK: 'Slack',
  DISCORD: 'Discord',
  TWITTER: 'Twitter/X',
};

/**
 * Platform descriptions mapping
 */
const PLATFORM_DESCRIPTIONS: Record<Platform, string> = {
  IMESSAGE:
    'Discover how emojis are interpreted differently on Apple iMessage. Learn the platform-specific meanings and usage.',
  INSTAGRAM:
    'Discover how emojis are interpreted on Instagram. Learn the platform-specific meanings and usage for social media.',
  TIKTOK:
    'Discover how emojis are interpreted on TikTok. Learn the platform-specific meanings and usage for the viral platform.',
  WHATSAPP:
    'Discover how emojis are interpreted on WhatsApp. Learn the platform-specific meanings and usage.',
  SLACK:
    'Discover how emojis are interpreted on Slack. Learn the platform-specific meanings and usage for workplace communication.',
  DISCORD:
    'Discover how emojis are interpreted on Discord. Learn the platform-specific meanings and usage for servers and groups.',
  TWITTER:
    'Discover how emojis are interpreted on Twitter/X. Learn the platform-specific meanings and usage for social media.',
};

/**
 * All supported platforms
 */
const ALL_PLATFORMS: Platform[] = [
  'IMESSAGE',
  'INSTAGRAM',
  'TIKTOK',
  'WHATSAPP',
  'SLACK',
  'DISCORD',
  'TWITTER',
];

/**
 * Get all platforms
 * @returns Array of all platform names
 */
export function getAllPlatforms(): Platform[] {
  return ALL_PLATFORMS;
}

/**
 * Get the display name for a platform
 * @param platform - Platform slug
 * @returns Human-readable platform name
 */
export function getPlatformDisplayName(platform: string): string {
  return PLATFORM_DISPLAY_NAMES[platform as Platform] || platform;
}

/**
 * Get the description for a platform
 * @param platform - Platform slug
 * @returns Platform description
 */
export function getPlatformDescription(platform: string): string {
  return (
    PLATFORM_DESCRIPTIONS[platform as Platform] ||
    `Discover how emojis are interpreted on ${platform}.`
  );
}

/**
 * Get emojis that have notable notes for a specific platform
 * @param platform - Platform to filter by
 * @returns Array of emojis with platform notes
 */
export function getEmojisWithPlatformNotes(platform: Platform): Emoji[] {
  return loadEmojis().filter((emoji) =>
    emoji.platformNotes.some((note) => note.platform === platform)
  );
}

/**
 * Get emoji summaries for a specific platform
 * @param platform - Platform to filter by
 * @returns Array of emoji summaries with platform notes
 */
export function getEmojiSummariesByPlatform(platform: Platform): EmojiSummary[] {
  return getEmojisWithPlatformNotes(platform).map((emoji) => ({
    slug: emoji.slug,
    character: emoji.character,
    name: emoji.name,
    category: emoji.category,
    tldr: emoji.tldr,
  }));
}

/**
 * Platform info for listing and display
 */
export interface PlatformInfo {
  /** Platform slug */
  slug: Platform;
  /** Human-readable platform name */
  displayName: string;
  /** Platform description */
  description: string;
  /** Number of emojis with notes for this platform */
  emojiCount: number;
}

/**
 * Get info for a specific platform
 * @param platform - Platform slug
 * @returns Platform info
 */
export function getPlatformInfo(platform: Platform): PlatformInfo {
  return {
    slug: platform,
    displayName: getPlatformDisplayName(platform),
    description: getPlatformDescription(platform),
    emojiCount: getEmojisWithPlatformNotes(platform).length,
  };
}

/**
 * Get info for all platforms
 * @returns Array of platform info, sorted by emoji count descending
 */
export function getAllPlatformInfo(): PlatformInfo[] {
  return getAllPlatforms()
    .map((platform) => getPlatformInfo(platform))
    .sort((a, b) => b.emojiCount - a.emojiCount);
}

// ============================================
// GENERATION UTILITIES
// ============================================

import type { Generation } from '@/types/emoji';

/**
 * Generation display names mapping
 */
const GENERATION_DISPLAY_NAMES: Record<Generation, string> = {
  GEN_Z: 'Gen Z',
  MILLENNIAL: 'Millennial',
  GEN_X: 'Gen X',
  BOOMER: 'Boomer',
};

/**
 * Generation descriptions mapping
 */
const GENERATION_DESCRIPTIONS: Record<Generation, string> = {
  GEN_Z:
    'Learn how Gen Z interprets emojis. From skull means dying to fire means fire, Gen Z emoji meanings are unique.',
  MILLENNIAL:
    'Learn how Millennials interpret emojis. This generation bridges traditional and modern emoji usage.',
  GEN_X:
    'Learn how Gen X interprets emojis. This generation has its own takes on emoji meaning and usage.',
  BOOMER:
    'Learn how Boomers interpret emojis. Understanding generational differences in emoji interpretation.',
};

/**
 * All supported generations
 */
const ALL_GENERATIONS: Generation[] = ['GEN_Z', 'MILLENNIAL', 'GEN_X', 'BOOMER'];

/**
 * Get all generations
 * @returns Array of all generation names
 */
export function getAllGenerations(): Generation[] {
  return ALL_GENERATIONS;
}

/**
 * Get the display name for a generation
 * @param generation - Generation slug
 * @returns Human-readable generation name
 */
export function getGenerationDisplayName(generation: string): string {
  return GENERATION_DISPLAY_NAMES[generation as Generation] || generation;
}

/**
 * Get the description for a generation
 * @param generation - Generation slug
 * @returns Generation description
 */
export function getGenerationDescription(generation: string): string {
  return (
    GENERATION_DESCRIPTIONS[generation as Generation] ||
    `Learn how ${generation} interprets emojis.`
  );
}

/**
 * Get emojis that have notable notes for a specific generation
 * @param generation - Generation to filter by
 * @returns Array of emojis with generational notes
 */
export function getEmojisWithGenerationNotes(generation: Generation): Emoji[] {
  return loadEmojis().filter((emoji) =>
    emoji.generationalNotes.some((note) => note.generation === generation)
  );
}

/**
 * Get emoji summaries for a specific generation
 * @param generation - Generation to filter by
 * @returns Array of emoji summaries with generational notes
 */
export function getEmojiSummariesByGeneration(generation: Generation): EmojiSummary[] {
  return getEmojisWithGenerationNotes(generation).map((emoji) => ({
    slug: emoji.slug,
    character: emoji.character,
    name: emoji.name,
    category: emoji.category,
    tldr: emoji.tldr,
  }));
}

/**
 * Generation info for listing and display
 */
export interface GenerationInfo {
  /** Generation slug */
  slug: Generation;
  /** Human-readable generation name */
  displayName: string;
  /** Generation description */
  description: string;
  /** Number of emojis with notes for this generation */
  emojiCount: number;
}

/**
 * Get info for a specific generation
 * @param generation - Generation slug
 * @returns Generation info
 */
export function getGenerationInfo(generation: Generation): GenerationInfo {
  return {
    slug: generation,
    displayName: getGenerationDisplayName(generation),
    description: getGenerationDescription(generation),
    emojiCount: getEmojisWithGenerationNotes(generation).length,
  };
}

/**
 * Get info for all generations
 * @returns Array of generation info, sorted by emoji count descending
 */
export function getAllGenerationInfo(): GenerationInfo[] {
  return getAllGenerations()
    .map((generation) => getGenerationInfo(generation))
    .sort((a, b) => b.emojiCount - a.emojiCount);
}

// ============================================
// CONTEXT UTILITIES
// ============================================

import type { ContextType } from '@/types/emoji';

/**
 * Context display names mapping
 */
const CONTEXT_DISPLAY_NAMES: Record<ContextType, string> = {
  LITERAL: 'Literal',
  SLANG: 'Slang',
  IRONIC: 'Ironic',
  PASSIVE_AGGRESSIVE: 'Passive-Aggressive',
  DATING: 'Dating',
  WORK: 'Work',
  RED_FLAG: 'Red Flag',
};

/**
 * Context descriptions mapping
 */
const CONTEXT_DESCRIPTIONS: Record<ContextType, string> = {
  LITERAL: 'The base Unicode meaning of emojis before slang and modern interpretation.',
  SLANG: 'Modern slang meanings for emojis that differ from their original intent.',
  IRONIC: 'Ironic or sarcastic emoji usage where the meaning is opposite to literal.',
  PASSIVE_AGGRESSIVE: 'Passive-aggressive emoji usage that subtly conveys negative sentiment.',
  DATING: 'Dating and flirtatious contexts where emojis take on romantic meanings.',
  WORK: 'Work-appropriate emoji usage that is safe for professional settings.',
  RED_FLAG: 'Warning about emoji misuse that can signal problematic behavior.',
};

/**
 * Context types that make sense as pages (excluding LITERAL which is the default)
 */
const PAGEABLE_CONTEXTS: ContextType[] = [
  'SLANG',
  'DATING',
  'WORK',
  'IRONIC',
  'PASSIVE_AGGRESSIVE',
  'RED_FLAG',
];

/**
 * Get all context types that can have dedicated pages
 * @returns Array of context type names
 */
export function getPageableContextTypes(): ContextType[] {
  return PAGEABLE_CONTEXTS;
}

/**
 * Get all context types
 * @returns Array of all context type names
 */
export function getAllContextTypes(): ContextType[] {
  return Object.keys(CONTEXT_DISPLAY_NAMES) as ContextType[];
}

/**
 * Get the display name for a context
 * @param context - Context slug
 * @returns Human-readable context name
 */
export function getContextDisplayName(context: string): string {
  return CONTEXT_DISPLAY_NAMES[context as ContextType] || context;
}

/**
 * Get the description for a context
 * @param context - Context slug
 * @returns Context description
 */
export function getContextDescription(context: string): string {
  return (
    CONTEXT_DESCRIPTIONS[context as ContextType] ||
    `Explore emojis with ${context} context meanings.`
  );
}

/**
 * Get emojis that have notable meanings for a specific context
 * @param context - Context to filter by
 * @returns Array of emojis with context meanings
 */
export function getEmojisByContext(context: ContextType): Emoji[] {
  return loadEmojis().filter((emoji) =>
    emoji.contextMeanings.some((meaning) => meaning.context === context)
  );
}

/**
 * Get emoji summaries for a specific context
 * @param context - Context to filter by
 * @returns Array of emoji summaries with context meanings
 */
export function getEmojiSummariesByContext(context: ContextType): EmojiSummary[] {
  return getEmojisByContext(context).map((emoji) => ({
    slug: emoji.slug,
    character: emoji.character,
    name: emoji.name,
    category: emoji.category,
    tldr: emoji.tldr,
  }));
}

/**
 * Context info for listing and display
 */
export interface ContextInfo {
  /** Context slug */
  slug: ContextType;
  /** Human-readable context name */
  displayName: string;
  /** Context description */
  description: string;
  /** Number of emojis with this context */
  emojiCount: number;
}

/**
 * Get info for a specific context
 * @param context - Context slug
 * @returns Context info
 */
export function getContextInfo(context: ContextType): ContextInfo {
  return {
    slug: context,
    displayName: getContextDisplayName(context),
    description: getContextDescription(context),
    emojiCount: getEmojisByContext(context).length,
  };
}

/**
 * Get info for all pageable contexts
 * @returns Array of context info, sorted by emoji count descending
 */
export function getAllContextInfo(): ContextInfo[] {
  return getPageableContextTypes()
    .map((context) => getContextInfo(context))
    .sort((a, b) => b.emojiCount - a.emojiCount);
}
