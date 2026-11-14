import { describe, expect, test } from 'bun:test';
import { COMBO_ALIASES, isComboAlias, getCanonicalComboSlug } from '../../../src/lib/combo-aliases';
import { getAllCombos } from '../../../src/lib/combo-data';

describe('combo-aliases', () => {
  describe('COMBO_ALIASES', () => {
    test('maps every alias to a slug that is not itself an alias', () => {
      for (const [alias, owner] of Object.entries(COMBO_ALIASES)) {
        expect(owner).not.toBe(alias);
        expect(isComboAlias(owner)).toBe(false);
      }
    });

    test('points every alias at a slug that exists in the catalog', () => {
      const slugs = new Set(getAllCombos().map((combo) => combo.slug));

      for (const owner of Object.values(COMBO_ALIASES)) {
        expect(slugs.has(owner)).toBe(true);
      }
    });

    test('covers the duplicates the catalog actually publishes', () => {
      // The combo catalog publishes the same drawing under several slugs.
      // If this ever comes back empty, the duplicate problem is gone and
      // the map can be deleted rather than kept as dead weight.
      expect(Object.keys(COMBO_ALIASES).length).toBeGreaterThan(0);
    });
  });

  describe('isComboAlias', () => {
    test('is true for a slug that duplicates another page', () => {
      const alias = Object.keys(COMBO_ALIASES)[0];
      expect(isComboAlias(alias)).toBe(true);
    });

    test('is false for a slug that owns its glyph', () => {
      expect(isComboAlias('rainbow-cloud')).toBe(false);
    });

    test('is false for a slug that is not in the catalog at all', () => {
      expect(isComboAlias('no-such-combo')).toBe(false);
    });

    test('does not treat inherited object properties as aliases', () => {
      // `Object.hasOwn` rather than a truthy lookup: a slug called
      // "constructor" is not an alias.
      expect(isComboAlias('constructor')).toBe(false);
      expect(isComboAlias('toString')).toBe(false);
    });
  });

  describe('getCanonicalComboSlug', () => {
    test('returns the owner for an alias', () => {
      const alias = Object.keys(COMBO_ALIASES)[0];
      const owner = COMBO_ALIASES[alias];

      expect(getCanonicalComboSlug(alias)).toBe(owner);
    });

    test('returns the slug itself when it is not an alias', () => {
      expect(getCanonicalComboSlug('rainbow-cloud')).toBe('rainbow-cloud');
    });
  });
});
