/**
 * Combo fixtures
 *
 * Curated set of emoji combo data for testing various scenarios.
 */

import type { EmojiCombo, EmojiComboSummary } from '../../../src/types/combo';

/**
 * Skull + Laughing combo - dead from laughing
 */
export const SKULL_LAUGHING_COMBO: EmojiCombo = {
  slug: 'skull-laughing',
  combo: '💀😂',
  emojis: ['skull', 'face-with-tears-of-joy'],
  name: 'Dead Laughing',
  description:
    'The quintessential Gen Z combo for something extremely funny. The skull indicates "I died laughing" while the 😂 emphasizes the laughter.',
  meaning: 'Something is so funny I died laughing',
  examples: [
    'Did you see that video? 💀😂',
    "I can't with this group chat 💀😂",
    'The way he tripped 💀😂',
  ],
  category: 'humor',
  seoTitle: 'Dead Laughing 💀😂 Meaning - Emoji Combo Explained',
  seoDescription: 'Learn what the 💀😂 combo means and how to use it.',
  relatedCombos: ['skull-skull', 'fire-skull'],
  tags: ['funny', 'laughing', 'gen-z', 'humor'],
  popularity: 95,
};

/**
 * Fire + 100 combo - something excellent
 */
export const FIRE_HUNDRED_COMBO: EmojiCombo = {
  slug: 'fire-hundred',
  combo: '🔥💯',
  emojis: ['fire', 'hundred-points'],
  name: 'Fire Hundred',
  description:
    'Used to emphasize that something is absolutely perfect or on point. Combines the "lit" meaning of fire with the perfection of 100.',
  meaning: 'Absolutely perfect, totally on point',
  examples: ['That fit is 🔥💯', "New track dropped and it's 🔥💯", 'The team nailed it 🔥💯'],
  category: 'celebration',
  seoTitle: 'Fire Hundred 🔥💯 Meaning - Emoji Combo Explained',
  seoDescription: 'Learn what the 🔥💯 combo means and when to use it.',
  relatedCombos: ['fire-fire', 'hundred-hundred'],
  tags: ['excellent', 'perfect', 'lit', 'hype'],
  popularity: 90,
};

/**
 * Heart + Heart Eyes combo - love/infatuation
 */
export const HEART_EYES_COMBO: EmojiCombo = {
  slug: 'heart-eyes',
  combo: '❤️😍',
  emojis: ['red-heart', 'smiling-face-with-heart-eyes'],
  name: 'Heart Eyes',
  description:
    'Expresses strong attraction or love. The heart confirms the romantic intent while heart eyes shows being smitten.',
  meaning: 'In love with something or someone',
  examples: ['Look at this puppy ❤️😍', 'That dress ❤️😍', 'Thinking about our date ❤️😍'],
  category: 'flirting',
  seoTitle: 'Heart Eyes ❤️😍 Meaning - Emoji Combo Explained',
  seoDescription: 'Learn what the ❤️😍 combo means in romantic contexts.',
  relatedCombos: ['heart-heart', 'sparkle-heart'],
  tags: ['love', 'attraction', 'romantic', 'crush'],
  popularity: 85,
};

/**
 * Minimal combo - only required fields
 */
export const MINIMAL_COMBO: EmojiCombo = {
  slug: 'minimal-combo',
  combo: '😀😊',
  emojis: ['grinning-face', 'smiling-face'],
  name: 'Minimal Combo',
  description: 'A minimal combo for testing.',
  meaning: 'Happy and friendly',
  examples: ['Hello 😀😊'],
  category: 'emotion',
  seoTitle: 'Minimal Combo Meaning',
  seoDescription: 'A minimal combo for testing purposes.',
};

/**
 * Full combo - all optional fields populated
 */
export const FULL_COMBO: EmojiCombo = {
  slug: 'full-combo',
  combo: '🎉🎊',
  emojis: ['party-popper', 'confetti-ball'],
  name: 'Full Celebration Combo',
  description:
    'A complete combo with all fields populated for testing. Used to celebrate special occasions.',
  meaning: 'Major celebration happening',
  examples: ['We did it! 🎉🎊', 'Happy birthday! 🎉🎊', 'Promotion announcement 🎉🎊'],
  category: 'celebration',
  seoTitle: 'Full Celebration Combo 🎉🎊 Meaning',
  seoDescription: 'A full combo for testing with all fields.',
  relatedCombos: ['party-fire', 'sparkle-party'],
  tags: ['celebration', 'party', 'happy', 'event', 'congrats'],
  popularity: 75,
};

/**
 * All combo fixtures as an array
 */
export const ALL_COMBO_FIXTURES: EmojiCombo[] = [
  SKULL_LAUGHING_COMBO,
  FIRE_HUNDRED_COMBO,
  HEART_EYES_COMBO,
  MINIMAL_COMBO,
  FULL_COMBO,
];

/**
 * Combo summaries for all fixtures
 */
export const COMBO_SUMMARIES: EmojiComboSummary[] = ALL_COMBO_FIXTURES.map((combo) => ({
  slug: combo.slug,
  combo: combo.combo,
  name: combo.name,
  meaning: combo.meaning,
  category: combo.category,
}));

/**
 * Get a random combo fixture
 */
export function getRandomComboFixture(): EmojiCombo {
  const index = Math.floor(Math.random() * ALL_COMBO_FIXTURES.length);
  return ALL_COMBO_FIXTURES[index];
}

/**
 * Get a combo fixture by slug
 */
export function getComboFixtureBySlug(slug: string): EmojiCombo | undefined {
  return ALL_COMBO_FIXTURES.find((combo) => combo.slug === slug);
}
