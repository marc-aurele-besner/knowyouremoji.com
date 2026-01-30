/**
 * Response Tone Suggestions for KnowYourEmoji Interpreter
 *
 * This module provides functionality for suggesting appropriate response tones
 * based on the interpretation analysis of emoji-containing messages.
 *
 * Phase 2 feature: Requires user authentication for personalization and ratings.
 */

import type {
  ResponseToneType,
  ResponseToneTypeInfo,
  SuggestedResponseTone,
  InterpretationMetrics,
} from '@/types';

// ============================================
// CONSTANTS
// ============================================

/**
 * Response tone type definitions with labels, descriptions, and icons
 */
export const RESPONSE_TONE_TYPES: Record<ResponseToneType, ResponseToneTypeInfo> = {
  DIRECT: {
    type: 'DIRECT',
    label: 'Direct & Assertive',
    description:
      'Clear, straightforward communication that addresses the message directly without ambiguity.',
    icon: '💪',
  },
  PLAYFUL: {
    type: 'PLAYFUL',
    label: 'Playful & Light',
    description:
      'A fun, lighthearted approach that uses humor or emojis to keep the conversation casual.',
    icon: '😄',
  },
  CLARIFYING: {
    type: 'CLARIFYING',
    label: 'Clarifying & Questioning',
    description:
      'An approach that seeks to understand better by asking questions or requesting clarification.',
    icon: '🤔',
  },
  NEUTRAL: {
    type: 'NEUTRAL',
    label: 'Neutral & Professional',
    description:
      'A balanced, professional tone that maintains composure and avoids emotional escalation.',
    icon: '🤝',
  },
  MATCHING: {
    type: 'MATCHING',
    label: 'Matching Energy',
    description:
      "A response that mirrors the sender's tone and energy level to build rapport and connection.",
    icon: '🪞',
  },
};

/**
 * All available response tone types
 */
export const ALL_RESPONSE_TONE_TYPES: ResponseToneType[] = [
  'DIRECT',
  'PLAYFUL',
  'CLARIFYING',
  'NEUTRAL',
  'MATCHING',
];

// ============================================
// TONE SUGGESTION LOGIC
// ============================================

/**
 * Weights for tone selection based on message characteristics
 */
interface ToneWeights {
  DIRECT: number;
  PLAYFUL: number;
  CLARIFYING: number;
  NEUTRAL: number;
  MATCHING: number;
}

/**
 * Calculate tone weights based on interpretation metrics
 * @param metrics - The interpretation metrics from OpenAI analysis
 * @returns Weighted scores for each tone type
 */
export function calculateToneWeights(metrics: InterpretationMetrics): ToneWeights {
  const { sarcasmProbability, passiveAggressionProbability, overallTone, confidence } = metrics;

  // Base weights for all tones
  const weights: ToneWeights = {
    DIRECT: 50,
    PLAYFUL: 50,
    CLARIFYING: 50,
    NEUTRAL: 50,
    MATCHING: 50,
  };

  // Adjust based on overall tone
  switch (overallTone) {
    case 'positive':
      weights.PLAYFUL += 20;
      weights.MATCHING += 15;
      weights.NEUTRAL -= 10;
      break;
    case 'negative':
      weights.DIRECT += 15;
      weights.CLARIFYING += 20;
      weights.NEUTRAL += 15;
      weights.PLAYFUL -= 20;
      break;
    case 'neutral':
      weights.NEUTRAL += 15;
      weights.CLARIFYING += 10;
      break;
  }

  // Adjust for high sarcasm
  if (sarcasmProbability > 50) {
    weights.CLARIFYING += 25;
    weights.DIRECT += 15;
    weights.PLAYFUL -= 10;
    weights.MATCHING -= 10;
  }

  // Adjust for passive-aggression
  if (passiveAggressionProbability > 50) {
    weights.DIRECT += 20;
    weights.CLARIFYING += 20;
    weights.NEUTRAL += 10;
    weights.PLAYFUL -= 25;
    weights.MATCHING -= 15;
  }

  // Adjust for low confidence (unclear message)
  if (confidence < 50) {
    weights.CLARIFYING += 30;
    weights.DIRECT -= 10;
  }

  // Normalize weights to ensure they're positive
  for (const key of Object.keys(weights) as ResponseToneType[]) {
    weights[key] = Math.max(0, weights[key]);
  }

  return weights;
}

/**
 * Select the top N tones based on weights
 * @param weights - Calculated tone weights
 * @param count - Number of tones to select (default: 3)
 * @returns Array of selected tone types, sorted by weight descending
 */
export function selectTopTones(weights: ToneWeights, count: number = 3): ResponseToneType[] {
  const sortedTones = (Object.entries(weights) as [ResponseToneType, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([tone]) => tone);

  return sortedTones;
}

/**
 * Generate reasoning for a suggested tone based on metrics
 * @param tone - The suggested tone type
 * @param metrics - The interpretation metrics
 * @returns Human-readable reasoning string
 */
export function generateToneReasoning(
  tone: ResponseToneType,
  metrics: InterpretationMetrics
): string {
  const { sarcasmProbability, passiveAggressionProbability, overallTone, confidence } = metrics;

  const toneInfo = RESPONSE_TONE_TYPES[tone];
  let reasoning = '';

  switch (tone) {
    case 'DIRECT':
      if (passiveAggressionProbability > 50) {
        reasoning =
          'Given the potential passive-aggressive undertones, a direct response can help address the underlying message clearly.';
      } else if (sarcasmProbability > 50) {
        reasoning =
          'The sarcasm in the message suggests a direct approach may be effective to cut through any ambiguity.';
      } else {
        reasoning =
          'A straightforward response ensures your message is understood without room for misinterpretation.';
      }
      break;

    case 'PLAYFUL':
      if (overallTone === 'positive') {
        reasoning =
          'The positive tone invites a playful response that can strengthen the connection and keep things light.';
      } else {
        reasoning =
          'A touch of lightheartedness could help ease any tension and redirect the conversation positively.';
      }
      break;

    case 'CLARIFYING':
      if (confidence < 50) {
        reasoning =
          'The message has some ambiguity, so asking clarifying questions can help ensure you understand correctly.';
      } else if (sarcasmProbability > 50) {
        reasoning =
          'Given the potential sarcasm, seeking clarification can help confirm the true intent behind the message.';
      } else if (passiveAggressionProbability > 50) {
        reasoning =
          'Asking clarifying questions can bring any underlying concerns to the surface for direct discussion.';
      } else {
        reasoning =
          'Seeking clarification shows engagement and ensures mutual understanding in the conversation.';
      }
      break;

    case 'NEUTRAL':
      if (overallTone === 'negative') {
        reasoning =
          'A neutral, professional tone helps de-escalate tension and keeps the conversation productive.';
      } else if (passiveAggressionProbability > 30) {
        reasoning =
          'Maintaining neutrality prevents escalation and demonstrates emotional maturity in the exchange.';
      } else {
        reasoning =
          'A balanced response maintains professionalism while leaving room for the conversation to develop.';
      }
      break;

    case 'MATCHING':
      if (overallTone === 'positive' && confidence > 70) {
        reasoning =
          "Matching the sender's positive energy builds rapport and reinforces the friendly dynamic.";
      } else if (overallTone === 'neutral') {
        reasoning =
          'Mirroring the neutral tone maintains consistency and shows you understand the communication style.';
      } else {
        reasoning =
          'Reflecting a similar energy level can help the sender feel heard and understood.';
      }
      break;

    default:
      reasoning = toneInfo.description;
  }

  return reasoning;
}

/**
 * Generate example response templates for a tone
 * @param tone - The tone type
 * @param overallTone - The detected overall tone of the original message
 * @returns Array of example response templates
 */
export function generateToneExamples(
  tone: ResponseToneType,
  overallTone: 'positive' | 'neutral' | 'negative'
): string[] {
  const examples: Record<ResponseToneType, Record<typeof overallTone, string[]>> = {
    DIRECT: {
      positive: [
        "Thanks! I appreciate that. Here's what I'm thinking...",
        "I hear you! Let me be direct about this - I'd prefer to...",
      ],
      neutral: [
        'I want to be clear about this: [your point]',
        "Here's my honest take on this: [your perspective]",
      ],
      negative: [
        "I understand you're frustrated. Let me address this directly...",
        "I hear your concern. Here's what I think we should do...",
      ],
    },
    PLAYFUL: {
      positive: [
        'Haha, love it! 😄 Speaking of which...',
        "You're too much! 😂 But seriously though...",
      ],
      neutral: [
        "Well well well 👀 Let's make this fun...",
        "Ooh, interesting! 🤔 Here's a thought...",
      ],
      negative: [
        'Okay okay, I see where this is going 😅 How about we...',
        "Alright, let's not spiral here 🙃 What if we tried...",
      ],
    },
    CLARIFYING: {
      positive: [
        'That sounds great! Just to make sure I understand - you mean...?',
        'Love this idea! Quick question though - when you say X, do you mean...?',
      ],
      neutral: [
        'Interesting point. Can you tell me more about what you mean by...?',
        "I want to make sure I'm following - are you saying that...?",
      ],
      negative: [
        'I want to understand your perspective better. What specifically about X is concerning you?',
        "Help me understand - when you mention X, what's the main issue you're seeing?",
      ],
    },
    NEUTRAL: {
      positive: [
        'Thanks for sharing that. I think a good next step would be...',
        'Appreciated. Moving forward, I suggest we...',
      ],
      neutral: [
        'Understood. Here are my thoughts on this...',
        'Thanks for the update. From my perspective...',
      ],
      negative: [
        "I understand your position. Let's work through this together...",
        "Thank you for expressing that. Here's what I propose...",
      ],
    },
    MATCHING: {
      positive: [
        "YES! 🎉 I'm so here for this! Let's...",
        'Omg same energy! ✨ I was literally just thinking...',
      ],
      neutral: ['Yeah, I can see that. My take is...', "Makes sense. On my end, I'd say..."],
      negative: [
        "I feel you. It's frustrating when... Here's what I think could help...",
        'Totally get it. The way I see it...',
      ],
    },
  };

  return examples[tone][overallTone] || examples[tone]['neutral'];
}

/**
 * Calculate confidence for a tone suggestion based on its weight relative to max
 * @param weight - The weight for this tone
 * @param maxWeight - The maximum weight across all tones
 * @returns Confidence score (0-100)
 */
export function calculateToneConfidence(weight: number, maxWeight: number): number {
  if (maxWeight === 0) return 50;
  // Scale to 50-100 range (higher weight = higher confidence)
  const normalized = (weight / maxWeight) * 50 + 50;
  return Math.round(Math.min(100, Math.max(0, normalized)));
}

/**
 * Generate complete tone suggestions based on interpretation metrics
 * @param metrics - The interpretation metrics from the analysis
 * @returns Array of 2-3 suggested response tones with reasoning and examples
 */
export function generateToneSuggestions(metrics: InterpretationMetrics): SuggestedResponseTone[] {
  // Calculate weights for all tones
  const weights = calculateToneWeights(metrics);

  // Select top 3 tones (or 2 if weights are very close)
  const topTones = selectTopTones(weights, 3);

  // Get max weight for confidence calculation
  const maxWeight = Math.max(...Object.values(weights));

  // Generate suggestions with reasoning and examples
  const suggestions: SuggestedResponseTone[] = topTones.map((tone) => ({
    tone,
    reasoning: generateToneReasoning(tone, metrics),
    confidence: calculateToneConfidence(weights[tone], maxWeight),
    examples: generateToneExamples(tone, metrics.overallTone),
  }));

  return suggestions;
}

/**
 * Get display information for a tone type
 * @param tone - The tone type
 * @returns Tone type display information
 */
export function getToneTypeInfo(tone: ResponseToneType): ResponseToneTypeInfo {
  return RESPONSE_TONE_TYPES[tone];
}

/**
 * Validate a response tone type
 * @param tone - The tone type to validate
 * @returns True if valid, false otherwise
 */
export function isValidResponseToneType(tone: string): tone is ResponseToneType {
  return ALL_RESPONSE_TONE_TYPES.includes(tone as ResponseToneType);
}
