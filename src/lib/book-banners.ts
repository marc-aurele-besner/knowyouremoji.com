/**
 * Book catalog and banner variants shared by the banner component, the
 * books page and the event API.
 */

export const BOOKS = [
  {
    id: 'teen-texts',
    title: "The Parent's Guide to Decoding Your Teen's Texts",
    author: 'Claire Vance',
    url: 'https://www.amazon.com/dp/B0HN32NYYX',
    cover: { src: '/books-images/book-cover-thumb.png', width: 300, height: 400 },
    audience: 'For parents',
    description:
      'Decode the slang, emojis, and abbreviations your teen uses every day — from “ts pmo 😭🥀🗿” to the passive-aggressive 👍 — before a misread text turns into an argument.',
  },
  {
    id: 'work-emoji',
    title: 'Don’t 👍 Your Boss: Know Your Emoji at Work',
    author: 'Claire Vance',
    url: 'https://www.amazon.com/dp/B0HPGNF1QW',
    cover: { src: '/books-images/boss-cover-thumb.png', width: 300, height: 400 },
    audience: 'For professionals',
    description:
      'Learn the unspoken rules of workplace emojis, Slack reactions, and digital tone — so one yellow thumb never stalls six hours of work again.',
  },
] as const;

export type Book = (typeof BOOKS)[number];
export type BookId = Book['id'];

export function getBook(id: BookId): Book {
  return BOOKS.find((book) => book.id === id) as Book;
}

/** Inline card headline variants; each id is what gets recorded in book_banner_events. */
export const BOOK_BANNERS = [
  { id: 'card-texting-in-code', book: 'teen-texts', headline: 'Is your teen texting in code?' },
  { id: 'card-ts-pmo', book: 'teen-texts', headline: 'What does “ts pmo 😭🥀🗿” really mean?' },
  {
    id: 'card-boss-thumbs-up',
    book: 'work-emoji',
    headline: 'Did your 👍 just stall the project?',
  },
  {
    id: 'card-boss-just-said',
    book: 'work-emoji',
    headline: 'Are you sure you know what you just said?',
  },
] as const;

/** Full-width image variants, used on landing and index pages. */
export const BOOK_WIDE_BANNERS = [
  {
    id: 'book-cover-01',
    book: 'teen-texts',
    src: '/books-images/book-cover-01.png',
    width: 2480,
    height: 618,
  },
  {
    id: 'book-cover-02',
    book: 'teen-texts',
    src: '/books-images/book-cover-02.png',
    width: 2479,
    height: 620,
  },
  {
    id: 'boss-banner-01',
    book: 'work-emoji',
    src: '/books-images/boss-banner-01.png',
    width: 2481,
    height: 619,
  },
  {
    id: 'boss-banner-02',
    book: 'work-emoji',
    src: '/books-images/boss-banner-02.png',
    width: 2481,
    height: 619,
  },
  {
    id: 'boss-banner-03',
    book: 'work-emoji',
    src: '/books-images/boss-banner-03.png',
    width: 2477,
    height: 618,
  },
  {
    id: 'boss-banner-04',
    book: 'work-emoji',
    src: '/books-images/boss-banner-04.png',
    width: 2481,
    height: 623,
  },
] as const;

export type BookBanner = (typeof BOOK_BANNERS)[number];
export type BookWideBanner = (typeof BOOK_WIDE_BANNERS)[number];

export const BOOK_BANNER_IDS: readonly string[] = [...BOOK_BANNERS, ...BOOK_WIDE_BANNERS].map(
  (banner) => banner.id
);
