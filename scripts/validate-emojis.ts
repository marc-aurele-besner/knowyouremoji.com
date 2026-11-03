#!/usr/bin/env bun
/**
 * Emoji validation script
 *
 * Validates all emoji JSON files against the TypeScript schema.
 * Run with: bun run scripts/validate-emojis.ts
 */

import fs from 'fs';
import path from 'path';
import type {
  Emoji,
  ContextMeaning,
  PlatformNote,
  GenerationalNote,
  EmojiWarning,
  EmojiValidationResult,
  EmojiLongForm,
  EmojiFaq,
  ConversationExample,
  ContentTier,
  ContextType,
  RiskLevel,
  Platform,
  Generation,
  WarningSeverity,
  ConversationSetting,
} from '../src/types/emoji';
import { findComboBoilerplate } from './combo-content/boilerplate';
import { MISLABELED_EMOJI_SLUGS } from '../src/lib/emoji-aliases';
import type {
  EmojiCombo,
  ComboLongForm,
  ComboFaq,
  ComboConversationExample,
  ComboConversationSetting,
  ComboContentTier,
  EmojiComboValidationResult,
  EmojiComboCategoryName,
  EmojiComboSlug,
} from '../src/types/combo';

// Valid enum values for validation
const VALID_CONTEXT_TYPES: ContextType[] = [
  'LITERAL',
  'SLANG',
  'IRONIC',
  'PASSIVE_AGGRESSIVE',
  'DATING',
  'WORK',
  'RED_FLAG',
];

const VALID_RISK_LEVELS: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH'];

const VALID_PLATFORMS: Platform[] = [
  'IMESSAGE',
  'INSTAGRAM',
  'TIKTOK',
  'WHATSAPP',
  'SLACK',
  'DISCORD',
  'TWITTER',
];

const VALID_GENERATIONS: Generation[] = ['GEN_Z', 'MILLENNIAL', 'GEN_X', 'BOOMER'];

const VALID_SEVERITIES: WarningSeverity[] = ['LOW', 'MEDIUM', 'HIGH'];

const VALID_CONTENT_TIERS: ContentTier[] = ['thin', 'standard', 'deep'];

const VALID_CONVERSATION_SETTINGS: ConversationSetting[] = [
  'dating',
  'friends',
  'work',
  'family',
  'social',
  'other',
];

// Minimum word count for the `longForm.overview` field on deep-tier pages
export const DEEP_OVERVIEW_MIN_WORDS = 120;

// Minimum number of richer conversation examples for deep-tier pages
export const DEEP_CONVERSATION_EXAMPLES_MIN = 3;

// Minimum number of FAQ entries for deep-tier pages (when longForm is present)
export const DEEP_FAQS_MIN = 3;

// Minimum character length per platform note for deep-tier pages
export const DEEP_PLATFORM_NOTE_MIN_CHARS = 40;

// Boilerplate substrings that will fail deep-tier platform note validation.
// Keep intentionally short so we don't over-fit; writers can always add detail.
export const DEEP_BOILERPLATE_PATTERNS: string[] = [
  'commonly used',
  'very common',
  'general purpose',
  'used for various',
  'used in many contexts',
];

// Required emoji fields
const REQUIRED_EMOJI_FIELDS: (keyof Emoji)[] = [
  'unicode',
  'slug',
  'character',
  'name',
  'shortName',
  'category',
  'unicodeVersion',
  'baseMeaning',
  'tldr',
  'contextMeanings',
  'platformNotes',
  'generationalNotes',
  'warnings',
  'relatedCombos',
  'seoTitle',
  'seoDescription',
];

export interface ValidationError {
  file: string;
  field: string;
  message: string;
}

/**
 * Validate a single context meaning object
 */
export function validateContextMeaning(cm: ContextMeaning, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `contextMeanings[${index}]`;

  if (!cm.context || !VALID_CONTEXT_TYPES.includes(cm.context)) {
    errors.push({
      file: '',
      field: prefix,
      message: `Invalid context type: ${cm.context}. Must be one of: ${VALID_CONTEXT_TYPES.join(', ')}`,
    });
  }

  if (!cm.meaning || typeof cm.meaning !== 'string') {
    errors.push({
      file: '',
      field: prefix,
      message: 'Missing or invalid meaning field',
    });
  }

  if (!cm.example || typeof cm.example !== 'string') {
    errors.push({
      file: '',
      field: prefix,
      message: 'Missing or invalid example field',
    });
  }

  if (!cm.riskLevel || !VALID_RISK_LEVELS.includes(cm.riskLevel)) {
    errors.push({
      file: '',
      field: prefix,
      message: `Invalid riskLevel: ${cm.riskLevel}. Must be one of: ${VALID_RISK_LEVELS.join(', ')}`,
    });
  }

  return errors;
}

/**
 * Validate a single platform note object
 */
export function validatePlatformNote(pn: PlatformNote, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `platformNotes[${index}]`;

  if (!pn.platform || !VALID_PLATFORMS.includes(pn.platform)) {
    errors.push({
      file: '',
      field: prefix,
      message: `Invalid platform: ${pn.platform}. Must be one of: ${VALID_PLATFORMS.join(', ')}`,
    });
  }

  if (!pn.note || typeof pn.note !== 'string') {
    errors.push({
      file: '',
      field: prefix,
      message: 'Missing or invalid note field',
    });
  }

  return errors;
}

/**
 * Validate a single generational note object
 */
export function validateGenerationalNote(gn: GenerationalNote, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `generationalNotes[${index}]`;

  if (!gn.generation || !VALID_GENERATIONS.includes(gn.generation)) {
    errors.push({
      file: '',
      field: prefix,
      message: `Invalid generation: ${gn.generation}. Must be one of: ${VALID_GENERATIONS.join(', ')}`,
    });
  }

  if (!gn.note || typeof gn.note !== 'string') {
    errors.push({
      file: '',
      field: prefix,
      message: 'Missing or invalid note field',
    });
  }

  return errors;
}

/**
 * Validate a single warning object
 */
export function validateWarning(warning: EmojiWarning, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `warnings[${index}]`;

  if (!warning.title || typeof warning.title !== 'string') {
    errors.push({
      file: '',
      field: prefix,
      message: 'Missing or invalid title field',
    });
  }

  if (!warning.description || typeof warning.description !== 'string') {
    errors.push({
      file: '',
      field: prefix,
      message: 'Missing or invalid description field',
    });
  }

  if (!warning.severity || !VALID_SEVERITIES.includes(warning.severity)) {
    errors.push({
      file: '',
      field: prefix,
      message: `Invalid severity: ${warning.severity}. Must be one of: ${VALID_SEVERITIES.join(', ')}`,
    });
  }

  return errors;
}

/**
 * Count the whitespace-delimited words in a string.
 */
export function countWords(text: string): number {
  if (typeof text !== 'string') return 0;
  const trimmed = text.trim();
  if (trimmed === '') return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Validate a single FAQ entry
 */
export function validateFaq(faq: EmojiFaq, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `longForm.faqs[${index}]`;

  if (!faq.question || typeof faq.question !== 'string') {
    errors.push({
      file: '',
      field: prefix,
      message: 'Missing or invalid question field',
    });
  }

  if (!faq.answer || typeof faq.answer !== 'string') {
    errors.push({
      file: '',
      field: prefix,
      message: 'Missing or invalid answer field',
    });
  }

  return errors;
}

/**
 * Validate the optional longForm block
 */
export function validateLongForm(longForm: EmojiLongForm): ValidationError[] {
  const errors: ValidationError[] = [];
  const stringFields: (keyof EmojiLongForm)[] = [
    'overview',
    'howPeopleUseIt',
    'whenNotToUse',
    'howToReply',
  ];

  for (const field of stringFields) {
    const value = longForm[field];
    if (value !== undefined && (typeof value !== 'string' || value.trim() === '')) {
      errors.push({
        file: '',
        field: `longForm.${field}`,
        message: `longForm.${field} must be a non-empty string when provided`,
      });
    }
  }

  if (longForm.faqs !== undefined) {
    if (!Array.isArray(longForm.faqs)) {
      errors.push({
        file: '',
        field: 'longForm.faqs',
        message: 'longForm.faqs must be an array',
      });
    } else {
      longForm.faqs.forEach((faq, index) => {
        const faqErrors = validateFaq(faq, index);
        errors.push(...faqErrors);
      });
    }
  }

  return errors;
}

/**
 * Validate a single conversation example
 */
export function validateConversationExample(
  example: ConversationExample,
  index: number
): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `conversationExamples[${index}]`;

  if (!example.setting || !VALID_CONVERSATION_SETTINGS.includes(example.setting)) {
    errors.push({
      file: '',
      field: prefix,
      message: `Invalid setting: ${example.setting}. Must be one of: ${VALID_CONVERSATION_SETTINGS.join(', ')}`,
    });
  }

  if (!example.message || typeof example.message !== 'string') {
    errors.push({
      file: '',
      field: prefix,
      message: 'Missing or invalid message field',
    });
  }

  if (!example.interpretation || typeof example.interpretation !== 'string') {
    errors.push({
      file: '',
      field: prefix,
      message: 'Missing or invalid interpretation field',
    });
  }

  return errors;
}

/**
 * Validate a contentTier value
 */
function validateContentTier(tier: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  if (tier !== undefined && !VALID_CONTENT_TIERS.includes(tier as ContentTier)) {
    errors.push({
      file: '',
      field: 'contentTier',
      message: `Invalid contentTier: ${String(tier)}. Must be one of: ${VALID_CONTENT_TIERS.join(', ')}`,
    });
  }
  return errors;
}

/**
 * Validate a contentUpdatedAt ISO date string
 */
function validateContentUpdatedAt(value: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  if (value === undefined) return errors;
  if (typeof value !== 'string') {
    errors.push({
      file: '',
      field: 'contentUpdatedAt',
      message: 'contentUpdatedAt must be an ISO date string',
    });
    return errors;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    errors.push({
      file: '',
      field: 'contentUpdatedAt',
      message: `contentUpdatedAt must be a valid ISO date string (got "${value}")`,
    });
  }
  return errors;
}

/**
 * Enforce thresholds required when an emoji opts into contentTier: 'deep'.
 *
 * Throws errors (not warnings) so the publishing QA pipeline can gate on them.
 */
export function validateDeepTier(emoji: Emoji): ValidationError[] {
  const errors: ValidationError[] = [];
  const file = emoji.slug || 'unknown';

  const longForm = emoji.longForm ?? {};
  const overview = longForm.overview ?? '';
  const overviewWords = countWords(overview);

  if (overviewWords < DEEP_OVERVIEW_MIN_WORDS) {
    errors.push({
      file,
      field: 'longForm.overview',
      message: `deep-tier requires longForm.overview of at least ${DEEP_OVERVIEW_MIN_WORDS} words (got ${overviewWords})`,
    });
  }

  const examples = Array.isArray(emoji.conversationExamples) ? emoji.conversationExamples : [];
  if (examples.length < DEEP_CONVERSATION_EXAMPLES_MIN) {
    errors.push({
      file,
      field: 'conversationExamples',
      message: `deep-tier requires at least ${DEEP_CONVERSATION_EXAMPLES_MIN} conversationExamples (got ${examples.length})`,
    });
  }

  const faqs = Array.isArray(longForm.faqs) ? longForm.faqs : [];
  if (faqs.length < DEEP_FAQS_MIN) {
    errors.push({
      file,
      field: 'longForm.faqs',
      message: `deep-tier requires at least ${DEEP_FAQS_MIN} longForm.faqs entries (got ${faqs.length})`,
    });
  }

  // Per-platform notes: must be ≥ min chars and not match boilerplate patterns.
  emoji.platformNotes.forEach((note, index) => {
    const trimmed = (note.note ?? '').trim();
    if (trimmed.length < DEEP_PLATFORM_NOTE_MIN_CHARS) {
      errors.push({
        file,
        field: `platformNotes[${index}].note`,
        message: `deep-tier requires platformNotes[${index}].note to be at least ${DEEP_PLATFORM_NOTE_MIN_CHARS} characters (got ${trimmed.length})`,
      });
    }
    const lowered = trimmed.toLowerCase();
    const matchedPattern = DEEP_BOILERPLATE_PATTERNS.find((pattern) => lowered.includes(pattern));
    if (matchedPattern) {
      errors.push({
        file,
        field: `platformNotes[${index}].note`,
        message: `deep-tier platformNotes[${index}].note matches boilerplate pattern "${matchedPattern}"; write an emoji-specific note instead`,
      });
    }
  });

  return errors;
}

/**
 * Validate a single emoji object
 */
export function validateEmoji(emoji: Emoji): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check required fields
  for (const field of REQUIRED_EMOJI_FIELDS) {
    if (emoji[field] === undefined || emoji[field] === null) {
      errors.push({
        file: emoji.slug || 'unknown',
        field,
        message: `Missing required field: ${field}`,
      });
    }
  }

  // Check string fields are not empty
  const stringFields: (keyof Emoji)[] = [
    'unicode',
    'slug',
    'character',
    'name',
    'shortName',
    'category',
    'unicodeVersion',
    'baseMeaning',
    'tldr',
    'seoTitle',
    'seoDescription',
  ];

  for (const field of stringFields) {
    const value = emoji[field];
    if (value !== undefined && value !== null && typeof value === 'string' && value.trim() === '') {
      errors.push({
        file: emoji.slug || 'unknown',
        field,
        message: `Field ${field} cannot be empty`,
      });
    }
  }

  // Validate arrays exist and are arrays
  if (!Array.isArray(emoji.contextMeanings)) {
    errors.push({
      file: emoji.slug || 'unknown',
      field: 'contextMeanings',
      message: 'contextMeanings must be an array',
    });
  } else {
    // Validate each context meaning
    emoji.contextMeanings.forEach((cm, index) => {
      const cmErrors = validateContextMeaning(cm, index);
      cmErrors.forEach((e) => {
        e.file = emoji.slug || 'unknown';
        errors.push(e);
      });
    });
  }

  if (!Array.isArray(emoji.platformNotes)) {
    errors.push({
      file: emoji.slug || 'unknown',
      field: 'platformNotes',
      message: 'platformNotes must be an array',
    });
  } else {
    // Validate each platform note
    emoji.platformNotes.forEach((pn, index) => {
      const pnErrors = validatePlatformNote(pn, index);
      pnErrors.forEach((e) => {
        e.file = emoji.slug || 'unknown';
        errors.push(e);
      });
    });
  }

  if (!Array.isArray(emoji.generationalNotes)) {
    errors.push({
      file: emoji.slug || 'unknown',
      field: 'generationalNotes',
      message: 'generationalNotes must be an array',
    });
  } else {
    // Validate each generational note
    emoji.generationalNotes.forEach((gn, index) => {
      const gnErrors = validateGenerationalNote(gn, index);
      gnErrors.forEach((e) => {
        e.file = emoji.slug || 'unknown';
        errors.push(e);
      });
    });
  }

  if (!Array.isArray(emoji.warnings)) {
    errors.push({
      file: emoji.slug || 'unknown',
      field: 'warnings',
      message: 'warnings must be an array',
    });
  } else {
    // Validate each warning
    emoji.warnings.forEach((w, index) => {
      const wErrors = validateWarning(w, index);
      wErrors.forEach((e) => {
        e.file = emoji.slug || 'unknown';
        errors.push(e);
      });
    });
  }

  if (!Array.isArray(emoji.relatedCombos)) {
    errors.push({
      file: emoji.slug || 'unknown',
      field: 'relatedCombos',
      message: 'relatedCombos must be an array',
    });
  }

  // Optional contentTier (CONTENT-P1-001)
  const tierErrors = validateContentTier(emoji.contentTier);
  tierErrors.forEach((e) => {
    e.file = emoji.slug || 'unknown';
    errors.push(e);
  });

  // Optional contentUpdatedAt (CONTENT-P1-001)
  const updatedAtErrors = validateContentUpdatedAt(emoji.contentUpdatedAt);
  updatedAtErrors.forEach((e) => {
    e.file = emoji.slug || 'unknown';
    errors.push(e);
  });

  // Optional longForm (CONTENT-P1-001)
  if (emoji.longForm !== undefined) {
    if (typeof emoji.longForm !== 'object' || emoji.longForm === null) {
      errors.push({
        file: emoji.slug || 'unknown',
        field: 'longForm',
        message: 'longForm must be an object',
      });
    } else {
      const longFormErrors = validateLongForm(emoji.longForm);
      longFormErrors.forEach((e) => {
        e.file = emoji.slug || 'unknown';
        errors.push(e);
      });
    }
  }

  // Optional conversationExamples (CONTENT-P1-001)
  if (emoji.conversationExamples !== undefined) {
    if (!Array.isArray(emoji.conversationExamples)) {
      errors.push({
        file: emoji.slug || 'unknown',
        field: 'conversationExamples',
        message: 'conversationExamples must be an array',
      });
    } else {
      emoji.conversationExamples.forEach((example, index) => {
        const exampleErrors = validateConversationExample(example, index);
        exampleErrors.forEach((e) => {
          e.file = emoji.slug || 'unknown';
          errors.push(e);
        });
      });
    }
  }

  // If opted into deep tier, enforce the strict thresholds.
  if (emoji.contentTier === 'deep') {
    const deepErrors = validateDeepTier(emoji);
    errors.push(...deepErrors);
  }

  return errors;
}

/**
 * Check for duplicate slugs across all emojis
 */
export function checkDuplicateSlugs(emojis: Emoji[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const slugCounts = new Map<string, number>();

  // Count occurrences
  for (const emoji of emojis) {
    const count = slugCounts.get(emoji.slug) || 0;
    slugCounts.set(emoji.slug, count + 1);
  }

  // Report duplicates
  for (const [slug, count] of slugCounts) {
    if (count > 1) {
      errors.push({
        file: slug,
        field: 'slug',
        message: `Duplicate slug found: "${slug}" appears ${count} times`,
      });
    }
  }

  return errors;
}

/**
 * Check that all referenced combos exist
 */
export function checkComboReferences(
  emojis: Emoji[],
  existingCombos: Set<string>
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const emoji of emojis) {
    if (!Array.isArray(emoji.relatedCombos)) continue;

    for (const comboSlug of emoji.relatedCombos) {
      if (!existingCombos.has(comboSlug)) {
        errors.push({
          file: emoji.slug,
          field: 'relatedCombos',
          message: `Referenced combo "${comboSlug}" does not exist`,
        });
      }
    }
  }

  return errors;
}

/** Variation selectors only pick text or emoji presentation; they do not change the emoji. */
const VARIATION_SELECTORS = new Set([0xfe0e, 0xfe0f]);

/** Code points of a glyph, without variation selectors. */
export function characterCodepoints(character: string): number[] {
  return [...character]
    .map((char) => char.codePointAt(0) as number)
    .filter((codepoint) => !VARIATION_SELECTORS.has(codepoint));
}

/**
 * Code points named by a `unicode` field, without variation selectors.
 * Accepts every spelling the catalog uses: `1F4AF`, `U+1F4AF`,
 * `1F3F4-200D-2620-FE0F`, `U+1F44D-1F3FB`.
 */
export function unicodeFieldCodepoints(unicode: string): number[] | null {
  const parts = unicode
    .trim()
    .split('-')
    .map((part) => part.trim().replace(/^U\+/i, ''));
  if (parts.some((part) => !/^[0-9A-Fa-f]{1,6}$/.test(part))) return null;
  return parts
    .map((part) => parseInt(part, 16))
    .filter((codepoint) => !VARIATION_SELECTORS.has(codepoint));
}

function formatCodepoints(codepoints: number[]): string {
  return codepoints.map((codepoint) => codepoint.toString(16).toUpperCase()).join('-');
}

/**
 * Check that every emoji's `unicode` field encodes its `character`. The
 * page header prints `unicode`, so a mismatch is a wrong codepoint shown to
 * every reader (the bucket page used to print the axe's U+1FA93).
 */
export function checkUnicodeMatchesCharacter(emojis: Emoji[]): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const emoji of emojis) {
    if (typeof emoji.unicode !== 'string' || typeof emoji.character !== 'string') continue;
    const expected = characterCodepoints(emoji.character);
    const stored = unicodeFieldCodepoints(emoji.unicode);
    if (stored === null || stored.join(',') !== expected.join(',')) {
      errors.push({
        file: emoji.slug,
        field: 'unicode',
        message: `"${emoji.unicode}" does not encode ${emoji.character} (expected ${formatCodepoints(expected)})`,
      });
    }
  }

  return errors;
}

/**
 * Check the alias map against the published catalog: every glyph has one
 * page that owns it, and every alias points at that page.
 *
 * @param emojis      The published emoji records.
 * @param aliases     Alias slug → owner slug (`src/data/emoji-aliases.json`).
 * @param mislabeled  Slugs that share a glyph but name a different emoji.
 */
export function checkEmojiAliases(
  emojis: Emoji[],
  aliases: Readonly<Record<string, string>>,
  mislabeled: readonly string[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  // Records without a glyph are reported by `validateEmoji`.
  const withGlyph = emojis.filter((emoji) => typeof emoji.character === 'string');
  const bySlug = new Map(withGlyph.map((emoji) => [emoji.slug, emoji]));
  const glyph = (emoji: Emoji) => characterCodepoints(emoji.character).join(',');

  for (const [alias, owner] of Object.entries(aliases)) {
    const aliasEmoji = bySlug.get(alias);
    const ownerEmoji = bySlug.get(owner);
    if (!aliasEmoji) {
      errors.push({
        file: alias,
        field: 'alias',
        message: `Alias "${alias}" is not a published emoji`,
      });
      continue;
    }
    if (!ownerEmoji) {
      errors.push({
        file: alias,
        field: 'alias',
        message: `Alias owner "${owner}" is not a published emoji`,
      });
      continue;
    }
    if (Object.hasOwn(aliases, owner)) {
      errors.push({
        file: alias,
        field: 'alias',
        message: `Alias owner "${owner}" is itself an alias`,
      });
    }
    if (glyph(aliasEmoji) !== glyph(ownerEmoji)) {
      errors.push({
        file: alias,
        field: 'alias',
        message: `Alias shows ${aliasEmoji.character} but its owner "${owner}" shows ${ownerEmoji.character}`,
      });
    }
  }

  // Every glyph must have exactly one page left that is not an alias.
  const skipped = new Set(mislabeled);
  const owners = new Map<string, string[]>();
  for (const emoji of withGlyph) {
    if (emoji.skinToneBase || skipped.has(emoji.slug) || Object.hasOwn(aliases, emoji.slug))
      continue;
    owners.set(glyph(emoji), [...(owners.get(glyph(emoji)) ?? []), emoji.slug]);
  }
  for (const slugs of owners.values()) {
    if (slugs.length > 1) {
      errors.push({
        file: slugs[0],
        field: 'alias',
        message: `${slugs.length} pages show the same emoji (${slugs.join(', ')}); add all but one to src/data/emoji-aliases.json (bun run generate:emoji-aliases)`,
      });
    }
  }

  return errors;
}

/**
 * Validate all emojis and return the result
 */
export function validateAllEmojis(
  emojis: Emoji[],
  existingCombos: Set<string>
): EmojiValidationResult {
  const allErrors: ValidationError[] = [];
  const warnings: string[] = [];

  // Validate each emoji
  for (const emoji of emojis) {
    const errors = validateEmoji(emoji);
    allErrors.push(...errors);
  }

  // Check for duplicate slugs
  const duplicateErrors = checkDuplicateSlugs(emojis);
  allErrors.push(...duplicateErrors);

  // Check combo references
  const comboErrors = checkComboReferences(emojis, existingCombos);
  allErrors.push(...comboErrors);

  // Format errors as strings
  const errorStrings = allErrors.map((e) => `[${e.file}] ${e.field}: ${e.message}`);

  return {
    valid: allErrors.length === 0,
    errors: errorStrings,
    warnings,
  };
}

/**
 * Load all emoji JSON files from the data directory
 */
export function loadEmojisFromDirectory(
  dir: string,
  options: { publishedOnly?: boolean } = {}
): Emoji[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  // `*-emoji.json` files are not published (see `src/lib/emoji-data.ts`).
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .filter((f) => !options.publishedOnly || !f.endsWith('-emoji.json'));
  const emojis: Emoji[] = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const emoji = JSON.parse(content) as Emoji;
      emojis.push(emoji);
    } catch (error) {
      console.error(`Error loading ${file}:`, error);
    }
  }

  return emojis;
}

/**
 * Load the alias map (`src/data/emoji-aliases.json`); an absent file is an empty map.
 */
export function loadEmojiAliases(file: string): Record<string, string> {
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as Record<string, string>;
}

/**
 * Load all combo slugs from the combos directory
 */
export function loadComboSlugs(dir: string): Set<string> {
  if (!fs.existsSync(dir)) {
    return new Set();
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  const slugs = new Set<string>();

  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const combo = JSON.parse(content);
      if (combo.slug) {
        slugs.add(combo.slug);
      }
    } catch (error) {
      console.error(`Error loading combo ${file}:`, error);
    }
  }

  return slugs;
}

// ============================================
// COMBO VALIDATION (CONTENT-P1-005)
// ============================================

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

const VALID_COMBO_CONTENT_TIERS: ComboContentTier[] = ['thin', 'standard', 'deep'];

const VALID_COMBO_CONVERSATION_SETTINGS: ComboConversationSetting[] = [
  'dating',
  'friends',
  'work',
  'family',
  'social',
  'other',
];

// Minimum word count for `longForm.overview` on deep-tier combos (mirrors emoji rule)
export const COMBO_DEEP_OVERVIEW_MIN_WORDS = 120;

// Minimum number of FAQs for deep-tier combos (when longForm is present)
export const COMBO_DEEP_FAQS_MIN = 3;

// Minimum number of richer conversation examples for deep-tier combos
export const COMBO_DEEP_CONVERSATION_EXAMPLES_MIN = 3;

// Minimum length of combined `description + meaning` for "rich" combos
export const COMBO_RICH_PROSE_MIN_WORDS = 40;

/**
 * Validate the optional longForm block on a combo.
 */
export function validateComboLongForm(longForm: ComboLongForm): ValidationError[] {
  const errors: ValidationError[] = [];
  const stringFields: (keyof ComboLongForm)[] = [
    'overview',
    'howPeopleUseIt',
    'whenNotToUse',
    'howToReply',
  ];

  for (const field of stringFields) {
    const value = longForm[field];
    if (value !== undefined && (typeof value !== 'string' || value.trim() === '')) {
      errors.push({
        file: '',
        field: `longForm.${field}`,
        message: `longForm.${field} must be a non-empty string when provided`,
      });
    }
  }

  if (longForm.faqs !== undefined) {
    if (!Array.isArray(longForm.faqs)) {
      errors.push({
        file: '',
        field: 'longForm.faqs',
        message: 'longForm.faqs must be an array',
      });
    } else {
      longForm.faqs.forEach((faq, index) => {
        const faqErrors = validateComboFaq(faq, index);
        errors.push(...faqErrors);
      });
    }
  }

  return errors;
}

/**
 * Validate a single combo FAQ entry.
 */
export function validateComboFaq(faq: ComboFaq, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `longForm.faqs[${index}]`;

  if (!faq.question || typeof faq.question !== 'string') {
    errors.push({
      file: '',
      field: prefix,
      message: 'Missing or invalid question field',
    });
  }

  if (!faq.answer || typeof faq.answer !== 'string') {
    errors.push({
      file: '',
      field: prefix,
      message: 'Missing or invalid answer field',
    });
  }

  return errors;
}

/**
 * Validate a single combo conversation example.
 */
export function validateComboConversationExample(
  example: ComboConversationExample,
  index: number
): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `conversationExamples[${index}]`;

  if (!example.setting || !VALID_COMBO_CONVERSATION_SETTINGS.includes(example.setting)) {
    errors.push({
      file: '',
      field: prefix,
      message: `Invalid setting: ${example.setting}. Must be one of: ${VALID_COMBO_CONVERSATION_SETTINGS.join(', ')}`,
    });
  }

  if (!example.message || typeof example.message !== 'string') {
    errors.push({
      file: '',
      field: prefix,
      message: 'Missing or invalid message field',
    });
  }

  if (!example.interpretation || typeof example.interpretation !== 'string') {
    errors.push({
      file: '',
      field: prefix,
      message: 'Missing or invalid interpretation field',
    });
  }

  return errors;
}

/**
 * Validate the optional contentTier on a combo.
 */
export function validateComboContentTier(tier: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  if (tier !== undefined && !VALID_COMBO_CONTENT_TIERS.includes(tier as ComboContentTier)) {
    errors.push({
      file: '',
      field: 'contentTier',
      message: `Invalid contentTier: ${String(tier)}. Must be one of: ${VALID_COMBO_CONTENT_TIERS.join(', ')}`,
    });
  }
  return errors;
}

/**
 * Enforce thresholds required when a combo opts into contentTier: 'deep'.
 */
export function validateComboDeepTier(combo: EmojiCombo): ValidationError[] {
  const errors: ValidationError[] = [];
  const file = combo.slug || 'unknown';

  const longForm = combo.longForm ?? {};
  const overview = longForm.overview ?? '';
  const overviewWords = countWords(overview);

  if (overviewWords < COMBO_DEEP_OVERVIEW_MIN_WORDS) {
    errors.push({
      file,
      field: 'longForm.overview',
      message: `deep-tier requires longForm.overview of at least ${COMBO_DEEP_OVERVIEW_MIN_WORDS} words (got ${overviewWords})`,
    });
  }

  const faqs = Array.isArray(longForm.faqs) ? longForm.faqs : [];
  if (faqs.length < COMBO_DEEP_FAQS_MIN) {
    errors.push({
      file,
      field: 'longForm.faqs',
      message: `deep-tier requires at least ${COMBO_DEEP_FAQS_MIN} longForm.faqs entries (got ${faqs.length})`,
    });
  }

  const examples = Array.isArray(combo.conversationExamples) ? combo.conversationExamples : [];
  if (examples.length < COMBO_DEEP_CONVERSATION_EXAMPLES_MIN) {
    errors.push({
      file,
      field: 'conversationExamples',
      message: `deep-tier requires at least ${COMBO_DEEP_CONVERSATION_EXAMPLES_MIN} conversationExamples (got ${examples.length})`,
    });
  }

  return errors;
}

/**
 * Required fields on every combo JSON file.
 */
const REQUIRED_COMBO_FIELDS: (keyof EmojiCombo)[] = [
  'slug',
  'combo',
  'emojis',
  'name',
  'description',
  'meaning',
  'examples',
  'category',
  'seoTitle',
  'seoDescription',
];

/**
 * Validate a single combo JSON object.
 */
export function validateCombo(
  combo: EmojiCombo,
  knownSlugs: Set<EmojiComboSlug>
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const field of REQUIRED_COMBO_FIELDS) {
    if (combo[field] === undefined || combo[field] === null) {
      errors.push({
        file: combo.slug || 'unknown',
        field,
        message: `Missing required field: ${field}`,
      });
    }
  }

  // Thin-tier combos (legacy stubs) only require a slug — grandfathered to keep
  // existing entries that pre-date the rich-prose / deep-tier program.
  if (combo.contentTier === 'thin') {
    return errors.filter(
      (e) =>
        e.field !== 'combo' &&
        e.field !== 'emojis' &&
        e.field !== 'name' &&
        e.field !== 'description' &&
        e.field !== 'meaning' &&
        e.field !== 'examples' &&
        e.field !== 'category' &&
        e.field !== 'seoTitle' &&
        e.field !== 'seoDescription'
    );
  }

  if (typeof combo.slug !== 'string' || combo.slug.trim() === '') {
    errors.push({
      file: String(combo.slug ?? 'unknown'),
      field: 'slug',
      message: 'slug must be a non-empty string',
    });
  }

  if (typeof combo.combo !== 'string' || combo.combo.trim() === '') {
    errors.push({
      file: combo.slug || 'unknown',
      field: 'combo',
      message: 'combo must be a non-empty string',
    });
  }

  if (!Array.isArray(combo.emojis) || combo.emojis.length < 1) {
    errors.push({
      file: combo.slug || 'unknown',
      field: 'emojis',
      message: 'emojis must be a non-empty array of emoji slugs',
    });
  } else if (combo.contentTier === 'deep' && combo.emojis.length < 2) {
    errors.push({
      file: combo.slug || 'unknown',
      field: 'emojis',
      message: 'deep-tier combo must reference at least 2 emojis',
    });
  }

  // Examples are required on deep combos, optional on thin combos (legacy stubs).
  if (combo.contentTier === 'deep') {
    if (!Array.isArray(combo.examples) || combo.examples.length < 3) {
      errors.push({
        file: combo.slug || 'unknown',
        field: 'examples',
        message: 'deep-tier combo requires at least 3 examples',
      });
    }
  } else if (combo.examples !== undefined && !Array.isArray(combo.examples)) {
    errors.push({
      file: combo.slug || 'unknown',
      field: 'examples',
      message: 'examples must be an array when provided',
    });
  }

  if (!combo.category || !VALID_COMBO_CATEGORIES.includes(combo.category)) {
    errors.push({
      file: combo.slug || 'unknown',
      field: 'category',
      message: `Invalid category: ${combo.category}. Must be one of: ${VALID_COMBO_CATEGORIES.join(', ')}`,
    });
  }

  // Rich-prose sanity check on description + meaning.
  // Thin-tier combos are grandfathered with minimal prose; only standard/deep
  // (or unspecified) combos need to meet the rich-prose floor.
  const tier: ComboContentTier | undefined = combo.contentTier as ComboContentTier | undefined;
  if (tier !== 'thin') {
    const prose = `${combo.description ?? ''} ${combo.meaning ?? ''}`.trim();
    const proseWords = countWords(prose);
    if (proseWords < COMBO_RICH_PROSE_MIN_WORDS) {
      errors.push({
        file: combo.slug || 'unknown',
        field: 'description+meaning',
        message: `description + meaning must total at least ${COMBO_RICH_PROSE_MIN_WORDS} words of meaningful prose (got ${proseWords})`,
      });
    }
  }

  // relatedCombos references must point at known slugs when present.
  if (combo.relatedCombos !== undefined) {
    if (!Array.isArray(combo.relatedCombos)) {
      errors.push({
        file: combo.slug || 'unknown',
        field: 'relatedCombos',
        message: 'relatedCombos must be an array when provided',
      });
    } else {
      combo.relatedCombos.forEach((slug, index) => {
        if (typeof slug !== 'string' || !knownSlugs.has(slug)) {
          errors.push({
            file: combo.slug || 'unknown',
            field: `relatedCombos[${index}]`,
            message: `Referenced combo "${slug}" does not exist`,
          });
        }
      });
    }
  }

  // Optional longForm
  if (combo.longForm !== undefined) {
    if (typeof combo.longForm !== 'object' || combo.longForm === null) {
      errors.push({
        file: combo.slug || 'unknown',
        field: 'longForm',
        message: 'longForm must be an object',
      });
    } else {
      const longFormErrors = validateComboLongForm(combo.longForm);
      longFormErrors.forEach((e) => {
        e.file = combo.slug || 'unknown';
        errors.push(e);
      });
    }
  }

  // Optional conversationExamples
  if (combo.conversationExamples !== undefined) {
    if (!Array.isArray(combo.conversationExamples)) {
      errors.push({
        file: combo.slug || 'unknown',
        field: 'conversationExamples',
        message: 'conversationExamples must be an array',
      });
    } else {
      combo.conversationExamples.forEach((example, index) => {
        const exampleErrors = validateComboConversationExample(example, index);
        exampleErrors.forEach((e) => {
          e.file = combo.slug || 'unknown';
          errors.push(e);
        });
      });
    }
  }

  // contentTier + contentUpdatedAt
  const tierErrors = validateComboContentTier(combo.contentTier);
  tierErrors.forEach((e) => {
    e.file = combo.slug || 'unknown';
    errors.push(e);
  });

  const updatedAtErrors = validateContentUpdatedAt(combo.contentUpdatedAt);
  updatedAtErrors.forEach((e) => {
    e.file = combo.slug || 'unknown';
    errors.push(e);
  });

  if (combo.contentTier === 'deep') {
    errors.push(...validateComboDeepTier(combo));
  }

  // Shared template language is rejected on every tier: a combo that repeats
  // a paragraph from another combo is a near-duplicate page whether or not
  // it is indexed.
  errors.push(...validateComboBoilerplate(combo));

  return errors;
}

/**
 * Reject a combo whose prose still carries the shared template language.
 *
 * A batch of 750 combo pages was generated from a category template that
 * pasted the same paragraphs into every file. Each page cleared the word
 * floors on its own, which is how the duplication slipped past review: the
 * catalog read as one page repeated 750 times, and search engines saw the
 * same thing on every URL.
 *
 * The check lives here so the template cannot come back. It runs against the
 * prose a reader actually sees, not the metadata around it.
 */
export function validateComboBoilerplate(combo: EmojiCombo): ValidationError[] {
  const errors: ValidationError[] = [];
  const file = combo.slug || 'unknown';

  const hits = findComboBoilerplate(combo);
  if (hits.length) {
    // The full list can run to twenty phrases, which buries the rest of the
    // validation output. The first few are enough to identify the template.
    const shown = hits.slice(0, 5);
    const more = hits.length - shown.length;
    errors.push({
      file,
      field: 'longForm',
      message:
        'combo copy reuses shared template language: ' +
        shown.map((h) => `"${h}"`).join(', ') +
        (more > 0 ? `, and ${more} more` : '') +
        '. Each combo must be written about its own emoji pair.',
    });
  }

  return errors;
}

/**
 * Validate every combo JSON file.
 */
export function validateAllCombos(combos: EmojiCombo[]): EmojiComboValidationResult {
  const allErrors: ValidationError[] = [];

  // Slug uniqueness
  const slugCounts = new Map<string, number>();
  for (const combo of combos) {
    if (typeof combo.slug !== 'string') continue;
    slugCounts.set(combo.slug, (slugCounts.get(combo.slug) ?? 0) + 1);
  }
  for (const [slug, count] of slugCounts) {
    if (count > 1) {
      allErrors.push({
        file: slug,
        field: 'slug',
        message: `Duplicate combo slug found: "${slug}" appears ${count} times`,
      });
    }
  }

  // Cross-reference set for relatedCombos validation
  const knownSlugs = new Set<string>(slugCounts.keys());

  for (const combo of combos) {
    allErrors.push(...validateCombo(combo, knownSlugs));
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors.map((e) => `[${e.file}] ${e.field}: ${e.message}`),
    warnings: [],
  };
}

/**
 * Load all combo JSON files from the combos directory as full EmojiCombo objects.
 */
export function loadCombosFromDirectory(dir: string): EmojiCombo[] {
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  const combos: EmojiCombo[] = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      combos.push(JSON.parse(content) as EmojiCombo);
    } catch (error) {
      console.error(`Error loading combo ${file}:`, error);
    }
  }

  return combos;
}

/**
 * Main function - runs validation when script is executed directly
 */
export async function main(): Promise<void> {
  const emojisDir = path.join(process.cwd(), 'src', 'data', 'emojis');
  const combosDir = path.join(process.cwd(), 'src', 'data', 'combos');

  console.log('🔍 Validating emoji and combo data files...\n');

  // Load data
  const emojis = loadEmojisFromDirectory(emojisDir);
  const combos = loadCombosFromDirectory(combosDir);
  const comboSlugs = new Set(combos.map((c) => c.slug).filter(Boolean));

  console.log(`Found ${emojis.length} emoji files`);
  console.log(`Found ${combos.length} combo files\n`);

  if (emojis.length === 0) {
    console.log('⚠️  No emoji files found in', emojisDir);
    process.exit(1);
  }

  // Validate emoji files (and combo references in them)
  const emojiResult = validateAllEmojis(emojis, comboSlugs);

  // Validate combo files themselves
  const comboResult = validateAllCombos(combos);

  // Published pages only: the header prints `unicode`, and each glyph must
  // have one page that owns it (issue #482).
  const publishedEmojis = loadEmojisFromDirectory(emojisDir, { publishedOnly: true });
  const aliases = loadEmojiAliases(path.join(process.cwd(), 'src', 'data', 'emoji-aliases.json'));
  const publishedErrors = [
    ...checkUnicodeMatchesCharacter(publishedEmojis),
    ...checkEmojiAliases(publishedEmojis, aliases, MISLABELED_EMOJI_SLUGS),
  ].map((e) => `[${e.file}] ${e.field}: ${e.message}`);

  const totalErrors = [
    ...publishedErrors.map((msg) => `[emoji] ${msg}`),
    ...emojiResult.errors.map((msg) => `[emoji] ${msg}`),
    ...comboResult.errors.map((msg) => `[combo] ${msg}`),
  ];

  // Output results
  if (totalErrors.length === 0) {
    console.log('✅ All emoji and combo files are valid!\n');
    console.log(`Validated ${emojis.length} emoji files`);
    console.log(`Validated ${combos.length} combo files`);
    const deepCombos = combos.filter((c) => c.contentTier === 'deep').length;
    console.log(`  • ${deepCombos} combo(s) opted into contentTier: 'deep'`);
  } else {
    console.log('❌ Validation failed!\n');
    console.log('Errors:');
    for (const error of totalErrors) {
      console.log(`  • ${error}`);
    }
    process.exit(1);
  }
}

/**
 * Check if this module is being run directly
 */
export function isRunningDirectly(): boolean {
  return import.meta.url === `file://${process.argv[1]}`;
}

/**
 * Handle errors from running main
 */
export function handleMainError(error: unknown): void {
  console.error('Validation script failed:', error);
  process.exit(1);
}

// Run main function if this script is executed directly
if (isRunningDirectly()) {
  main().catch(handleMainError);
}
