/**
 * TypeScript types for emoji data
 *
 * Defines the structure for emoji content stored as JSON files
 * in Phase 1 (static architecture without database).
 */

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
