/**
 * Test fixtures - re-exports all fixture data
 */

export {
  SKULL_EMOJI,
  FIRE_EMOJI,
  HEART_EMOJI,
  THUMBS_UP_EMOJI,
  FACE_WITH_TEARS_EMOJI,
  MINIMAL_EMOJI,
  FULL_EMOJI,
  SKIN_TONE_BASE_EMOJI,
  SKIN_TONE_VARIATION_EMOJI,
  ALL_EMOJI_FIXTURES,
  EMOJI_SUMMARIES,
  getRandomEmojiFixture,
  getEmojiFixtureBySlug,
} from './emojis.fixtures';

export {
  SKULL_LAUGHING_COMBO,
  FIRE_HUNDRED_COMBO,
  HEART_EYES_COMBO,
  MINIMAL_COMBO,
  FULL_COMBO,
  ALL_COMBO_FIXTURES,
  COMBO_SUMMARIES,
  getRandomComboFixture,
  getComboFixtureBySlug,
} from './combos.fixtures';

export {
  VALID_INTERPRET_REQUESTS,
  INVALID_INTERPRET_REQUESTS,
  EDGE_CASE_MESSAGES,
  MESSAGES_WITH_MULTIPLE_EMOJIS,
  MESSAGES_BY_PLATFORM,
  MESSAGES_BY_CONTEXT,
  getRandomValidRequest,
  getRandomInvalidRequest,
} from './messages.fixtures';
