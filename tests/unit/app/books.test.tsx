import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { render, screen, cleanup, within } from '@testing-library/react';
import { generateMetadata, default as BooksPage } from '../../../src/app/books/page';
import { BOOKS } from '../../../src/lib/book-banners';
import { AMAZON_DISCLOSURE, amazonProductUrl } from '../../../src/lib/amazon-affiliate';

const TESTED_KEYS = [
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_APP_NAME',
  'NEXT_PUBLIC_AMZN_TAG',
] as const;
const savedEnv: Record<string, string | undefined> = {};

describe('Books Page', () => {
  beforeEach(() => {
    for (const key of TESTED_KEYS) savedEnv[key] = process.env[key];
    process.env.NEXT_PUBLIC_APP_URL = 'https://knowyouremoji.com';
    process.env.NEXT_PUBLIC_APP_NAME = 'KnowYourEmoji';
    Reflect.deleteProperty(process.env, 'NEXT_PUBLIC_AMZN_TAG');
  });

  afterEach(() => {
    cleanup();
    for (const key of TESTED_KEYS) {
      if (savedEnv[key] === undefined) delete process.env[key];
      else process.env[key] = savedEnv[key];
    }
  });

  describe('generateMetadata', () => {
    test('sets the title, description and canonical URL', () => {
      const metadata = generateMetadata();
      expect(metadata.title).toBe('Books | KnowYourEmoji');
      expect(metadata.description).toContain('Claire Vance');
      const alternates = metadata.alternates as { canonical?: string };
      expect(alternates.canonical).toBe('https://knowyouremoji.com/books');
    });

    test('includes Open Graph and Twitter cards', () => {
      const metadata = generateMetadata();
      const openGraph = metadata.openGraph as { url?: string };
      expect(openGraph.url).toBe('https://knowyouremoji.com/books');
      const twitter = metadata.twitter as { card?: string };
      expect(twitter.card).toBe('summary_large_image');
    });
  });

  describe('BooksPage', () => {
    test('renders a single h1 and breadcrumbs', () => {
      render(<BooksPage />);
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
      expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
    });

    test('lists every book with its cover, author and Amazon link', () => {
      render(<BooksPage />);
      const items = within(screen.getByTestId('books-list')).getAllByRole('listitem');
      expect(items).toHaveLength(BOOKS.length);

      BOOKS.forEach((book, index) => {
        const item = within(items[index]);
        expect(item.getByRole('heading', { level: 2, name: book.title })).toBeInTheDocument();
        expect(item.getByAltText(`Cover of ${book.title}`)).toBeInTheDocument();
        expect(item.getByText(`by ${book.author}`)).toBeInTheDocument();
        const link = item.getByRole('link', { name: /get it on amazon/i });
        expect(link).toHaveAttribute('href', amazonProductUrl(book.asin));
        expect(link).toHaveAttribute('target', '_blank');
        expect(link.getAttribute('rel')).toContain('sponsored');
      });
    });

    test('shows the Amazon Associates disclosure only when a tracking ID is set', () => {
      render(<BooksPage />);
      expect(screen.queryByTestId('amazon-disclosure')).not.toBeInTheDocument();
      cleanup();

      process.env.NEXT_PUBLIC_AMZN_TAG = 'knowyouremoji-20';
      render(<BooksPage />);
      expect(screen.getByTestId('amazon-disclosure')).toHaveTextContent(AMAZON_DISCLOSURE);
      const link = screen.getAllByRole('link', { name: /get it on amazon/i })[0];
      expect(link.getAttribute('href')).toContain('tag=knowyouremoji-20');
    });
  });
});
