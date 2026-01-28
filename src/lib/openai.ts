/**
 * OpenAI API Integration for KnowYourEmoji Interpreter
 *
 * This module provides:
 * - OpenAI client configuration with API key handling
 * - Interpretation system prompt for emoji analysis
 * - Structured output parsing via Zod schemas
 * - Error handling with custom error types
 * - Token usage tracking
 * - Retry configuration for resilience
 */

import OpenAI from 'openai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import type { InterpretRequest, Platform, RelationshipContext } from '@/types';

// ============================================
// CONSTANTS
// ============================================

/** The OpenAI model to use for interpretations */
export const OPENAI_MODEL = 'gpt-4-turbo';

/** Maximum number of retries for transient failures */
export const MAX_RETRIES = 3;

/** Delay between retries in milliseconds */
export const RETRY_DELAY_MS = 1000;

// ============================================
// SYSTEM PROMPT
// ============================================

/**
 * System prompt that guides the AI to analyze emoji meanings in context
 */
export const INTERPRETATION_SYSTEM_PROMPT = `You are an expert emoji interpreter specializing in understanding the nuanced, contextual meanings of emojis in modern digital communication.

Your task is to analyze messages containing emojis and provide accurate interpretations based on:

1. **Literal vs Contextual Meaning**: Consider both the Unicode definition and how the emoji is actually used in real-world communication.

2. **Platform-Specific Conventions**: Different platforms (iMessage, Instagram, TikTok, Slack, Discord, Twitter, WhatsApp) have different emoji cultures and norms.

3. **Relationship Context**: The meaning changes based on whether the message is from a romantic partner, friend, family member, coworker, acquaintance, or stranger.

4. **Tone Analysis**: Evaluate the overall tone considering:
   - Sarcasm probability (0-100): How likely is the message sarcastic?
   - Passive-aggression probability (0-100): How likely is passive-aggressive intent?
   - Overall tone: positive, neutral, or negative

5. **Red Flags**: Identify any concerning patterns such as:
   - Manipulation tactics
   - Guilt-tripping
   - Gaslighting language
   - Boundary violations
   - Love bombing
   - Mixed signals

Provide your analysis in a structured JSON format with:
- A list of detected emojis and their contextual meanings
- An overall interpretation of the message
- Metrics for sarcasm, passive-aggression, tone, and confidence
- Any red flags detected

Be honest and direct in your analysis. If a message seems concerning, say so clearly.`;

// ============================================
// SCHEMAS
// ============================================

/**
 * Schema for a detected emoji in the interpretation
 */
const detectedEmojiSchema = z.object({
  character: z.string().describe('The emoji character'),
  meaning: z.string().describe('What this emoji means in the given context'),
  slug: z.string().optional().describe('URL slug for the emoji detail page'),
});

/**
 * Schema for interpretation metrics
 */
const metricsSchema = z.object({
  sarcasmProbability: z
    .number()
    .min(0)
    .max(100)
    .describe('Probability that the message is sarcastic (0-100)'),
  passiveAggressionProbability: z
    .number()
    .min(0)
    .max(100)
    .describe('Probability of passive-aggressive intent (0-100)'),
  overallTone: z
    .enum(['positive', 'neutral', 'negative'])
    .describe('The overall emotional tone of the message'),
  confidence: z
    .number()
    .min(0)
    .max(100)
    .describe('Confidence level in this interpretation (0-100)'),
});

/**
 * Schema for red flag indicators
 */
const redFlagSchema = z.object({
  type: z.string().describe('Type of concerning pattern'),
  description: z.string().describe('Description of the concern'),
  severity: z.enum(['low', 'medium', 'high']).describe('Severity level of the red flag'),
});

/**
 * Schema for the complete interpretation response from OpenAI
 */
export const interpretationResponseSchema = z.object({
  emojis: z.array(detectedEmojiSchema).describe('List of emojis detected in the message'),
  interpretation: z.string().describe('Overall interpretation of the message'),
  metrics: metricsSchema.describe('Interpretation metrics'),
  redFlags: z.array(redFlagSchema).describe('Red flags detected in the message'),
});

/**
 * Type for the interpretation response
 */
export type InterpretationResponse = z.infer<typeof interpretationResponseSchema>;

/**
 * Schema for token usage tracking
 */
export const tokenUsageSchema = z.object({
  promptTokens: z.number().min(0).describe('Number of tokens in the prompt'),
  completionTokens: z.number().min(0).describe('Number of tokens in the completion'),
  totalTokens: z.number().min(0).describe('Total tokens used'),
});

/**
 * Type for token usage
 */
export type TokenUsage = z.infer<typeof tokenUsageSchema>;

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Error codes for OpenAI-related errors
 */
export type OpenAIErrorCode =
  | 'API_ERROR'
  | 'RATE_LIMIT'
  | 'AUTH_ERROR'
  | 'INVALID_REQUEST'
  | 'SERVER_ERROR'
  | 'PARSE_ERROR'
  | 'CONFIG_ERROR';

/**
 * Custom error class for OpenAI-related errors
 */
export class OpenAIError extends Error {
  public readonly code: OpenAIErrorCode;
  public readonly statusCode?: number;

  constructor(message: string, code: OpenAIErrorCode, statusCode?: number) {
    super(message);
    this.name = 'OpenAIError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Check if an error is retryable (transient server/rate limit errors)
 */
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof OpenAIError)) {
    return false;
  }

  const statusCode = error.statusCode;
  if (!statusCode) {
    return false;
  }

  // Retry on rate limits and server errors
  return statusCode === 429 || (statusCode >= 500 && statusCode < 600);
}

// ============================================
// CLIENT INITIALIZATION
// ============================================

let openaiClient: OpenAI | null = null;
let openaiProvider: ReturnType<typeof createOpenAI> | null = null;

/**
 * Get or create the OpenAI client instance
 * @throws {OpenAIError} If OPENAI_API_KEY is not configured
 */
export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new OpenAIError('OPENAI_API_KEY is not configured', 'CONFIG_ERROR');
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey,
      // Allow in browser-like test environments (happy-dom)
      // This is safe as API calls only happen server-side in production
      dangerouslyAllowBrowser: process.env.NODE_ENV === 'test',
    });
  }

  return openaiClient;
}

/**
 * Get or create the Vercel AI SDK OpenAI provider
 * @throws {OpenAIError} If OPENAI_API_KEY is not configured
 */
export function getOpenAIProvider(): ReturnType<typeof createOpenAI> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new OpenAIError('OPENAI_API_KEY is not configured', 'CONFIG_ERROR');
  }

  if (!openaiProvider) {
    openaiProvider = createOpenAI({
      apiKey,
    });
  }

  return openaiProvider;
}

// ============================================
// PROMPT BUILDING
// ============================================

/**
 * Build the user prompt for interpretation based on request parameters
 */
export function buildInterpretationPrompt(request: InterpretRequest): string {
  const platformDisplay = formatPlatform(request.platform);
  const contextDisplay = formatContext(request.context);

  return `Analyze the following message and provide your interpretation in JSON format.

**Message:** "${request.message}"

**Platform:** ${request.platform}${platformDisplay ? ` (${platformDisplay})` : ''}

**Relationship Context:** ${request.context}${contextDisplay ? ` - ${contextDisplay}` : ''}

Provide your analysis as a JSON object with these fields:
- emojis: Array of {character, meaning} for each emoji detected
- interpretation: Overall interpretation of the message
- metrics: {sarcasmProbability, passiveAggressionProbability, overallTone, confidence}
- redFlags: Array of {type, description, severity} for any concerns`;
}

/**
 * Format platform for display
 */
function formatPlatform(platform: Platform | 'OTHER'): string {
  const platformLabels: Record<Platform | 'OTHER', string> = {
    IMESSAGE: 'Apple iMessage',
    INSTAGRAM: 'Instagram DMs',
    TIKTOK: 'TikTok comments/messages',
    WHATSAPP: 'WhatsApp',
    SLACK: 'Slack workplace messaging',
    DISCORD: 'Discord',
    TWITTER: 'Twitter/X DMs',
    OTHER: 'Other platform',
  };
  return platformLabels[platform] || '';
}

/**
 * Format relationship context for display
 */
function formatContext(context: RelationshipContext): string {
  const contextLabels: Record<RelationshipContext, string> = {
    ROMANTIC_PARTNER: 'Someone you are dating or in a relationship with',
    FRIEND: 'A friend or close acquaintance',
    FAMILY: 'A family member',
    COWORKER: 'A colleague or professional contact',
    ACQUAINTANCE: 'Someone you know casually',
    STRANGER: 'Someone you do not know personally',
  };
  return contextLabels[context] || '';
}

// ============================================
// UTILITY EXPORTS
// ============================================

/**
 * Reset the client instances (useful for testing)
 */
export function resetClients(): void {
  openaiClient = null;
  openaiProvider = null;
}
