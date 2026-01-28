/**
 * TypeScript types for emoji data
 *
 * Defines the structure for emoji content stored as JSON files
 * in Phase 1 (static architecture without database).
 */

// ============================================
// BASIC TYPES
// ============================================

/**
 * Unicode codepoint in format "XXXX" or with U+ prefix
 * @example "1F480" or "U+1F480"
 */
export type EmojiCodepoint = string;

/**
 * URL-safe slug for the emoji
 * @example "skull" or "woman-technologist"
 */
export type EmojiSlug = string;

/**
 * Main emoji categories
 */
export type EmojiCategoryName =
  | 'faces'
  | 'people'
  | 'animals'
  | 'food'
  | 'travel'
  | 'activities'
  | 'objects'
  | 'symbols'
  | 'flags';

/**
 * Display names for categories
 */
export type EmojiCategoryDisplayName =
  | 'Smileys & Faces'
  | 'People & Body'
  | 'Animals & Nature'
  | 'Food & Drink'
  | 'Travel & Places'
  | 'Activities'
  | 'Objects'
  | 'Symbols'
  | 'Flags';

/**
 * Unicode version when emoji was added
 */
export type UnicodeVersion =
  | '1.0'
  | '1.1'
  | '3.0'
  | '3.2'
  | '4.0'
  | '4.1'
  | '5.0'
  | '5.1'
  | '5.2'
  | '6.0'
  | '6.1'
  | '7.0'
  | '8.0'
  | '9.0'
  | '10.0'
  | '11.0'
  | '12.0'
  | '12.1'
  | '13.0'
  | '13.1'
  | '14.0'
  | '15.0'
  | '15.1'
  | '16.0';

// ============================================
// CONTEXT TYPES
// ============================================

/**
 * Context types for emoji meanings
 */
export type ContextType =
  | 'LITERAL'
  | 'SLANG'
  | 'IRONIC'
  | 'PASSIVE_AGGRESSIVE'
  | 'DATING'
  | 'WORK'
  | 'RED_FLAG';

/**
 * Risk level for context meanings
 */
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * Supported messaging platforms
 */
export type Platform =
  | 'IMESSAGE'
  | 'INSTAGRAM'
  | 'TIKTOK'
  | 'WHATSAPP'
  | 'SLACK'
  | 'DISCORD'
  | 'TWITTER';

/**
 * Generational categories
 */
export type Generation = 'GEN_Z' | 'MILLENNIAL' | 'GEN_X' | 'BOOMER';

/**
 * Warning severity level
 */
export type WarningSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * Relationship context for interpreter tool
 * Helps AI provide more accurate interpretations based on relationship
 */
export type RelationshipContext =
  | 'ROMANTIC_PARTNER'
  | 'FRIEND'
  | 'FAMILY'
  | 'COWORKER'
  | 'ACQUAINTANCE'
  | 'STRANGER';

/**
 * Context-specific meaning for an emoji
 */
export interface ContextMeaning {
  /** Type of context (slang, ironic, etc.) */
  context: ContextType;
  /** What the emoji means in this context */
  meaning: string;
  /** Example usage of the emoji in this context */
  example: string;
  /** Risk level of misinterpretation */
  riskLevel: RiskLevel;
}

/**
 * Platform-specific note for emoji usage
 */
export interface PlatformNote {
  /** Platform where this note applies */
  platform: Platform;
  /** Note about usage on this platform */
  note: string;
}

/**
 * Generational note for emoji interpretation
 */
export interface GenerationalNote {
  /** Generation this note applies to */
  generation: Generation;
  /** Note about how this generation interprets the emoji */
  note: string;
}

/**
 * Warning about potential emoji misuse or misinterpretation
 */
export interface EmojiWarning {
  /** Brief title for the warning */
  title: string;
  /** Detailed description of the warning */
  description: string;
  /** Severity level of the warning */
  severity: WarningSeverity;
}

/**
 * Complete emoji data structure
 */
export interface Emoji {
  /** Unicode code point (e.g., "1F480") */
  unicode: string;
  /** URL-friendly identifier (e.g., "skull") */
  slug: string;
  /** The actual emoji character (e.g., "💀") */
  character: string;
  /** Full name of the emoji */
  name: string;
  /** Short name for quick reference */
  shortName: string;
  /** Main category */
  category: string;
  /** Optional subcategory */
  subcategory?: string;
  /** Unicode version when emoji was introduced */
  unicodeVersion: string;
  /** Base/literal meaning according to Unicode */
  baseMeaning: string;
  /** Quick summary of real-world usage */
  tldr: string;
  /** Array of context-specific meanings */
  contextMeanings: ContextMeaning[];
  /** Platform-specific usage notes */
  platformNotes: PlatformNote[];
  /** Generational interpretation notes */
  generationalNotes: GenerationalNote[];
  /** Warnings about potential misuse */
  warnings: EmojiWarning[];
  /** Slugs of related emoji combinations */
  relatedCombos: string[];
  /** SEO title for the emoji page */
  seoTitle: string;
  /** SEO description for the emoji page */
  seoDescription: string;
}

/**
 * Minimal emoji data for list/grid views
 */
export interface EmojiSummary {
  /** URL-friendly identifier */
  slug: string;
  /** The actual emoji character */
  character: string;
  /** Full name of the emoji */
  name: string;
  /** Main category */
  category: string;
  /** Quick summary of real-world usage */
  tldr: string;
}

// ============================================
// COLLECTION TYPES
// ============================================

/**
 * Extended emoji summary with search relevance data
 */
export interface EmojiSearchResult extends EmojiSummary {
  /** Search relevance score (0-1) */
  score: number;
  /** Which field matched the search query */
  matchedField: 'name' | 'shortName' | 'category' | 'tldr' | 'character' | 'slug';
  /** Optional highlighted match text */
  matchHighlight?: string;
}

/**
 * Named collection of emojis
 */
export interface EmojiCollection {
  /** Collection name */
  name: string;
  /** Collection description */
  description: string;
  /** Emojis in this collection */
  emojis: EmojiSummary[];
  /** Total count of emojis */
  total: number;
}

/**
 * Category with its emojis for category pages
 */
export interface EmojiCategoryWithEmojis {
  /** Category slug */
  slug: EmojiCategoryName;
  /** Human-readable category name */
  displayName: EmojiCategoryDisplayName;
  /** Category description */
  description: string;
  /** Subcategories within this category */
  subcategories: string[];
  /** Total number of emojis in category */
  emojiCount: number;
  /** Featured/popular emojis in this category */
  featuredEmojis: EmojiSummary[];
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Result of validating emoji data
 */
export type EmojiValidationResult = {
  /** Whether the emoji data is valid */
  valid: boolean;
  /** Array of validation errors */
  errors: string[];
  /** Array of validation warnings */
  warnings: string[];
};

/**
 * Partial emoji for draft/creation states
 * Requires minimum fields: character, slug, name
 */
export type EmojiDraft = Partial<Emoji> & Pick<Emoji, 'character' | 'slug' | 'name'>;
