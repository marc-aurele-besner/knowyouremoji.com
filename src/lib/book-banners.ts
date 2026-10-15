/**
 * Book banner catalog shared by the banner component and the event API.
 */

export const BOOK_URL = 'https://www.amazon.com/dp/B0HN32NYYX';

export const BOOK_COVER = {
  src: '/books-images/book-cover-thumb.png',
  width: 300,
  height: 400,
} as const;

/** Headline variants; each id is what gets recorded in book_banner_events. */
export const BOOK_BANNERS = [
  { id: 'card-texting-in-code', headline: 'Is your teen texting in code?' },
  { id: 'card-ts-pmo', headline: 'What does “ts pmo 😭🥀🗿” really mean?' },
] as const;

export type BookBanner = (typeof BOOK_BANNERS)[number];

export const BOOK_BANNER_IDS: readonly string[] = BOOK_BANNERS.map((banner) => banner.id);
