/**
 * Interpreter Service for KnowYourEmoji
 *
 * This module provides the core business logic for interpreting emoji-containing
 * messages using OpenAI. It handles:
 * - Emoji extraction with position tracking
 * - Context-aware prompt building
 * - OpenAI API calls and response parsing
 * - Metric calculation
 * - Red flag identification
 * - Result formatting
 */

import {
  getOpenAIClient,
  buildInterpretationPrompt,
  INTERPRETATION_SYSTEM_PROMPT,
  OPENAI_MODEL,
  interpretationResponseSchema,
  OpenAIError,
  type InterpretationResponse,
} from './openai';
import { getAllEmojis } from './emoji-data';
import {
  cacheGet,
  cacheSet,
  getCacheKey,
  CACHE_PREFIXES,
  DEFAULT_TTL,
  hashInterpretationRequest,
} from './cache';
import type {
  InterpretRequest,
  InterpretationResult,
  DetectedEmoji,
  RedFlag,
  InterpretationMetrics,
} from '@/types';

// ============================================
// CONSTANTS
// ============================================

/**
 * Regular expression to detect emoji characters
 * Matches most Unicode emoji including:
 * - Basic emoji (😀)
 * - Emoji with modifiers (👍🏻)
 * - Emoji sequences (👨‍👩‍👧‍👦)
 */
const EMOJI_REGEX =
  /[\p{Emoji_Presentation}\p{Extended_Pictographic}](\u200d[\p{Emoji_Presentation}\p{Extended_Pictographic}])*/gu;

// ============================================
// TYPES
// ============================================

/**
 * Extracted emoji with position information
 */
export interface ExtractedEmoji {
  /** The emoji character */
  character: string;
  /** Index in the original message */
  index: number;
}

// ============================================
// EMOJI EXTRACTION
// ============================================

/**
 * Extract emojis from a message with their positions
 * @param message - The message to extract emojis from
 * @returns Array of extracted emojis with positions
 */
export function extractEmojisWithPositions(message: string): ExtractedEmoji[] {
  const emojis: ExtractedEmoji[] = [];
  let match: RegExpExecArray | null;

  // Reset regex lastIndex
  EMOJI_REGEX.lastIndex = 0;

  while ((match = EMOJI_REGEX.exec(message)) !== null) {
    emojis.push({
      character: match[0],
      index: match.index,
    });
  }

  return emojis;
}

// ============================================
// EMOJI SLUG LOOKUP
// ============================================

// Cache for emoji character to slug mapping
let emojiSlugCache: Map<string, string> | null = null;

/**
 * Build the emoji slug cache from loaded emoji data
 */
function buildEmojiSlugCache(): Map<string, string> {
  if (emojiSlugCache !== null) {
    return emojiSlugCache;
  }

  emojiSlugCache = new Map();
  const allEmojis = getAllEmojis();

  for (const emoji of allEmojis) {
    emojiSlugCache.set(emoji.character, emoji.slug);
  }

  return emojiSlugCache;
}

/**
 * Look up the slug for an emoji character
 * @param character - The emoji character to look up
 * @returns The emoji slug or undefined if not found
 */
export function lookupEmojiSlug(character: string): string | undefined {
  const cache = buildEmojiSlugCache();
  return cache.get(character);
}

/**
 * Create a map of emoji characters to their slugs for a set of extracted emojis
 * @param extractedEmojis - Array of extracted emojis
 * @returns Map of emoji characters to slugs
 */
export function createEmojiSlugMap(extractedEmojis: ExtractedEmoji[]): Map<string, string> {
  const slugMap = new Map<string, string>();

  for (const emoji of extractedEmojis) {
    const slug = lookupEmojiSlug(emoji.character);
    if (slug) {
      slugMap.set(emoji.character, slug);
    }
  }

  return slugMap;
}

/**
 * Clear the emoji slug cache (useful for testing)
 */
export function clearEmojiSlugCache(): void {
  emojiSlugCache = null;
}

// ============================================
// RESPONSE PARSING
// ============================================

/**
 * Parse and validate the OpenAI response
 * @param responseContent - The raw JSON string from OpenAI
 * @returns Validated interpretation response
 * @throws {OpenAIError} If parsing or validation fails
 */
export function parseOpenAIResponse(responseContent: string): InterpretationResponse {
  let parsed: unknown;

  try {
    parsed = JSON.parse(responseContent);
  } catch {
    throw new OpenAIError('Failed to parse OpenAI response as JSON', 'PARSE_ERROR');
  }

  const validationResult = interpretationResponseSchema.safeParse(parsed);

  if (!validationResult.success) {
    const errorMessage = validationResult.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new OpenAIError(`Invalid response structure: ${errorMessage}`, 'PARSE_ERROR');
  }

  return validationResult.data;
}

// ============================================
// RESULT BUILDING
// ============================================

/**
 * Generate a unique ID for the interpretation
 */
function generateId(): string {
  return `int_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Build the final InterpretationResult from OpenAI response
 * @param message - The original message
 * @param openaiResponse - The validated OpenAI response
 * @param slugMap - Map of emoji characters to slugs
 * @returns Complete interpretation result
 */
export function buildInterpretationResult(
  message: string,
  openaiResponse: InterpretationResponse,
  slugMap: Map<string, string>
): InterpretationResult {
  // Map OpenAI emojis to DetectedEmoji with slugs
  const detectedEmojis: DetectedEmoji[] = openaiResponse.emojis.map((emoji) => ({
    character: emoji.character,
    meaning: emoji.meaning,
    slug: slugMap.get(emoji.character) || emoji.slug,
  }));

  // Map metrics
  const metrics: InterpretationMetrics = {
    sarcasmProbability: openaiResponse.metrics.sarcasmProbability,
    passiveAggressionProbability: openaiResponse.metrics.passiveAggressionProbability,
    overallTone: openaiResponse.metrics.overallTone,
    confidence: openaiResponse.metrics.confidence,
  };

  // Map red flags
  const redFlags: RedFlag[] = openaiResponse.redFlags.map((flag) => ({
    type: flag.type,
    description: flag.description,
    severity: flag.severity,
  }));

  return {
    id: generateId(),
    message,
    emojis: detectedEmojis,
    interpretation: openaiResponse.interpretation,
    metrics,
    redFlags,
    timestamp: new Date().toISOString(),
  };
}

// ============================================
// MAIN INTERPRETER FUNCTION
// ============================================

/**
 * Interpret a message containing emojis using OpenAI
 *
 * This is the main entry point for the interpreter service. It:
 * 1. Extracts emojis from the message with positions
 * 2. Looks up emoji slugs for linking
 * 3. Builds a context-aware prompt
 * 4. Calls OpenAI with the prompt
 * 5. Parses and validates the response
 * 6. Builds the final interpretation result
 *
 * @param request - The interpretation request
 * @returns Complete interpretation result
 * @throws {OpenAIError} If OpenAI call fails or response is invalid
 */
export async function interpretMessage(request: InterpretRequest): Promise<InterpretationResult> {
  // Get OpenAI client (throws if not configured)
  const client = getOpenAIClient();

  // Extract emojis from message
  const extractedEmojis = extractEmojisWithPositions(request.message);

  // Create slug map for linking emojis to detail pages
  const slugMap = createEmojiSlugMap(extractedEmojis);

  // Build the prompt
  const userPrompt = buildInterpretationPrompt(request);

  // Call OpenAI
  const completion = await client.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: 'system', content: INTERPRETATION_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 1000,
  });

  // Extract response content
  const responseContent = completion.choices[0]?.message?.content;

  if (!responseContent) {
    throw new OpenAIError('Empty response from OpenAI', 'API_ERROR');
  }

  // Parse and validate response
  const openaiResponse = parseOpenAIResponse(responseContent);

  // Build and return the final result
  return buildInterpretationResult(request.message, openaiResponse, slugMap);
}

// ============================================
// CACHED INTERPRETATION
// ============================================

/**
 * Interpret a message with Redis caching support
 *
 * This function wraps interpretMessage with Redis caching to:
 * 1. Check if the interpretation already exists in cache
 * 2. Return cached result if available
 * 3. Call OpenAI and cache the result if not in cache
 *
 * Cache is keyed by hash of (message, platform, relationship)
 *
 * @param request - The interpretation request
 * @returns Complete interpretation result (from cache or fresh)
 * @throws {OpenAIError} If OpenAI call fails or response is invalid
 */
export async function interpretMessageWithCache(
  request: InterpretRequest
): Promise<InterpretationResult> {
  // Generate cache key from request parameters
  const requestHash = hashInterpretationRequest(request.message, request.platform, request.context);
  const cacheKey = getCacheKey(CACHE_PREFIXES.INTERPRETATION, requestHash);

  // Try to get from cache first
  const cachedResult = await cacheGet<InterpretationResult>(cacheKey);
  if (cachedResult) {
    // Return cached result with a fresh ID and timestamp
    return {
      ...cachedResult,
      id: generateId(),
      timestamp: new Date().toISOString(),
    };
  }

  // Not in cache - call OpenAI
  const result = await interpretMessage(request);

  // Store in cache (fire and forget - don't await)
  cacheSet(cacheKey, result, DEFAULT_TTL.INTERPRETATION).catch(() => {
    // Silently ignore cache errors - they're already logged in cacheSet
  });

  return result;
}
