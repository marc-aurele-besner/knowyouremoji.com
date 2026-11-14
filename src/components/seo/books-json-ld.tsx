/**
 * JSON-LD structured data for the books page.
 *
 * The page is about two books, so it publishes `Book` entities: the title,
 * the author, the cover, and the Amazon identifier. Without them the page
 * was a list of unlabelled links — an answer engine asking "who wrote the
 * emoji books?" had nothing machine-readable to read.
 *
 * The `Book` entities are built from `src/lib/book-banners.ts`, which is
 * also what the visible cards render, so the markup always describes the
 * books the reader can see. There is deliberately no `aggregateRating` or
 * `review`: the page publishes no reviews, and inventing them would be a
 * fabricated claim.
 */

import { BOOKS } from '@/lib/book-banners';
import { amazonProductUrl } from '@/lib/amazon-affiliate';

interface BooksJsonLdProps {
  /** Base URL of the application (e.g. https://knowyouremoji.com) */
  appUrl: string;
  /** Name of the application */
  appName: string;
}

/**
 * Build the `Book` JSON-LD payload for the books page.
 *
 * Exported separately so the shape can be asserted in unit tests without
 * rendering React.
 */
export function buildBooksJsonLd(appUrl: string, appName: string) {
  const baseUrl = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;

  const books = BOOKS.map((book) => ({
    '@type': 'Book' as const,
    '@id': `${baseUrl}/books#${book.id}`,
    name: book.title,
    description: book.description,
    author: {
      '@type': 'Person' as const,
      name: book.author,
    },
    publisher: {
      '@type': 'Organization' as const,
      '@id': `${baseUrl}/#organization`,
      name: appName,
      url: baseUrl,
    },
    image: {
      '@type': 'ImageObject' as const,
      url: `${baseUrl}${book.cover.src}`,
      width: book.cover.width,
      height: book.cover.height,
    },
    bookFormat: 'https://schema.org/Paperback',
    productID: `asin:${book.asin}`,
    url: amazonProductUrl(book.asin),
    inLanguage: 'en',
  }));

  return {
    '@context': 'https://schema.org',
    '@graph': books,
  };
}

/**
 * Renders `Book` JSON-LD for the books page.
 */
export function BooksJsonLd({ appUrl, appName }: BooksJsonLdProps) {
  const jsonLd = buildBooksJsonLd(appUrl, appName);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
