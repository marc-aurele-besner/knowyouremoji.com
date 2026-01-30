import { describe, it, expect } from 'bun:test';
import {
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
} from '../../../utils/fixtures/emojis.fixtures';
import { isValidEmoji, isValidEmojiSummary } from '../../../utils/helpers/validation.helpers';

describe('emojis.fixtures', () => {
  describe('individual emoji fixtures', () => {
    it('should have valid SKULL_EMOJI', () => {
      expect(isValidEmoji(SKULL_EMOJI)).toBe(true);
      expect(SKULL_EMOJI.slug).toBe('skull');
      expect(SKULL_EMOJI.character).toBe('💀');
    });

    it('should have valid FIRE_EMOJI', () => {
      expect(isValidEmoji(FIRE_EMOJI)).toBe(true);
      expect(FIRE_EMOJI.slug).toBe('fire');
      expect(FIRE_EMOJI.character).toBe('🔥');
    });

    it('should have valid HEART_EMOJI', () => {
      expect(isValidEmoji(HEART_EMOJI)).toBe(true);
      expect(HEART_EMOJI.slug).toBe('red-heart');
      expect(HEART_EMOJI.character).toBe('❤️');
    });

    it('should have valid THUMBS_UP_EMOJI', () => {
      expect(isValidEmoji(THUMBS_UP_EMOJI)).toBe(true);
      expect(THUMBS_UP_EMOJI.slug).toBe('thumbs-up');
      expect(THUMBS_UP_EMOJI.character).toBe('👍');
    });

    it('should have valid FACE_WITH_TEARS_EMOJI', () => {
      expect(isValidEmoji(FACE_WITH_TEARS_EMOJI)).toBe(true);
      expect(FACE_WITH_TEARS_EMOJI.slug).toBe('face-with-tears-of-joy');
      expect(FACE_WITH_TEARS_EMOJI.character).toBe('😂');
    });
  });

  describe('special emoji fixtures', () => {
    it('should have valid MINIMAL_EMOJI with minimum required fields', () => {
      expect(isValidEmoji(MINIMAL_EMOJI)).toBe(true);
      // Should have only required fields populated
      expect(MINIMAL_EMOJI.contextMeanings).toHaveLength(0);
      expect(MINIMAL_EMOJI.platformNotes).toHaveLength(0);
      expect(MINIMAL_EMOJI.generationalNotes).toHaveLength(0);
      expect(MINIMAL_EMOJI.warnings).toHaveLength(0);
    });

    it('should have valid FULL_EMOJI with all optional fields', () => {
      expect(isValidEmoji(FULL_EMOJI)).toBe(true);
      // Should have all optional fields populated
      expect(FULL_EMOJI.contextMeanings.length).toBeGreaterThan(0);
      expect(FULL_EMOJI.platformNotes.length).toBeGreaterThan(0);
      expect(FULL_EMOJI.generationalNotes.length).toBeGreaterThan(0);
      expect(FULL_EMOJI.warnings.length).toBeGreaterThan(0);
      expect(FULL_EMOJI.subcategory).toBeDefined();
    });

    it('should have valid SKIN_TONE_BASE_EMOJI', () => {
      expect(isValidEmoji(SKIN_TONE_BASE_EMOJI)).toBe(true);
      expect(SKIN_TONE_BASE_EMOJI.skinToneVariations).toBeDefined();
      expect(Array.isArray(SKIN_TONE_BASE_EMOJI.skinToneVariations)).toBe(true);
      expect(SKIN_TONE_BASE_EMOJI.skinToneVariations!.length).toBeGreaterThan(0);
    });

    it('should have valid SKIN_TONE_VARIATION_EMOJI', () => {
      expect(isValidEmoji(SKIN_TONE_VARIATION_EMOJI)).toBe(true);
      expect(SKIN_TONE_VARIATION_EMOJI.skinToneBase).toBeDefined();
      expect(SKIN_TONE_VARIATION_EMOJI.skinToneModifier).toBeDefined();
    });
  });

  describe('ALL_EMOJI_FIXTURES', () => {
    it('should contain all individual fixtures', () => {
      expect(ALL_EMOJI_FIXTURES.length).toBeGreaterThanOrEqual(5);
    });

    it('should have all valid emojis', () => {
      ALL_EMOJI_FIXTURES.forEach((emoji) => {
        expect(isValidEmoji(emoji)).toBe(true);
      });
    });

    it('should have unique slugs', () => {
      const slugs = ALL_EMOJI_FIXTURES.map((e) => e.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });
  });

  describe('EMOJI_SUMMARIES', () => {
    it('should contain summaries for all fixtures', () => {
      expect(EMOJI_SUMMARIES.length).toBe(ALL_EMOJI_FIXTURES.length);
    });

    it('should have all valid emoji summaries', () => {
      EMOJI_SUMMARIES.forEach((summary) => {
        expect(isValidEmojiSummary(summary)).toBe(true);
      });
    });

    it('should have matching slugs with ALL_EMOJI_FIXTURES', () => {
      const fixturesSlugs = new Set(ALL_EMOJI_FIXTURES.map((e) => e.slug));
      EMOJI_SUMMARIES.forEach((summary) => {
        expect(fixturesSlugs.has(summary.slug)).toBe(true);
      });
    });
  });

  describe('getRandomEmojiFixture', () => {
    it('should return a valid emoji', () => {
      const emoji = getRandomEmojiFixture();
      expect(isValidEmoji(emoji)).toBe(true);
    });

    it('should return emoji from fixtures', () => {
      const emoji = getRandomEmojiFixture();
      const slugs = ALL_EMOJI_FIXTURES.map((e) => e.slug);
      expect(slugs).toContain(emoji.slug);
    });
  });

  describe('getEmojiFixtureBySlug', () => {
    it('should return emoji by slug', () => {
      const emoji = getEmojiFixtureBySlug('skull');
      expect(emoji).toBeDefined();
      expect(emoji!.slug).toBe('skull');
      expect(emoji!.character).toBe('💀');
    });

    it('should return undefined for non-existent slug', () => {
      const emoji = getEmojiFixtureBySlug('non-existent-slug');
      expect(emoji).toBeUndefined();
    });

    it('should find all defined fixtures by slug', () => {
      expect(getEmojiFixtureBySlug('fire')).toBeDefined();
      expect(getEmojiFixtureBySlug('red-heart')).toBeDefined();
      expect(getEmojiFixtureBySlug('thumbs-up')).toBeDefined();
    });
  });
});
