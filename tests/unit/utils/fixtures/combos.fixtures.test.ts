import { describe, it, expect } from 'bun:test';
import {
  SKULL_LAUGHING_COMBO,
  FIRE_HUNDRED_COMBO,
  HEART_EYES_COMBO,
  MINIMAL_COMBO,
  FULL_COMBO,
  ALL_COMBO_FIXTURES,
  COMBO_SUMMARIES,
  getRandomComboFixture,
  getComboFixtureBySlug,
} from '../../../utils/fixtures/combos.fixtures';
import {
  isValidEmojiCombo,
  isValidEmojiComboSummary,
} from '../../../utils/helpers/validation.helpers';

describe('combos.fixtures', () => {
  describe('individual combo fixtures', () => {
    it('should have valid SKULL_LAUGHING_COMBO', () => {
      expect(isValidEmojiCombo(SKULL_LAUGHING_COMBO)).toBe(true);
      expect(SKULL_LAUGHING_COMBO.slug).toBe('skull-laughing');
      expect(SKULL_LAUGHING_COMBO.combo).toBe('💀😂');
    });

    it('should have valid FIRE_HUNDRED_COMBO', () => {
      expect(isValidEmojiCombo(FIRE_HUNDRED_COMBO)).toBe(true);
      expect(FIRE_HUNDRED_COMBO.slug).toBe('fire-hundred');
      expect(FIRE_HUNDRED_COMBO.combo).toBe('🔥💯');
    });

    it('should have valid HEART_EYES_COMBO', () => {
      expect(isValidEmojiCombo(HEART_EYES_COMBO)).toBe(true);
      expect(HEART_EYES_COMBO.slug).toBe('heart-eyes');
      expect(HEART_EYES_COMBO.combo).toBe('❤️😍');
    });
  });

  describe('special combo fixtures', () => {
    it('should have valid MINIMAL_COMBO with minimum required fields', () => {
      expect(isValidEmojiCombo(MINIMAL_COMBO)).toBe(true);
      // Should have only required fields - optional fields undefined or empty
      expect(MINIMAL_COMBO.relatedCombos).toBeUndefined();
      expect(MINIMAL_COMBO.tags).toBeUndefined();
      expect(MINIMAL_COMBO.popularity).toBeUndefined();
    });

    it('should have valid FULL_COMBO with all optional fields', () => {
      expect(isValidEmojiCombo(FULL_COMBO)).toBe(true);
      // Should have all optional fields populated
      expect(FULL_COMBO.relatedCombos).toBeDefined();
      expect(Array.isArray(FULL_COMBO.relatedCombos)).toBe(true);
      expect(FULL_COMBO.relatedCombos!.length).toBeGreaterThan(0);
      expect(FULL_COMBO.tags).toBeDefined();
      expect(Array.isArray(FULL_COMBO.tags)).toBe(true);
      expect(FULL_COMBO.tags!.length).toBeGreaterThan(0);
      expect(typeof FULL_COMBO.popularity).toBe('number');
    });
  });

  describe('ALL_COMBO_FIXTURES', () => {
    it('should contain all individual fixtures', () => {
      expect(ALL_COMBO_FIXTURES.length).toBeGreaterThanOrEqual(3);
    });

    it('should have all valid combos', () => {
      ALL_COMBO_FIXTURES.forEach((combo) => {
        expect(isValidEmojiCombo(combo)).toBe(true);
      });
    });

    it('should have unique slugs', () => {
      const slugs = ALL_COMBO_FIXTURES.map((c) => c.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });
  });

  describe('COMBO_SUMMARIES', () => {
    it('should contain summaries for all fixtures', () => {
      expect(COMBO_SUMMARIES.length).toBe(ALL_COMBO_FIXTURES.length);
    });

    it('should have all valid combo summaries', () => {
      COMBO_SUMMARIES.forEach((summary) => {
        expect(isValidEmojiComboSummary(summary)).toBe(true);
      });
    });

    it('should have matching slugs with ALL_COMBO_FIXTURES', () => {
      const fixtureSlugs = new Set(ALL_COMBO_FIXTURES.map((c) => c.slug));
      COMBO_SUMMARIES.forEach((summary) => {
        expect(fixtureSlugs.has(summary.slug)).toBe(true);
      });
    });
  });

  describe('getRandomComboFixture', () => {
    it('should return a valid combo', () => {
      const combo = getRandomComboFixture();
      expect(isValidEmojiCombo(combo)).toBe(true);
    });

    it('should return combo from fixtures', () => {
      const combo = getRandomComboFixture();
      const slugs = ALL_COMBO_FIXTURES.map((c) => c.slug);
      expect(slugs).toContain(combo.slug);
    });
  });

  describe('getComboFixtureBySlug', () => {
    it('should return combo by slug', () => {
      const combo = getComboFixtureBySlug('skull-laughing');
      expect(combo).toBeDefined();
      expect(combo!.slug).toBe('skull-laughing');
      expect(combo!.combo).toBe('💀😂');
    });

    it('should return undefined for non-existent slug', () => {
      const combo = getComboFixtureBySlug('non-existent-slug');
      expect(combo).toBeUndefined();
    });

    it('should find all defined fixtures by slug', () => {
      expect(getComboFixtureBySlug('fire-hundred')).toBeDefined();
      expect(getComboFixtureBySlug('heart-eyes')).toBeDefined();
    });
  });
});
