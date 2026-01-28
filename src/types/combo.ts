/**
 * TypeScript types for emoji combo data
 *
 * Defines the structure for emoji combination content stored as JSON files
 * in Phase 1 (static architecture without database).
 */

import type { EmojiSlug } from './emoji';

// ============================================
// BASIC TYPES
// ============================================

/**
 * URL-safe slug for the combo
 * @example "skull-laughing" or "fire-100"
 */
export type EmojiComboSlug = string;

/**
 * Combo categories for grouping
 */
export type EmojiComboCategoryName =
  | 'humor'
  | 'flirting'
  | 'sarcasm'
  | 'celebration'
  | 'emotion'
  | 'reaction'
  | 'relationship'
  | 'work'
  | 'food'
  | 'travel'
  | 'other';

// ============================================
// MAIN INTERFACES
// ============================================

/**
 * Complete emoji combo data structure
 * Represents the full data stored in combo JSON files
 */
export interface EmojiCombo {
  /** URL-friendly identifier (e.g., "skull-laughing") */
  slug: EmojiComboSlug;
  /** The emoji combination string (e.g., "💀😂") */
  combo: string;
  /** Array of emoji slugs that make up this combo */
  emojis: EmojiSlug[];
  /** Display name of the combo (e.g., "Dead Laughing") */
  name: string;
  /** Longer description of the combo and its usage */
  description: string;
  /** What this combo means in context */
  meaning: string;
  /** Example usages of the combo in messages */
  examples: string[];
  /** Category for grouping combos */
  category: EmojiComboCategoryName;
  /** SEO title for the combo page */
  seoTitle: string;
  /** SEO description for the combo page */
  seoDescription: string;
  /** Optional slugs of related combos */
  relatedCombos?: EmojiComboSlug[];
  /** Optional tags for search and categorization */
  tags?: string[];
  /** Optional popularity score (0-100) */
  popularity?: number;
}

/**
 * Minimal combo data for list/grid views
 */
export interface EmojiComboSummary {
  /** URL-friendly identifier */
  slug: EmojiComboSlug;
  /** The emoji combination string */
  combo: string;
  /** Display name of the combo */
  name: string;
  /** What this combo means */
  meaning: string;
  /** Category for grouping */
  category: EmojiComboCategoryName;
}

// ============================================
// COLLECTION TYPES
// ============================================

/**
 * Extended combo summary with search relevance data
 */
export interface EmojiComboSearchResult extends EmojiComboSummary {
  /** Search relevance score (0-1) */
  score: number;
  /** Which field matched the search query */
  matchedField: 'name' | 'combo' | 'meaning' | 'description' | 'tags' | 'slug';
  /** Optional highlighted match text */
  matchHighlight?: string;
}

/**
 * Named collection of emoji combos
 */
export interface EmojiComboCollection {
  /** Collection name */
  name: string;
  /** Collection description */
  description: string;
  /** Combos in this collection */
  combos: EmojiComboSummary[];
  /** Total count of combos */
  total: number;
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Result of validating combo data
 */
export type EmojiComboValidationResult = {
  /** Whether the combo data is valid */
  valid: boolean;
  /** Array of validation errors */
  errors: string[];
  /** Array of validation warnings */
  warnings: string[];
};

/**
 * Partial combo for draft/creation states
 * Requires minimum fields: combo, slug, name
 */
export type EmojiComboDraft = Partial<EmojiCombo> & Pick<EmojiCombo, 'combo' | 'slug' | 'name'>;
