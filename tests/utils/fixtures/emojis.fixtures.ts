/**
 * Emoji fixtures
 *
 * Curated set of emoji data for testing various scenarios.
 */

import type { Emoji, EmojiSummary } from '../../../src/types/emoji';

/**
 * Skull emoji - commonly used ironically
 */
export const SKULL_EMOJI: Emoji = {
  unicode: '1F480',
  slug: 'skull',
  character: '💀',
  name: 'Skull',
  shortName: 'skull',
  category: 'faces',
  subcategory: 'face-negative',
  unicodeVersion: '6.0',
  baseMeaning: 'A human skull, often representing death or danger',
  tldr: 'Dead from laughing or cringing',
  contextMeanings: [
    {
      context: 'LITERAL',
      meaning: 'Death, danger, or something scary',
      example: 'Warning: Poison ☠️💀',
      riskLevel: 'LOW',
    },
    {
      context: 'SLANG',
      meaning: 'Dead from laughing - extremely funny',
      example: "That joke 💀 I can't breathe",
      riskLevel: 'LOW',
    },
    {
      context: 'IRONIC',
      meaning: 'Cringe or embarrassment that makes you want to die',
      example: 'Watching my old videos 💀',
      riskLevel: 'LOW',
    },
  ],
  platformNotes: [
    {
      platform: 'TIKTOK',
      note: 'Very commonly used to express extreme amusement or cringe',
    },
  ],
  generationalNotes: [
    {
      generation: 'GEN_Z',
      note: 'Primary emoji for expressing extreme reactions, replaced 😂',
    },
  ],
  warnings: [],
  relatedCombos: ['skull-laughing'],
  seoTitle: 'Skull 💀 Emoji Meaning - What Does 💀 Really Mean?',
  seoDescription:
    'Learn what the skull 💀 emoji actually means. Gen Z uses it to say they are dead from laughing.',
};

/**
 * Fire emoji - impressive or hot
 */
export const FIRE_EMOJI: Emoji = {
  unicode: '1F525',
  slug: 'fire',
  character: '🔥',
  name: 'Fire',
  shortName: 'fire',
  category: 'symbols',
  subcategory: 'warning',
  unicodeVersion: '6.0',
  baseMeaning: 'A flame, representing fire',
  tldr: 'Something impressive, attractive, or great',
  contextMeanings: [
    {
      context: 'LITERAL',
      meaning: 'Actual fire or heat',
      example: 'Be careful, the stove is 🔥',
      riskLevel: 'LOW',
    },
    {
      context: 'SLANG',
      meaning: 'Something is impressive, exciting, or excellent',
      example: 'This new album is 🔥🔥🔥',
      riskLevel: 'LOW',
    },
    {
      context: 'DATING',
      meaning: 'Attractive or hot',
      example: 'You look 🔥 in that dress',
      riskLevel: 'MEDIUM',
    },
  ],
  platformNotes: [
    {
      platform: 'INSTAGRAM',
      note: 'Commonly used to hype up content or compliment appearances',
    },
  ],
  generationalNotes: [
    {
      generation: 'GEN_Z',
      note: 'Universal indicator of something being great',
    },
    {
      generation: 'MILLENNIAL',
      note: 'Often used to indicate something is trending or popular',
    },
  ],
  warnings: [],
  relatedCombos: ['fire-hundred'],
  seoTitle: 'Fire 🔥 Emoji Meaning - What Does 🔥 Really Mean?',
  seoDescription:
    'Learn what the fire 🔥 emoji actually means. Used to indicate something is impressive, attractive, or lit.',
};

/**
 * Red heart emoji - love and affection
 */
export const HEART_EMOJI: Emoji = {
  unicode: '2764',
  slug: 'red-heart',
  character: '❤️',
  name: 'Red Heart',
  shortName: 'heart',
  category: 'symbols',
  subcategory: 'heart',
  unicodeVersion: '1.1',
  baseMeaning: 'A classic red heart, symbolizing love',
  tldr: 'Love, affection, or strong liking',
  contextMeanings: [
    {
      context: 'LITERAL',
      meaning: 'Romantic love',
      example: 'I love you ❤️',
      riskLevel: 'LOW',
    },
    {
      context: 'DATING',
      meaning: 'Expressing romantic feelings',
      example: 'Thinking of you ❤️',
      riskLevel: 'MEDIUM',
    },
    {
      context: 'WORK',
      meaning: 'Professional appreciation (can be misinterpreted)',
      example: 'Love the presentation ❤️',
      riskLevel: 'MEDIUM',
    },
  ],
  platformNotes: [
    {
      platform: 'INSTAGRAM',
      note: 'Very common in comments and DMs',
    },
    {
      platform: 'SLACK',
      note: 'Use sparingly in professional contexts',
    },
  ],
  generationalNotes: [
    {
      generation: 'GEN_Z',
      note: 'May prefer more specific heart colors',
    },
    {
      generation: 'BOOMER',
      note: 'Default heart emoji for all purposes',
    },
  ],
  warnings: [
    {
      title: 'Context Sensitive',
      description: 'May be misinterpreted as romantic interest in professional settings',
      severity: 'MEDIUM',
    },
  ],
  relatedCombos: ['heart-eyes'],
  seoTitle: 'Red Heart ❤️ Emoji Meaning - What Does ❤️ Really Mean?',
  seoDescription: 'Learn what the red heart ❤️ emoji actually means in different contexts.',
};

/**
 * Thumbs up emoji - approval or agreement
 */
export const THUMBS_UP_EMOJI: Emoji = {
  unicode: '1F44D',
  slug: 'thumbs-up',
  character: '👍',
  name: 'Thumbs Up',
  shortName: 'thumbsup',
  category: 'people',
  subcategory: 'hand-fingers-closed',
  unicodeVersion: '6.0',
  baseMeaning: 'A hand giving a thumbs up gesture',
  tldr: 'Approval, agreement, or acknowledgment',
  contextMeanings: [
    {
      context: 'LITERAL',
      meaning: 'Agreement or approval',
      example: 'Sounds good 👍',
      riskLevel: 'LOW',
    },
    {
      context: 'PASSIVE_AGGRESSIVE',
      meaning: 'Dismissive acknowledgment without enthusiasm',
      example: 'Fine 👍',
      riskLevel: 'MEDIUM',
    },
    {
      context: 'WORK',
      meaning: 'Professional acknowledgment',
      example: 'Got it, will do 👍',
      riskLevel: 'LOW',
    },
  ],
  platformNotes: [
    {
      platform: 'SLACK',
      note: 'Common reaction for quick acknowledgment',
    },
  ],
  generationalNotes: [
    {
      generation: 'GEN_Z',
      note: 'Can be perceived as passive-aggressive or dismissive',
    },
    {
      generation: 'BOOMER',
      note: 'Generally used sincerely for approval',
    },
  ],
  warnings: [
    {
      title: 'Generational Difference',
      description: 'Younger users may interpret this as passive-aggressive',
      severity: 'LOW',
    },
  ],
  relatedCombos: [],
  seoTitle: 'Thumbs Up 👍 Emoji Meaning - What Does 👍 Really Mean?',
  seoDescription: 'Learn what the thumbs up 👍 emoji actually means across generations.',
  skinToneVariations: [
    'thumbs-up-light',
    'thumbs-up-medium-light',
    'thumbs-up-medium',
    'thumbs-up-medium-dark',
    'thumbs-up-dark',
  ],
};

/**
 * Face with tears of joy - laughing hard
 */
export const FACE_WITH_TEARS_EMOJI: Emoji = {
  unicode: '1F602',
  slug: 'face-with-tears-of-joy',
  character: '😂',
  name: 'Face with Tears of Joy',
  shortName: 'joy',
  category: 'faces',
  subcategory: 'face-positive',
  unicodeVersion: '6.0',
  baseMeaning: 'A face with tears streaming down from laughter',
  tldr: 'Something is hilarious',
  contextMeanings: [
    {
      context: 'LITERAL',
      meaning: 'Finding something extremely funny',
      example: 'That video 😂😂😂',
      riskLevel: 'LOW',
    },
    {
      context: 'IRONIC',
      meaning: 'Forced laughter or sarcastic amusement',
      example: 'So funny... 😂',
      riskLevel: 'MEDIUM',
    },
  ],
  platformNotes: [],
  generationalNotes: [
    {
      generation: 'GEN_Z',
      note: 'Considered outdated; 💀 is preferred for genuine amusement',
    },
    {
      generation: 'MILLENNIAL',
      note: 'Still commonly used sincerely',
    },
  ],
  warnings: [
    {
      title: 'Generational Perception',
      description: 'Gen Z may view this emoji as outdated or insincere',
      severity: 'LOW',
    },
  ],
  relatedCombos: ['skull-laughing'],
  seoTitle: 'Face with Tears of Joy 😂 Meaning - What Does 😂 Really Mean?',
  seoDescription: 'Learn what 😂 emoji actually means and why some consider it outdated.',
};

/**
 * Minimal emoji - only required fields populated
 */
export const MINIMAL_EMOJI: Emoji = {
  unicode: '1F600',
  slug: 'minimal-test-emoji',
  character: '😀',
  name: 'Minimal Test Emoji',
  shortName: 'minimal',
  category: 'faces',
  unicodeVersion: '6.0',
  baseMeaning: 'A grinning face',
  tldr: 'Happy and grinning',
  contextMeanings: [],
  platformNotes: [],
  generationalNotes: [],
  warnings: [],
  relatedCombos: [],
  seoTitle: 'Minimal Test Emoji',
  seoDescription: 'A minimal emoji for testing',
};

/**
 * Full emoji - all fields populated including optional ones
 */
export const FULL_EMOJI: Emoji = {
  unicode: '1F601',
  slug: 'full-test-emoji',
  character: '😁',
  name: 'Full Test Emoji',
  shortName: 'full',
  category: 'faces',
  subcategory: 'face-positive',
  unicodeVersion: '6.0',
  baseMeaning: 'A beaming face with smiling eyes',
  tldr: 'Very happy and excited',
  contextMeanings: [
    {
      context: 'LITERAL',
      meaning: 'Genuine happiness',
      example: 'Great news! 😁',
      riskLevel: 'LOW',
    },
    {
      context: 'IRONIC',
      meaning: 'Forced or awkward smile',
      example: 'Everything is fine 😁',
      riskLevel: 'MEDIUM',
    },
  ],
  platformNotes: [
    {
      platform: 'IMESSAGE',
      note: 'Commonly used for positive reactions',
    },
    {
      platform: 'SLACK',
      note: 'Popular in team celebrations',
    },
  ],
  generationalNotes: [
    {
      generation: 'GEN_Z',
      note: 'Used sincerely for excitement',
    },
    {
      generation: 'MILLENNIAL',
      note: 'Common for expressing happiness',
    },
  ],
  warnings: [
    {
      title: 'Context Matters',
      description: 'Can seem forced in certain contexts',
      severity: 'LOW',
    },
  ],
  relatedCombos: ['happy-combo'],
  seoTitle: 'Full Test Emoji Meaning',
  seoDescription: 'A full emoji for testing all fields',
};

/**
 * Skin tone base emoji
 */
export const SKIN_TONE_BASE_EMOJI: Emoji = {
  unicode: '1F44B',
  slug: 'waving-hand',
  character: '👋',
  name: 'Waving Hand',
  shortName: 'wave',
  category: 'people',
  subcategory: 'hand-fingers-open',
  unicodeVersion: '6.0',
  baseMeaning: 'A hand waving in greeting or farewell',
  tldr: 'Hello or goodbye',
  contextMeanings: [
    {
      context: 'LITERAL',
      meaning: 'Greeting or farewell',
      example: 'Hi there 👋',
      riskLevel: 'LOW',
    },
  ],
  platformNotes: [],
  generationalNotes: [],
  warnings: [],
  relatedCombos: [],
  seoTitle: 'Waving Hand 👋 Meaning',
  seoDescription: 'Learn about the waving hand emoji',
  skinToneVariations: [
    'waving-hand-light',
    'waving-hand-medium-light',
    'waving-hand-medium',
    'waving-hand-medium-dark',
    'waving-hand-dark',
  ],
};

/**
 * Skin tone variation emoji
 */
export const SKIN_TONE_VARIATION_EMOJI: Emoji = {
  unicode: '1F44B-1F3FD',
  slug: 'waving-hand-medium',
  character: '👋🏽',
  name: 'Waving Hand: Medium Skin Tone',
  shortName: 'wave-medium',
  category: 'people',
  subcategory: 'hand-fingers-open',
  unicodeVersion: '8.0',
  baseMeaning: 'A hand waving in greeting or farewell (medium skin tone)',
  tldr: 'Hello or goodbye',
  contextMeanings: [
    {
      context: 'LITERAL',
      meaning: 'Greeting or farewell',
      example: 'Hi there 👋🏽',
      riskLevel: 'LOW',
    },
  ],
  platformNotes: [],
  generationalNotes: [],
  warnings: [],
  relatedCombos: [],
  seoTitle: 'Waving Hand Medium Skin Tone 👋🏽 Meaning',
  seoDescription: 'Learn about the waving hand emoji with medium skin tone',
  skinToneBase: 'waving-hand',
  skinToneModifier: 'medium',
};

/**
 * All emoji fixtures as an array
 */
export const ALL_EMOJI_FIXTURES: Emoji[] = [
  SKULL_EMOJI,
  FIRE_EMOJI,
  HEART_EMOJI,
  THUMBS_UP_EMOJI,
  FACE_WITH_TEARS_EMOJI,
  MINIMAL_EMOJI,
  FULL_EMOJI,
  SKIN_TONE_BASE_EMOJI,
  SKIN_TONE_VARIATION_EMOJI,
];

/**
 * Emoji summaries for all fixtures
 */
export const EMOJI_SUMMARIES: EmojiSummary[] = ALL_EMOJI_FIXTURES.map((emoji) => ({
  slug: emoji.slug,
  character: emoji.character,
  name: emoji.name,
  category: emoji.category,
  tldr: emoji.tldr,
}));

/**
 * Get a random emoji fixture
 */
export function getRandomEmojiFixture(): Emoji {
  const index = Math.floor(Math.random() * ALL_EMOJI_FIXTURES.length);
  return ALL_EMOJI_FIXTURES[index];
}

/**
 * Get an emoji fixture by slug
 */
export function getEmojiFixtureBySlug(slug: string): Emoji | undefined {
  return ALL_EMOJI_FIXTURES.find((emoji) => emoji.slug === slug);
}
