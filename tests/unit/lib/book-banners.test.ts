import { describe, it, expect } from 'bun:test';
import { BOOK_BANNERS, BOOK_BANNER_IDS, BOOK_COVER, BOOK_URL } from '@/lib/book-banners';

describe('book-banners', () => {
  it('links to the book on Amazon', () => {
    expect(BOOK_URL).toBe('https://www.amazon.com/dp/B0HN32NYYX');
  });

  it('exposes one id per banner', () => {
    expect(BOOK_BANNER_IDS).toEqual(BOOK_BANNERS.map((banner) => banner.id));
    expect(new Set(BOOK_BANNER_IDS).size).toBe(BOOK_BANNERS.length);
  });

  it('gives every banner a headline', () => {
    for (const banner of BOOK_BANNERS) {
      expect(banner.headline.length).toBeGreaterThan(0);
    }
  });

  it('serves the cover thumbnail from public/books-images', async () => {
    expect(BOOK_COVER.src).toBe('/books-images/book-cover-thumb.png');
    expect(await Bun.file(`public${BOOK_COVER.src}`).exists()).toBe(true);
  });
});
