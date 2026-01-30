/**
 * Mock factories for Interpreter types
 *
 * These factories generate realistic test data for interpreter-related types.
 * Use these in tests instead of inline mock objects for consistency.
 */

import type {
  InterpretRequest,
  InterpretationResult,
  DetectedEmoji,
  InterpretationMetrics,
  RedFlag,
  SuggestedResponseTone,
  InterpretationResultWithTones,
} from '../../../src/types/emoji';

// Counter for generating unique IDs
let interpreterCounter = 0;

/**
 * Create a valid InterpretRequest with default values
 * @param overrides - Partial request fields to override defaults
 */
export function createInterpretRequest(
  overrides: Partial<InterpretRequest> = {}
): InterpretRequest {
  return {
    message: 'Hey! How are you doing today? 😊 Hope everything is going well!',
    platform: 'IMESSAGE',
    context: 'FRIEND',
    ...overrides,
  };
}

/**
 * Create a valid InterpretationResult with default values
 * @param overrides - Partial result fields to override defaults
 */
export function createInterpretationResult(
  overrides: Partial<InterpretationResult> = {}
): InterpretationResult {
  interpreterCounter++;

  return {
    id: `interp-${interpreterCounter}-${Date.now()}`,
    message: 'Hey! How are you doing today? 😊 Hope everything is going well!',
    emojis: [
      {
        character: '😊',
        meaning: 'Expressing warmth and friendliness',
        slug: 'smiling-face-with-smiling-eyes',
      },
    ],
    interpretation:
      'This is a friendly, casual greeting. The 😊 emoji adds warmth and sincerity to the message, suggesting genuine care about how the recipient is doing.',
    metrics: createInterpretationMetrics(),
    redFlags: [],
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a valid DetectedEmoji with default values
 * @param overrides - Partial detected emoji fields to override defaults
 */
export function createDetectedEmoji(overrides: Partial<DetectedEmoji> = {}): DetectedEmoji {
  const result: DetectedEmoji = {
    character: '😊',
    meaning: 'Expressing warmth and friendliness',
    ...overrides,
  };

  // Only include slug if explicitly provided
  if (overrides.slug !== undefined) {
    result.slug = overrides.slug;
  } else if (!('slug' in overrides)) {
    result.slug = 'smiling-face-with-smiling-eyes';
  }

  return result;
}

/**
 * Create valid InterpretationMetrics with default values
 * @param overrides - Partial metrics fields to override defaults
 */
export function createInterpretationMetrics(
  overrides: Partial<InterpretationMetrics> = {}
): InterpretationMetrics {
  return {
    sarcasmProbability: 5,
    passiveAggressionProbability: 2,
    overallTone: 'positive',
    confidence: 85,
    ...overrides,
  };
}

/**
 * Create a valid RedFlag with default values
 * @param overrides - Partial red flag fields to override defaults
 */
export function createRedFlag(overrides: Partial<RedFlag> = {}): RedFlag {
  return {
    type: 'passive_aggressive',
    description: 'Message may contain subtle passive-aggressive undertones',
    severity: 'low',
    ...overrides,
  };
}

/**
 * Create multiple DetectedEmoji objects
 * @param count - Number of detected emojis to create
 * @param overrides - Partial fields to apply to all emojis
 */
export function createMultipleDetectedEmojis(
  count: number,
  overrides: Partial<DetectedEmoji> = {}
): DetectedEmoji[] {
  const defaultEmojis = [
    { character: '😊', meaning: 'Warmth and friendliness', slug: 'smiling-face' },
    { character: '😂', meaning: 'Finding something hilarious', slug: 'face-with-tears' },
    { character: '❤️', meaning: 'Love or affection', slug: 'red-heart' },
    { character: '🔥', meaning: 'Something impressive', slug: 'fire' },
    { character: '💀', meaning: 'Dead from laughing', slug: 'skull' },
  ];

  return Array.from({ length: count }, (_, i) => ({
    ...defaultEmojis[i % defaultEmojis.length],
    ...overrides,
  }));
}

/**
 * Create multiple RedFlag objects
 * @param count - Number of red flags to create
 * @param overrides - Partial fields to apply to all red flags
 */
export function createMultipleRedFlags(count: number, overrides: Partial<RedFlag> = {}): RedFlag[] {
  const defaultRedFlags: RedFlag[] = [
    {
      type: 'passive_aggressive',
      description: 'May contain passive-aggressive undertones',
      severity: 'low',
    },
    {
      type: 'manipulation',
      description: 'Potential guilt-tripping detected',
      severity: 'medium',
    },
    {
      type: 'dismissive',
      description: 'Message may be dismissive of feelings',
      severity: 'medium',
    },
    {
      type: 'gaslighting',
      description: 'Possible attempt to question perception',
      severity: 'high',
    },
    {
      type: 'love_bombing',
      description: 'Excessive flattery may be concerning',
      severity: 'medium',
    },
  ];

  return Array.from({ length: count }, (_, i) => ({
    ...defaultRedFlags[i % defaultRedFlags.length],
    ...overrides,
  }));
}

// ============================================
// RESPONSE TONE SUGGESTION FACTORIES (Phase 2)
// ============================================

/**
 * Create a valid SuggestedResponseTone with default values
 * @param overrides - Partial tone suggestion fields to override defaults
 */
export function createSuggestedResponseTone(
  overrides: Partial<SuggestedResponseTone> = {}
): SuggestedResponseTone {
  return {
    tone: 'PLAYFUL',
    reasoning:
      'The positive tone invites a playful response that can strengthen the connection and keep things light.',
    confidence: 85,
    examples: [
      'Haha, love it! 😄 Speaking of which...',
      "You're too much! 😂 But seriously though...",
    ],
    ...overrides,
  };
}

/**
 * Create multiple SuggestedResponseTone objects
 * @param count - Number of tone suggestions to create (max 5)
 * @param overrides - Partial fields to apply to all suggestions
 */
export function createMultipleSuggestedTones(
  count: number,
  overrides: Partial<SuggestedResponseTone> = {}
): SuggestedResponseTone[] {
  const defaultTones: SuggestedResponseTone[] = [
    {
      tone: 'PLAYFUL',
      reasoning: 'The positive tone invites a playful response.',
      confidence: 90,
      examples: ['Haha, love it! 😄', "You're too much! 😂"],
    },
    {
      tone: 'DIRECT',
      reasoning: 'A straightforward response ensures clarity.',
      confidence: 75,
      examples: ["Here's what I'm thinking...", 'Let me be direct about this...'],
    },
    {
      tone: 'CLARIFYING',
      reasoning: 'Seeking clarification shows engagement.',
      confidence: 70,
      examples: ['Just to make sure I understand...', 'Can you tell me more about...?'],
    },
    {
      tone: 'NEUTRAL',
      reasoning: 'A balanced response maintains professionalism.',
      confidence: 65,
      examples: ['Thanks for sharing that.', 'Understood. My thoughts are...'],
    },
    {
      tone: 'MATCHING',
      reasoning: "Matching the sender's energy builds rapport.",
      confidence: 60,
      examples: ['YES! 🎉 I love this!', 'Same energy! ✨'],
    },
  ];

  return Array.from({ length: Math.min(count, 5) }, (_, i) => ({
    ...defaultTones[i % defaultTones.length],
    ...overrides,
  }));
}

/**
 * Create a valid InterpretationResultWithTones with default values
 * @param overrides - Partial result fields to override defaults
 */
export function createInterpretationResultWithTones(
  overrides: Partial<InterpretationResultWithTones> = {}
): InterpretationResultWithTones {
  const baseResult = createInterpretationResult(overrides);

  return {
    ...baseResult,
    suggestedTones: overrides.suggestedTones ?? createMultipleSuggestedTones(3),
  };
}

/**
 * Create tone suggestions appropriate for different message types
 */
export const TONE_SUGGESTION_PRESETS = {
  /** Friendly positive message */
  friendly: createMultipleSuggestedTones(3, {}),

  /** Passive-aggressive message */
  passiveAggressive: [
    createSuggestedResponseTone({
      tone: 'CLARIFYING',
      reasoning: 'Asking clarifying questions can bring underlying concerns to the surface.',
      confidence: 95,
    }),
    createSuggestedResponseTone({
      tone: 'DIRECT',
      reasoning: 'A direct response addresses the underlying message clearly.',
      confidence: 85,
    }),
    createSuggestedResponseTone({
      tone: 'NEUTRAL',
      reasoning: 'Maintaining neutrality prevents escalation.',
      confidence: 70,
    }),
  ],

  /** Professional/work context */
  professional: [
    createSuggestedResponseTone({
      tone: 'NEUTRAL',
      reasoning: 'A professional tone maintains appropriate boundaries.',
      confidence: 90,
    }),
    createSuggestedResponseTone({
      tone: 'DIRECT',
      reasoning: 'Clear communication is valued in professional settings.',
      confidence: 80,
    }),
    createSuggestedResponseTone({
      tone: 'CLARIFYING',
      reasoning: 'Ensuring mutual understanding prevents miscommunication.',
      confidence: 75,
    }),
  ],
} as const;
