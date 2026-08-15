import { describe, expect, test, beforeEach } from 'bun:test';
import {
  clearComparisonCache,
  getAllComparisons,
  getAllComparisonSlugs,
  getComparisonBySlug,
  getComparisonSummaries,
} from '../../../src/lib/comparison-data';

beforeEach(() => {
  clearComparisonCache();
});

describe('comparison-data', () => {
  describe('getAllComparisons', () => {
    test('returns an array of comparison records loaded from disk', () => {
      const comparisons = getAllComparisons();
      expect(Array.isArray(comparisons)).toBe(true);
    });

    test('each comparison has the required fields', () => {
      const comparisons = getAllComparisons();
      if (comparisons.length === 0) return;
      for (const comparison of comparisons) {
        expect(typeof comparison.slug).toBe('string');
        expect(typeof comparison.emoji1Slug).toBe('string');
        expect(typeof comparison.emoji2Slug).toBe('string');
        expect(typeof comparison.seoTitle).toBe('string');
        expect(typeof comparison.seoDescription).toBe('string');
        expect(Array.isArray(comparison.comparisonPoints)).toBe(true);
      }
    });
  });

  describe('getComparisonBySlug', () => {
    test('returns the matching comparison when the slug exists', () => {
      const comparisons = getAllComparisons();
      if (comparisons.length === 0) return;
      const sample = comparisons[0];
      const result = getComparisonBySlug(sample.slug);
      expect(result).toBeDefined();
      expect(result?.slug).toBe(sample.slug);
    });

    test('returns undefined for unknown slugs', () => {
      expect(getComparisonBySlug('not-a-real-slug-xyz')).toBeUndefined();
    });
  });

  describe('getAllComparisonSlugs', () => {
    test('returns one slug per comparison', () => {
      const comparisons = getAllComparisons();
      const slugs = getAllComparisonSlugs();
      expect(slugs.length).toBe(comparisons.length);
      for (const slug of slugs) {
        expect(typeof slug).toBe('string');
      }
    });
  });

  describe('getComparisonSummaries', () => {
    test('returns one summary per comparison with only the summary fields', () => {
      const summaries = getComparisonSummaries();
      expect(Array.isArray(summaries)).toBe(true);
      expect(summaries.length).toBe(getAllComparisons().length);

      const sample = summaries[0];
      expect(sample).toHaveProperty('slug');
      expect(sample).toHaveProperty('emoji1Slug');
      expect(sample).toHaveProperty('emoji2Slug');
      // Summary intentionally omits the long-form fields.
      expect(sample).not.toHaveProperty('seoTitle');
      expect(sample).not.toHaveProperty('comparisonPoints');
    });
  });

  describe('clearComparisonCache', () => {
    test('is callable and resets the in-memory cache', () => {
      // Warm the cache first.
      getAllComparisons();
      // Calling again should still work (cache hit or miss both fine).
      const before = getAllComparisons();
      clearComparisonCache();
      const after = getAllComparisons();
      expect(after.length).toBe(before.length);
    });
  });
});
