import { describe, it, expect } from 'bun:test';
import {
  EMOJI_CATEGORY_SLUGS,
  CATEGORY_DISPLAY_NAMES,
  CATEGORY_DESCRIPTIONS,
  CATEGORY_ALIASES,
  resolveCategorySlug,
  isValidCategorySlug,
  getCategoryDisplayName,
  getCategoryDescription,
} from '@/lib/emoji-taxonomy';

describe('emoji-taxonomy', () => {
  describe('EMOJI_CATEGORY_SLUGS', () => {
    it('lists the nine canonical categories', () => {
      expect(EMOJI_CATEGORY_SLUGS).toHaveLength(9);
      expect([...EMOJI_CATEGORY_SLUGS]).toEqual([
        'faces',
        'people',
        'animals',
        'food',
        'travel',
        'activities',
        'objects',
        'symbols',
        'flags',
      ]);
    });
  });

  describe('resolveCategorySlug', () => {
    it('resolves every legacy alias onto a canonical slug', () => {
      for (const [alias, canonical] of Object.entries(CATEGORY_ALIASES)) {
        expect(resolveCategorySlug(alias)).toBe(canonical);
        expect(isValidCategorySlug(resolveCategorySlug(alias))).toBe(true);
      }
    });

    it('maps the aliases the corpus actually uses', () => {
      expect(resolveCategorySlug('food-drink')).toBe('food');
      expect(resolveCategorySlug('animals-nature')).toBe('animals');
      expect(resolveCategorySlug('nature')).toBe('animals');
      expect(resolveCategorySlug('smileys-emotion')).toBe('faces');
      expect(resolveCategorySlug('smileys')).toBe('faces');
      expect(resolveCategorySlug('sky-weather')).toBe('travel');
      expect(resolveCategorySlug('weather')).toBe('travel');
      expect(resolveCategorySlug('travel-places')).toBe('travel');
      expect(resolveCategorySlug('people-body')).toBe('people');
      expect(resolveCategorySlug('People & Body')).toBe('people');
      expect(resolveCategorySlug('celebration')).toBe('activities');
    });

    it('leaves a canonical slug untouched', () => {
      for (const slug of EMOJI_CATEGORY_SLUGS) {
        expect(resolveCategorySlug(slug)).toBe(slug);
      }
    });

    it('returns an unknown category unchanged rather than dropping it', () => {
      expect(resolveCategorySlug('brand-new-category')).toBe('brand-new-category');
    });
  });

  describe('isValidCategorySlug', () => {
    it('accepts the canonical slugs', () => {
      for (const slug of EMOJI_CATEGORY_SLUGS) {
        expect(isValidCategorySlug(slug)).toBe(true);
      }
    });

    it('rejects a legacy alias', () => {
      expect(isValidCategorySlug('smileys-emotion')).toBe(false);
      expect(isValidCategorySlug('People & Body')).toBe(false);
    });

    it('rejects an unknown category', () => {
      expect(isValidCategorySlug('nope')).toBe(false);
    });
  });

  describe('getCategoryDisplayName', () => {
    it('returns the display name for a canonical slug', () => {
      expect(getCategoryDisplayName('faces')).toBe('Smileys & Faces');
      expect(getCategoryDisplayName('animals')).toBe('Animals & Nature');
    });

    it('returns the same display name for a legacy alias', () => {
      expect(getCategoryDisplayName('smileys-emotion')).toBe('Smileys & Faces');
      expect(getCategoryDisplayName('People & Body')).toBe('People & Body');
    });

    it('falls back to a capitalized slug for an unknown category', () => {
      expect(getCategoryDisplayName('brand-new-category')).toBe('Brand-new-category');
    });
  });

  describe('getCategoryDescription', () => {
    it('returns the description for a canonical slug', () => {
      expect(getCategoryDescription('faces')).toBe(CATEGORY_DESCRIPTIONS.faces);
    });

    it('returns the canonical description for a legacy alias', () => {
      expect(getCategoryDescription('nature')).toBe(CATEGORY_DESCRIPTIONS.animals);
    });

    it('falls back to a generic description for an unknown category', () => {
      expect(getCategoryDescription('brand-new-category')).toBe(
        'Explore brand-new-category emojis and their meanings in context.'
      );
    });
  });

  describe('CATEGORY_DISPLAY_NAMES', () => {
    it('has a display name for every canonical slug', () => {
      for (const slug of EMOJI_CATEGORY_SLUGS) {
        expect(CATEGORY_DISPLAY_NAMES[slug]).toBeDefined();
      }
    });
  });

  describe('CATEGORY_DESCRIPTIONS', () => {
    it('has a description for every canonical slug', () => {
      for (const slug of EMOJI_CATEGORY_SLUGS) {
        expect(CATEGORY_DESCRIPTIONS[slug]).toBeDefined();
      }
    });
  });
});
