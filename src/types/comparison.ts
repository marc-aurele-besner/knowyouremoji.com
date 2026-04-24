/**
 * TypeScript types for emoji comparison data
 */

import type { EmojiSlug } from './emoji';

// ============================================
// COMPARISON TYPES
// ============================================

/**
 * A single comparison point between two emojis
 */
export interface ComparisonPoint {
  /** The aspect being compared (e.g., "Meaning", "Usage") */
  aspect: string;
  /** Description of how emoji1 compares */
  emoji1Note: string;
  /** Description of how emoji2 compares */
  emoji2Note: string;
}

/**
 * Emoji comparison data structure
 * Represents a curated comparison between two emojis
 */
export interface EmojiComparison {
  /** URL-friendly slug for the comparison */
  slug: string;
  /** Slug of the first emoji */
  emoji1Slug: EmojiSlug;
  /** Slug of the second emoji */
  emoji2Slug: EmojiSlug;
  /** SEO title for the comparison page */
  seoTitle: string;
  /** SEO description for the comparison page */
  seoDescription: string;
  /** Points of comparison between the two emojis */
  comparisonPoints: ComparisonPoint[];
}

/**
 * Minimal comparison summary for listing
 */
export interface EmojiComparisonSummary {
  slug: string;
  emoji1Slug: EmojiSlug;
  emoji2Slug: string;
  emoji1Character: string;
  emoji2Character: string;
  emoji1Name: string;
  emoji2Name: string;
}

/**
 * Result of validating comparison data
 */
export type EmojiComparisonValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};
