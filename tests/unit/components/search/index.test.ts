import { describe, it, expect } from 'bun:test';
import * as SearchExports from '@/components/search';

describe('Search component exports', () => {
  it('exports SearchBar component', () => {
    expect(SearchExports.SearchBar).toBeDefined();
    expect(typeof SearchExports.SearchBar).toBe('function');
  });

  it('exports SearchResults component', () => {
    expect(SearchExports.SearchResults).toBeDefined();
    expect(typeof SearchExports.SearchResults).toBe('function');
  });
});
