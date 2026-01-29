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
  ContextType,
  RiskLevel,
  Platform,
  Generation,
  WarningSeverity,
} from '../src/types/emoji';

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
export function loadEmojisFromDirectory(dir: string): Emoji[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
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

/**
 * Main function - runs validation when script is executed directly
 */
export async function main(): Promise<void> {
  const emojisDir = path.join(process.cwd(), 'src', 'data', 'emojis');
  const combosDir = path.join(process.cwd(), 'src', 'data', 'combos');

  console.log('🔍 Validating emoji data files...\n');

  // Load data
  const emojis = loadEmojisFromDirectory(emojisDir);
  const comboSlugs = loadComboSlugs(combosDir);

  console.log(`Found ${emojis.length} emoji files`);
  console.log(`Found ${comboSlugs.size} combo files\n`);

  if (emojis.length === 0) {
    console.log('⚠️  No emoji files found in', emojisDir);
    process.exit(1);
  }

  // Validate
  const result = validateAllEmojis(emojis, comboSlugs);

  // Output results
  if (result.valid) {
    console.log('✅ All emoji files are valid!\n');
    console.log(`Validated ${emojis.length} emoji files`);
    console.log(`Checked ${comboSlugs.size} combo references`);
  } else {
    console.log('❌ Validation failed!\n');
    console.log('Errors:');
    for (const error of result.errors) {
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
