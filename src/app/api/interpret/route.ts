import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { InterpretRequest, InterpretationResult, InterpretErrorResponse } from '@/types';

// Regular expression to detect emoji characters
// This pattern matches most Unicode emoji including:
// - Basic emoji (😀)
// - Emoji with modifiers (👍🏻)
// - Emoji sequences (👨‍👩‍👧‍👦)
const EMOJI_REGEX =
  /[\p{Emoji_Presentation}\p{Extended_Pictographic}](\u200d[\p{Emoji_Presentation}\p{Extended_Pictographic}])*/gu;

// Valid platforms (matches Platform type + OTHER)
const VALID_PLATFORMS = [
  'IMESSAGE',
  'INSTAGRAM',
  'TIKTOK',
  'WHATSAPP',
  'SLACK',
  'DISCORD',
  'TWITTER',
  'OTHER',
] as const;

// Valid relationship contexts (matches RelationshipContext type)
const VALID_CONTEXTS = [
  'ROMANTIC_PARTNER',
  'FRIEND',
  'FAMILY',
  'COWORKER',
  'ACQUAINTANCE',
  'STRANGER',
] as const;

// Zod schema for request validation
const interpretRequestSchema = z.object({
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be at most 1000 characters')
    .refine((msg) => EMOJI_REGEX.test(msg), {
      message: 'Message must contain at least one emoji',
    }),
  platform: z.enum(VALID_PLATFORMS, {
    errorMap: () => ({
      message: `Platform must be one of: ${VALID_PLATFORMS.join(', ')}`,
    }),
  }),
  context: z.enum(VALID_CONTEXTS, {
    errorMap: () => ({
      message: `Context must be one of: ${VALID_CONTEXTS.join(', ')}`,
    }),
  }),
});

/**
 * Extract emojis from a message
 */
function extractEmojis(message: string): string[] {
  const matches = message.match(EMOJI_REGEX);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Generate a unique ID for the interpretation
 */
function generateId(): string {
  return `int_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create an error response with consistent structure
 */
function createErrorResponse(
  error: string,
  status: number,
  fieldErrors?: Record<string, string[]>
): NextResponse<InterpretErrorResponse> {
  return NextResponse.json(
    {
      error,
      status,
      ...(fieldErrors && { fieldErrors }),
    },
    { status }
  );
}

/**
 * Create a mock interpretation result for Phase 1
 * In Phase 2, this will call the OpenAI API via the interpreter service
 */
function createMockInterpretation(
  request: InterpretRequest,
  emojis: string[]
): InterpretationResult {
  return {
    id: generateId(),
    message: request.message,
    emojis: emojis.map((emoji) => ({
      character: emoji,
      meaning: 'Interpretation pending - AI service not configured',
    })),
    interpretation:
      'This is a placeholder interpretation. The AI interpretation service is not yet configured. ' +
      'When enabled, this will provide detailed analysis of emoji meanings based on context, platform, and relationship.',
    metrics: {
      sarcasmProbability: 0,
      passiveAggressionProbability: 0,
      overallTone: 'neutral',
      confidence: 0,
    },
    redFlags: [],
    timestamp: new Date().toISOString(),
  };
}

/**
 * POST /api/interpret
 *
 * Interprets emoji usage in a message based on context.
 *
 * Request body:
 * - message: string (10-1000 chars, must contain emoji)
 * - platform: Platform | 'OTHER'
 * - context: RelationshipContext
 *
 * Response:
 * - 200: InterpretationResult
 * - 400: Validation error
 * - 429: Rate limited (future)
 * - 500: Server error
 * - 503: Service unavailable (AI not configured)
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<InterpretationResult | InterpretErrorResponse>> {
  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse('Invalid JSON in request body', 400);
    }

    // Validate request body
    const validationResult = interpretRequestSchema.safeParse(body);

    if (!validationResult.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of validationResult.error.issues) {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(issue.message);
      }

      // Determine the primary error message
      const firstError = validationResult.error.issues[0];
      const errorMessage = firstError?.message || 'Validation failed';

      return createErrorResponse(errorMessage, 400, fieldErrors);
    }

    const validatedData = validationResult.data as InterpretRequest;

    // Extract emojis from the message
    const emojis = extractEmojis(validatedData.message);

    // Check if OpenAI API is configured
    const openaiKey = process.env.OPENAI_API_KEY;
    const interpreterEnabled = process.env.NEXT_PUBLIC_ENABLE_INTERPRETER !== 'false';

    if (!openaiKey || !interpreterEnabled) {
      // Return mock interpretation for Phase 1
      // In Phase 2, this will call the actual interpreter service
      const mockResult = createMockInterpretation(validatedData, emojis);
      return NextResponse.json(mockResult, { status: 200 });
    }

    // TODO: Phase 2 - Call OpenAI API via interpreter service
    // For now, return mock interpretation
    const result = createMockInterpretation(validatedData, emojis);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in /api/interpret:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
