/**
 * Book banner catalog shared by the banner component and the event API.
 */

export const BOOK_URL = 'https://www.amazon.com/dp/B0HN32NYYX';

export const BOOK_BANNERS = [
  { id: 'book-cover-01', src: '/books-images/book-cover-01.png', width: 2480, height: 618 },
  { id: 'book-cover-02', src: '/books-images/book-cover-02.png', width: 2479, height: 620 },
] as const;

export type BookBanner = (typeof BOOK_BANNERS)[number];

export const BOOK_BANNER_IDS: readonly string[] = BOOK_BANNERS.map((banner) => banner.id);
