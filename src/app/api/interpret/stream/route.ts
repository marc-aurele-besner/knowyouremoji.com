import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';
import { streamText } from 'ai';
import type { InterpretRequest, InterpretErrorResponse } from '@/types';
import {
  getOpenAIProvider,
  buildInterpretationPrompt,
  INTERPRETATION_SYSTEM_PROMPT,
  OPENAI_MODEL,
  OpenAIError,
} from '@/lib/openai';

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

/**
 * Check if a string contains at least one emoji
 * Uses a fresh regex to avoid state issues with global flag
 */
function containsEmoji(message: string): boolean {
  // Create a new regex instance for each check to avoid lastIndex state issues
  const regex =
    /[\p{Emoji_Presentation}\p{Extended_Pictographic}](\u200d[\p{Emoji_Presentation}\p{Extended_Pictographic}])*/u;
  return regex.test(message);
}

// Zod schema for request validation
const interpretRequestSchema = z.object({
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be at most 1000 characters')
    .refine((msg) => containsEmoji(msg), {
      message: 'Message must contain at least one emoji',
    }),
  platform: z.enum(VALID_PLATFORMS, {
    error: `Platform must be one of: ${VALID_PLATFORMS.join(', ')}`,
  }),
  context: z.enum(VALID_CONTEXTS, {
    error: `Context must be one of: ${VALID_CONTEXTS.join(', ')}`,
  }),
});

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
 * POST /api/interpret/stream
 *
 * Streaming variant of the interpret API using Vercel AI SDK.
 * Returns a text/event-stream response with progressive interpretation results.
 *
 * Request body:
 * - message: string (10-1000 chars, must contain emoji)
 * - platform: Platform | 'OTHER'
 * - context: RelationshipContext
 *
 * Response:
 * - 200: text/event-stream with streaming interpretation
 * - 400: Validation error (JSON)
 * - 429: Rate limited (JSON)
 * - 500: Server error (JSON)
 * - 503: Service unavailable (JSON)
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<InterpretErrorResponse> | Response> {
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

    // Check if interpreter is enabled
    const interpreterEnabled = process.env.NEXT_PUBLIC_ENABLE_INTERPRETER !== 'false';
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!interpreterEnabled || !openaiKey) {
      return createErrorResponse('AI service is not configured', 503);
    }

    // Get the OpenAI provider for Vercel AI SDK
    const openai = getOpenAIProvider();

    // Build the prompt
    const userPrompt = buildInterpretationPrompt(validatedData);

    // Use Vercel AI SDK streamText for streaming response
    const result = streamText({
      model: openai(OPENAI_MODEL),
      system: INTERPRETATION_SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.7,
      maxTokens: 1000,
    });

    // Return the streaming response with appropriate headers
    return result.toTextStreamResponse({
      headers: {
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in /api/interpret/stream:', error);

    // Handle custom OpenAI errors
    if (error instanceof OpenAIError) {
      if (error.code === 'CONFIG_ERROR') {
        return createErrorResponse('AI service is not configured', 503);
      }
      if (error.code === 'RATE_LIMIT') {
        return createErrorResponse(
          'AI service is temporarily unavailable. Please try again later.',
          429
        );
      }
      return createErrorResponse('AI service error', 500);
    }

    // Handle OpenAI SDK errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return createErrorResponse('AI service authentication failed', 503);
      }
      if (error.status === 429) {
        return createErrorResponse(
          'AI service is temporarily unavailable. Please try again later.',
          429
        );
      }
      if (error.status && error.status >= 500) {
        return createErrorResponse('AI service is temporarily unavailable', 503);
      }
      return createErrorResponse('AI service error', 500);
    }

    return createErrorResponse('Internal server error', 500);
  }
}
