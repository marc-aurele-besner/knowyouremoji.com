import { describe, it, expect } from 'bun:test';
import { renderHook, act } from '@testing-library/react';
import { useEmojiSearch } from '@/hooks/use-emoji-search';
import type { EmojiSummary } from '@/types/emoji';

// Mock emoji data for tests
const mockEmojis: EmojiSummary[] = [
  {
    slug: 'skull',
    character: '💀',
    name: 'Skull',
    category: 'faces',
    tldr: "Usually means 'that's so funny I'm dead' or ironic disbelief.",
  },
  {
    slug: 'heart',
    character: '❤️',
    name: 'Red Heart',
    category: 'symbols',
    tldr: 'Classic symbol of love and affection.',
  },
  {
    slug: 'fire',
    character: '🔥',
    name: 'Fire',
    category: 'travel',
    tldr: 'Means something is hot, cool, or exciting.',
  },
  {
    slug: 'laughing-face',
    character: '😂',
    name: 'Laughing Face With Tears',
    category: 'faces',
    tldr: 'Indicates something is funny.',
  },
  {
    slug: 'thumbs-up',
    character: '👍',
    name: 'Thumbs Up',
    category: 'people',
    tldr: 'Approval or agreement sign.',
  },
];

describe('useEmojiSearch', () => {
  describe('initialization', () => {
    it('should return all emojis when no query is provided', () => {
      const { result } = renderHook(() => useEmojiSearch({ emojis: mockEmojis }));

      expect(result.current.results).toHaveLength(5);
      expect(result.current.query).toBe('');
      expect(result.current.category).toBe('');
    });

    it('should return empty results when emojis array is empty', () => {
      const { result } = renderHook(() => useEmojiSearch({ emojis: [] }));

      expect(result.current.results).toHaveLength(0);
    });

    it('should extract unique categories from emojis', () => {
      const { result } = renderHook(() => useEmojiSearch({ emojis: mockEmojis }));

      expect(result.current.categories).toContain('faces');
      expect(result.current.categories).toContain('symbols');
      expect(result.current.categories).toContain('travel');
      expect(result.current.categories).toContain('people');
      expect(result.current.categories).toHaveLength(4);
    });

    it('should sort categories alphabetically', () => {
      const { result } = renderHook(() => useEmojiSearch({ emojis: mockEmojis }));

      const categories = result.current.categories;
      const sortedCategories = [...categories].sort();
      expect(categories).toEqual(sortedCategories);
    });
  });

  describe('initial query and category', () => {
    it('should accept initial query', () => {
      const { result } = renderHook(() =>
        useEmojiSearch({ emojis: mockEmojis, initialQuery: 'skull' })
      );

      expect(result.current.query).toBe('skull');
      expect(result.current.results.some((e) => e.slug === 'skull')).toBe(true);
    });

    it('should accept initial category', () => {
      const { result } = renderHook(() =>
        useEmojiSearch({ emojis: mockEmojis, initialCategory: 'faces' })
      );

      expect(result.current.category).toBe('faces');
      expect(result.current.results.every((e) => e.category === 'faces')).toBe(true);
    });

    it('should accept both initial query and category', () => {
      const { result } = renderHook(() =>
        useEmojiSearch({
          emojis: mockEmojis,
          initialQuery: 'laugh',
          initialCategory: 'faces',
        })
      );

      expect(result.current.query).toBe('laugh');
      expect(result.current.category).toBe('faces');
      expect(result.current.results.some((e) => e.slug === 'laughing-face')).toBe(true);
      expect(result.current.results.every((e) => e.category === 'faces')).toBe(true);
    });
  });

  describe('search by query', () => {
    it('should filter emojis by name (case-insensitive)', () => {
      const { result } = renderHook(() => useEmojiSearch({ emojis: mockEmojis }));

      act(() => {
        result.current.setQuery('skull');
      });

      expect(result.current.results.some((e) => e.slug === 'skull')).toBe(true);

      act(() => {
        result.current.setQuery('SKULL');
      });

      expect(result.current.results.some((e) => e.slug === 'skull')).toBe(true);
    });

    it('should filter emojis by character', () => {
      const { result } = renderHook(() => useEmojiSearch({ emojis: mockEmojis }));

      act(() => {
        result.current.setQuery('💀');
      });

      expect(result.current.results.some((e) => e.character === '💀')).toBe(true);
    });

    it('should filter emojis by category keyword', () => {
      const { result } = renderHook(() => useEmojiSearch({ emojis: mockEmojis }));

      act(() => {
        result.current.setQuery('faces');
      });

      expect(result.current.results.some((e) => e.category === 'faces')).toBe(true);
    });

    it('should filter emojis by tldr content', () => {
      const { result } = renderHook(() => useEmojiSearch({ emojis: mockEmojis }));

      act(() => {
        result.current.setQuery('love');
      });

      expect(result.current.results.some((e) => e.slug === 'heart')).toBe(true);
    });

    it('should filter emojis by slug', () => {
      const { result } = renderHook(() => useEmojiSearch({ emojis: mockEmojis }));

      act(() => {
        result.current.setQuery('thumbs-up');
      });

      expect(result.current.results.some((e) => e.slug === 'thumbs-up')).toBe(true);
    });

    it('should return empty array when no matches found', () => {
      const { result } = renderHook(() => useEmojiSearch({ emojis: mockEmojis }));

      act(() => {
        result.current.setQuery('xyznonexistent123');
      });

      expect(result.current.results).toHaveLength(0);
    });
  });

  describe('filter by category', () => {
    it('should filter emojis by category', () => {
      const { result } = renderHook(() => useEmojiSearch({ emojis: mockEmojis }));

      act(() => {
        result.current.setCategory('faces');
      });

      expect(result.current.results.every((e) => e.category === 'faces')).toBe(true);
      expect(result.current.results.length).toBe(2);
    });

    it('should return all emojis when category is empty string', () => {
      const { result } = renderHook(() => useEmojiSearch({ emojis: mockEmojis }));

      act(() => {
        result.current.setCategory('faces');
      });

      expect(result.current.results.length).toBe(2);

      act(() => {
        result.current.setCategory('');
      });

      expect(result.current.results.length).toBe(5);
    });

    it('should return empty array for non-existent category', () => {
      const { result } = renderHook(() => useEmojiSearch({ emojis: mockEmojis }));

      act(() => {
        result.current.setCategory('non-existent-category');
      });

      expect(result.current.results).toHaveLength(0);
    });
  });

  describe('combined query and category filtering', () => {
    it('should filter by both query and category', () => {
      const { result } = renderHook(() => useEmojiSearch({ emojis: mockEmojis }));

      act(() => {
        result.current.setQuery('laugh');
        result.current.setCategory('faces');
      });

      expect(result.current.results.length).toBe(1);
      expect(result.current.results[0].slug).toBe('laughing-face');
    });

    it('should return empty when query matches but category does not', () => {
      const { result } = renderHook(() => useEmojiSearch({ emojis: mockEmojis }));

      act(() => {
        result.current.setQuery('skull');
        result.current.setCategory('symbols');
      });

      expect(result.current.results).toHaveLength(0);
    });
  });

  describe('clearSearch', () => {
    it('should clear both query and category', () => {
      const { result } = renderHook(() => useEmojiSearch({ emojis: mockEmojis }));

      act(() => {
        result.current.setQuery('skull');
        result.current.setCategory('faces');
      });

      expect(result.current.query).toBe('skull');
      expect(result.current.category).toBe('faces');

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
      const { result } = renderHook(() => useEmojiSearch({ emojis: mockEmojis }));

      act(() => {
        result.current.setQuery('skull');
        result.current.setCategory('faces');
      });

      act(() => {
        result.current.clearQuery();
      });

      expect(result.current.query).toBe('');
      expect(result.current.category).toBe('faces');
      expect(result.current.results.every((e) => e.category === 'faces')).toBe(true);
    });
  });

  describe('clearCategory', () => {
    it('should only clear category, keeping query', () => {
      const { result } = renderHook(() => useEmojiSearch({ emojis: mockEmojis }));

      act(() => {
        result.current.setQuery('skull');
        result.current.setCategory('faces');
      });

      act(() => {
        result.current.clearCategory();
      });

      expect(result.current.query).toBe('skull');
      expect(result.current.category).toBe('');
      expect(result.current.results.some((e) => e.slug === 'skull')).toBe(true);
    });
  });

  describe('result count', () => {
    it('should return correct result count', () => {
      const { result } = renderHook(() => useEmojiSearch({ emojis: mockEmojis }));

      expect(result.current.resultCount).toBe(5);

      act(() => {
        result.current.setCategory('faces');
      });

      expect(result.current.resultCount).toBe(2);
    });
  });

  describe('isEmpty', () => {
    it('should return true when no results found', () => {
      const { result } = renderHook(() => useEmojiSearch({ emojis: mockEmojis }));

      expect(result.current.isEmpty).toBe(false);

      act(() => {
        result.current.setQuery('xyznonexistent123');
      });

      expect(result.current.isEmpty).toBe(true);
    });

    it('should return true when emojis array is empty', () => {
      const { result } = renderHook(() => useEmojiSearch({ emojis: [] }));

      expect(result.current.isEmpty).toBe(true);
    });
  });

  describe('isSearching', () => {
    it('should return true when query is not empty', () => {
      const { result } = renderHook(() => useEmojiSearch({ emojis: mockEmojis }));

      expect(result.current.isSearching).toBe(false);

      act(() => {
        result.current.setQuery('skull');
      });

      expect(result.current.isSearching).toBe(true);
    });

    it('should return false when query is empty but category is set', () => {
      const { result } = renderHook(() => useEmojiSearch({ emojis: mockEmojis }));

      act(() => {
        result.current.setCategory('faces');
      });

      expect(result.current.isSearching).toBe(false);
    });
  });

  describe('isFiltering', () => {
    it('should return true when category is set', () => {
      const { result } = renderHook(() => useEmojiSearch({ emojis: mockEmojis }));

      expect(result.current.isFiltering).toBe(false);

      act(() => {
        result.current.setCategory('faces');
      });

      expect(result.current.isFiltering).toBe(true);
    });
  });

  describe('hasActiveFilters', () => {
    it('should return true when query or category is set', () => {
      const { result } = renderHook(() => useEmojiSearch({ emojis: mockEmojis }));

      expect(result.current.hasActiveFilters).toBe(false);

      act(() => {
        result.current.setQuery('skull');
      });

      expect(result.current.hasActiveFilters).toBe(true);

      act(() => {
        result.current.clearQuery();
        result.current.setCategory('faces');
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });
  });

  describe('emoji changes', () => {
    it('should update results when emojis prop changes', () => {
      const { result, rerender } = renderHook(({ emojis }) => useEmojiSearch({ emojis }), {
        initialProps: { emojis: mockEmojis },
      });

      expect(result.current.results).toHaveLength(5);

      const newEmojis = mockEmojis.slice(0, 2);
      rerender({ emojis: newEmojis });

      expect(result.current.results).toHaveLength(2);
    });

    it('should recalculate categories when emojis change', () => {
      const { result, rerender } = renderHook(({ emojis }) => useEmojiSearch({ emojis }), {
        initialProps: { emojis: mockEmojis },
      });

      expect(result.current.categories).toHaveLength(4);

      const newEmojis = mockEmojis.filter((e) => e.category === 'faces');
      rerender({ emojis: newEmojis });

      expect(result.current.categories).toHaveLength(1);
      expect(result.current.categories).toContain('faces');
    });
  });

  describe('debounced search', () => {
    it('should support debounce option', async () => {
      const { result } = renderHook(() => useEmojiSearch({ emojis: mockEmojis, debounceMs: 100 }));

      act(() => {
        result.current.setQuery('skull');
      });

      // Immediately after setting, the internal debounced query might not update
      // But the query value should be set immediately for controlled input
      expect(result.current.query).toBe('skull');

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(result.current.results.some((e) => e.slug === 'skull')).toBe(true);
    });

    it('should work without debounce (default)', () => {
      const { result } = renderHook(() => useEmojiSearch({ emojis: mockEmojis }));

      act(() => {
        result.current.setQuery('skull');
      });

      // Results should update immediately
      expect(result.current.results.some((e) => e.slug === 'skull')).toBe(true);
    });
  });

  describe('totalCount', () => {
    it('should return total count of emojis regardless of filters', () => {
      const { result } = renderHook(() => useEmojiSearch({ emojis: mockEmojis }));

      expect(result.current.totalCount).toBe(5);

      act(() => {
        result.current.setCategory('faces');
      });

      // totalCount should remain 5 even with filter applied
      expect(result.current.totalCount).toBe(5);
      expect(result.current.resultCount).toBe(2);
    });
  });
});
