import { describe, it, expect } from 'bun:test';
import {
  BOOKS,
  BOOK_BANNERS,
  BOOK_BANNER_IDS,
  BOOK_WIDE_BANNERS,
  getBook,
} from '@/lib/book-banners';

describe('book-banners', () => {
  it('links every book to its Amazon page', () => {
    expect(getBook('teen-texts').url).toBe('https://www.amazon.com/dp/B0HN32NYYX');
    expect(getBook('work-emoji').url).toBe('https://www.amazon.com/dp/B0HPGNF1QW');
  });

  it('gives every book a unique id', () => {
    expect(new Set(BOOKS.map((book) => book.id)).size).toBe(BOOKS.length);
  });

  it('exposes one unique id per inline and wide banner', () => {
    const all = [...BOOK_BANNERS, ...BOOK_WIDE_BANNERS];
    expect(BOOK_BANNER_IDS).toEqual(all.map((banner) => banner.id));
    expect(new Set(BOOK_BANNER_IDS).size).toBe(all.length);
  });

  it('gives every book at least one inline and one wide banner', () => {
    for (const book of BOOKS) {
      expect(BOOK_BANNERS.some((banner) => banner.book === book.id)).toBe(true);
      expect(BOOK_WIDE_BANNERS.some((banner) => banner.book === book.id)).toBe(true);
    }
  });

  it('serves every wide banner image from public/books-images', async () => {
    for (const banner of BOOK_WIDE_BANNERS) {
      expect(banner.src).toBe(`/books-images/${banner.id}.png`);
      expect(await Bun.file(`public${banner.src}`).exists()).toBe(true);
    }
  });

  it('gives every banner a headline', () => {
    for (const banner of BOOK_BANNERS) {
      expect(banner.headline.length).toBeGreaterThan(0);
    }
  });

  it('serves every cover thumbnail from public/books-images', async () => {
    for (const book of BOOKS) {
      expect(book.cover.src.startsWith('/books-images/')).toBe(true);
      expect(await Bun.file(`public${book.cover.src}`).exists()).toBe(true);
    }
  });
});
