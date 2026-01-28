/**
 * Emoji data exports
 *
 * This file re-exports the emoji data loader functions for convenience.
 */

export {
  getAllEmojis,
  getEmojiBySlug,
  getEmojisByCategory,
  getAllCategories,
  searchEmojis,
  getEmojiCount,
  getEmojiSummaries,
  getAllEmojiSlugs,
  clearEmojiCache,
} from '@/lib/emoji-data';
