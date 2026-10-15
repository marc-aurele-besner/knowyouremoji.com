import { describe, it, expect } from 'bun:test';
import { BOOK_BANNERS, BOOK_BANNER_IDS, BOOK_URL } from '@/lib/book-banners';

describe('book-banners', () => {
  it('links to the book on Amazon', () => {
    expect(BOOK_URL).toBe('https://www.amazon.com/dp/B0HN32NYYX');
  });

  it('exposes one id per banner', () => {
    expect(BOOK_BANNER_IDS).toEqual(BOOK_BANNERS.map((banner) => banner.id));
    expect(new Set(BOOK_BANNER_IDS).size).toBe(BOOK_BANNERS.length);
  });

  it('serves every banner from public/books-images', () => {
    for (const banner of BOOK_BANNERS) {
      expect(banner.src).toBe(`/books-images/${banner.id}.png`);
    }
  });
});
