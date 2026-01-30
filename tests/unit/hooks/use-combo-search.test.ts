import { describe, it, expect } from 'bun:test';
import { renderHook, act } from '@testing-library/react';
import { useComboSearch } from '@/hooks/use-combo-search';
import type { EmojiComboSummary } from '@/types/combo';

// Mock combo data for tests
const mockCombos: EmojiComboSummary[] = [
  {
    slug: 'skull-laughing',
    combo: '💀😂',
    name: 'Dead Laughing',
    meaning: 'Something is so funny I died laughing',
    category: 'humor',
  },
  {
    slug: 'heart-eyes',
    combo: '❤️😍',
    name: 'Heart Eyes',
    meaning: 'In love with something or someone',
    category: 'flirting',
  },
  {
    slug: 'fire-hundred',
    combo: '🔥💯',
    name: 'Fire Hundred',
    meaning: 'Absolutely perfect, totally on point',
    category: 'celebration',
  },
  {
    slug: 'party-popper',
    combo: '🎉🎊',
    name: 'Party Time',
    meaning: 'Major celebration happening',
    category: 'celebration',
  },
  {
    slug: 'thumbs-up-smile',
    combo: '👍😊',
    name: 'Approval Smile',
    meaning: 'Friendly approval and agreement',
    category: 'reaction',
  },
];

describe('useComboSearch', () => {
  describe('initialization', () => {
    it('should return all combos when no query is provided', () => {
      const { result } = renderHook(() => useComboSearch({ combos: mockCombos }));

      expect(result.current.results).toHaveLength(5);
      expect(result.current.query).toBe('');
      expect(result.current.category).toBe('');
    });

    it('should return empty results when combos array is empty', () => {
      const { result } = renderHook(() => useComboSearch({ combos: [] }));

      expect(result.current.results).toHaveLength(0);
    });

    it('should extract unique categories from combos', () => {
      const { result } = renderHook(() => useComboSearch({ combos: mockCombos }));

      expect(result.current.categories).toContain('humor');
      expect(result.current.categories).toContain('flirting');
      expect(result.current.categories).toContain('celebration');
      expect(result.current.categories).toContain('reaction');
      expect(result.current.categories).toHaveLength(4);
    });

    it('should sort categories alphabetically', () => {
      const { result } = renderHook(() => useComboSearch({ combos: mockCombos }));

      const categories = result.current.categories;
      const sortedCategories = [...categories].sort();
      expect(categories).toEqual(sortedCategories);
    });
  });

  describe('initial query and category', () => {
    it('should accept initial query', () => {
      const { result } = renderHook(() =>
        useComboSearch({ combos: mockCombos, initialQuery: 'skull' })
      );

      expect(result.current.query).toBe('skull');
      expect(result.current.results.some((c) => c.slug === 'skull-laughing')).toBe(true);
    });

    it('should accept initial category', () => {
      const { result } = renderHook(() =>
        useComboSearch({ combos: mockCombos, initialCategory: 'celebration' })
      );

      expect(result.current.category).toBe('celebration');
      expect(result.current.results.every((c) => c.category === 'celebration')).toBe(true);
    });

    it('should accept both initial query and category', () => {
      const { result } = renderHook(() =>
        useComboSearch({
          combos: mockCombos,
          initialQuery: 'fire',
          initialCategory: 'celebration',
        })
      );

      expect(result.current.query).toBe('fire');
      expect(result.current.category).toBe('celebration');
      expect(result.current.results.some((c) => c.slug === 'fire-hundred')).toBe(true);
      expect(result.current.results.every((c) => c.category === 'celebration')).toBe(true);
    });
  });

  describe('search by query', () => {
    it('should filter combos by name (case-insensitive)', () => {
      const { result } = renderHook(() => useComboSearch({ combos: mockCombos }));

      act(() => {
        result.current.setQuery('dead');
      });

      expect(result.current.results.some((c) => c.slug === 'skull-laughing')).toBe(true);

      act(() => {
        result.current.setQuery('DEAD');
      });

      expect(result.current.results.some((c) => c.slug === 'skull-laughing')).toBe(true);
    });

    it('should filter combos by combo characters', () => {
      const { result } = renderHook(() => useComboSearch({ combos: mockCombos }));

      act(() => {
        result.current.setQuery('💀');
      });

      expect(result.current.results.some((c) => c.combo === '💀😂')).toBe(true);
    });

    it('should filter combos by meaning', () => {
      const { result } = renderHook(() => useComboSearch({ combos: mockCombos }));

      act(() => {
        result.current.setQuery('love');
      });

      expect(result.current.results.some((c) => c.slug === 'heart-eyes')).toBe(true);
    });

    it('should filter combos by slug', () => {
      const { result } = renderHook(() => useComboSearch({ combos: mockCombos }));

      act(() => {
        result.current.setQuery('thumbs-up');
      });

      expect(result.current.results.some((c) => c.slug === 'thumbs-up-smile')).toBe(true);
    });

    it('should return empty array when no matches found', () => {
      const { result } = renderHook(() => useComboSearch({ combos: mockCombos }));

      act(() => {
        result.current.setQuery('xyznonexistent123');
      });

      expect(result.current.results).toHaveLength(0);
    });
  });

  describe('filter by category', () => {
    it('should filter combos by category', () => {
      const { result } = renderHook(() => useComboSearch({ combos: mockCombos }));

      act(() => {
        result.current.setCategory('celebration');
      });

      expect(result.current.results.every((c) => c.category === 'celebration')).toBe(true);
      expect(result.current.results.length).toBe(2);
    });

    it('should return all combos when category is empty string', () => {
      const { result } = renderHook(() => useComboSearch({ combos: mockCombos }));

      act(() => {
        result.current.setCategory('celebration');
      });

      expect(result.current.results.length).toBe(2);

      act(() => {
        result.current.setCategory('');
      });

      expect(result.current.results.length).toBe(5);
    });

    it('should return empty array for non-existent category', () => {
      const { result } = renderHook(() => useComboSearch({ combos: mockCombos }));

      act(() => {
        result.current.setCategory('non-existent-category');
      });

      expect(result.current.results).toHaveLength(0);
    });
  });

  describe('combined query and category filtering', () => {
    it('should filter by both query and category', () => {
      const { result } = renderHook(() => useComboSearch({ combos: mockCombos }));

      act(() => {
        result.current.setQuery('fire');
        result.current.setCategory('celebration');
      });

      expect(result.current.results.length).toBe(1);
      expect(result.current.results[0].slug).toBe('fire-hundred');
    });

    it('should return empty when query matches but category does not', () => {
      const { result } = renderHook(() => useComboSearch({ combos: mockCombos }));

      act(() => {
        result.current.setQuery('skull');
        result.current.setCategory('flirting');
      });

      expect(result.current.results).toHaveLength(0);
    });
  });

  describe('clearSearch', () => {
    it('should clear both query and category', () => {
      const { result } = renderHook(() => useComboSearch({ combos: mockCombos }));

      act(() => {
        result.current.setQuery('skull');
        result.current.setCategory('humor');
      });

      expect(result.current.query).toBe('skull');
      expect(result.current.category).toBe('humor');

      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.query).toBe('');
      expect(result.current.category).toBe('');
      expect(result.current.results).toHaveLength(5);
    });
  });

  describe('clearQuery', () => {
    it('should only clear query, keeping category', () => {
      const { result } = renderHook(() => useComboSearch({ combos: mockCombos }));

      act(() => {
        result.current.setQuery('skull');
        result.current.setCategory('humor');
      });

      act(() => {
        result.current.clearQuery();
      });

      expect(result.current.query).toBe('');
      expect(result.current.category).toBe('humor');
      expect(result.current.results.every((c) => c.category === 'humor')).toBe(true);
    });
  });

  describe('clearCategory', () => {
    it('should only clear category, keeping query', () => {
      const { result } = renderHook(() => useComboSearch({ combos: mockCombos }));

      act(() => {
        result.current.setQuery('skull');
        result.current.setCategory('humor');
      });

      act(() => {
        result.current.clearCategory();
      });

      expect(result.current.query).toBe('skull');
      expect(result.current.category).toBe('');
      expect(result.current.results.some((c) => c.slug === 'skull-laughing')).toBe(true);
    });
  });

  describe('result count', () => {
    it('should return correct result count', () => {
      const { result } = renderHook(() => useComboSearch({ combos: mockCombos }));

      expect(result.current.resultCount).toBe(5);

      act(() => {
        result.current.setCategory('celebration');
      });

      expect(result.current.resultCount).toBe(2);
    });
  });

  describe('isEmpty', () => {
    it('should return true when no results found', () => {
      const { result } = renderHook(() => useComboSearch({ combos: mockCombos }));

      expect(result.current.isEmpty).toBe(false);

      act(() => {
        result.current.setQuery('xyznonexistent123');
      });

      expect(result.current.isEmpty).toBe(true);
    });

    it('should return true when combos array is empty', () => {
      const { result } = renderHook(() => useComboSearch({ combos: [] }));

      expect(result.current.isEmpty).toBe(true);
    });
  });

  describe('isSearching', () => {
    it('should return true when query is not empty', () => {
      const { result } = renderHook(() => useComboSearch({ combos: mockCombos }));

      expect(result.current.isSearching).toBe(false);

      act(() => {
        result.current.setQuery('skull');
      });

      expect(result.current.isSearching).toBe(true);
    });

    it('should return false when query is empty but category is set', () => {
      const { result } = renderHook(() => useComboSearch({ combos: mockCombos }));

      act(() => {
        result.current.setCategory('humor');
      });

      expect(result.current.isSearching).toBe(false);
    });
  });

  describe('isFiltering', () => {
    it('should return true when category is set', () => {
      const { result } = renderHook(() => useComboSearch({ combos: mockCombos }));

      expect(result.current.isFiltering).toBe(false);

      act(() => {
        result.current.setCategory('humor');
      });

      expect(result.current.isFiltering).toBe(true);
    });
  });

  describe('hasActiveFilters', () => {
    it('should return true when query or category is set', () => {
      const { result } = renderHook(() => useComboSearch({ combos: mockCombos }));

      expect(result.current.hasActiveFilters).toBe(false);

      act(() => {
        result.current.setQuery('skull');
      });

      expect(result.current.hasActiveFilters).toBe(true);

      act(() => {
        result.current.clearQuery();
        result.current.setCategory('humor');
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });
  });

  describe('combo changes', () => {
    it('should update results when combos prop changes', () => {
      const { result, rerender } = renderHook(({ combos }) => useComboSearch({ combos }), {
        initialProps: { combos: mockCombos },
      });

      expect(result.current.results).toHaveLength(5);

      const newCombos = mockCombos.slice(0, 2);
      rerender({ combos: newCombos });

      expect(result.current.results).toHaveLength(2);
    });

    it('should recalculate categories when combos change', () => {
      const { result, rerender } = renderHook(({ combos }) => useComboSearch({ combos }), {
        initialProps: { combos: mockCombos },
      });

      expect(result.current.categories).toHaveLength(4);

      const newCombos = mockCombos.filter((c) => c.category === 'celebration');
      rerender({ combos: newCombos });

      expect(result.current.categories).toHaveLength(1);
      expect(result.current.categories).toContain('celebration');
    });
  });

  describe('debounced search', () => {
    it('should support debounce option', async () => {
      const { result } = renderHook(() => useComboSearch({ combos: mockCombos, debounceMs: 100 }));

      act(() => {
        result.current.setQuery('skull');
      });

      // Immediately after setting, the internal debounced query might not update
      // But the query value should be set immediately for controlled input
      expect(result.current.query).toBe('skull');

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(result.current.results.some((c) => c.slug === 'skull-laughing')).toBe(true);
    });

    it('should work without debounce (default)', () => {
      const { result } = renderHook(() => useComboSearch({ combos: mockCombos }));

      act(() => {
        result.current.setQuery('skull');
      });

      // Results should update immediately
      expect(result.current.results.some((c) => c.slug === 'skull-laughing')).toBe(true);
    });
  });

  describe('totalCount', () => {
    it('should return total count of combos regardless of filters', () => {
      const { result } = renderHook(() => useComboSearch({ combos: mockCombos }));

      expect(result.current.totalCount).toBe(5);

      act(() => {
        result.current.setCategory('celebration');
      });

      // totalCount should remain 5 even with filter applied
      expect(result.current.totalCount).toBe(5);
      expect(result.current.resultCount).toBe(2);
    });
  });
});
