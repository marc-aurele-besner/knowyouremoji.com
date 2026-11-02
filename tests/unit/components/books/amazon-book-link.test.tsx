import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';

const mockAffiliateClick = mock((..._args: unknown[]) => {});
mock.module('@/lib/analytics', () => ({
  engagementEvents: {
    externalLinkClick: mock(() => {}),
    affiliateClick: mockAffiliateClick,
  },
}));

import { AmazonBookLink } from '@/components/books/amazon-book-link';
import { COUNTRY_STORAGE_KEY } from '@/hooks/use-amazon-storefront';
import { getBook } from '@/lib/book-banners';

const book = getBook('teen-texts');
const originalFetch = globalThis.fetch;
const savedTag = process.env.NEXT_PUBLIC_AMZN_TAG;

beforeEach(() => {
  window.localStorage.clear();
  mockAffiliateClick.mockClear();
  process.env.NEXT_PUBLIC_AMZN_TAG = 'knowyouremoji-20';
  globalThis.fetch = mock(async () => Response.json({ country: null })) as unknown as typeof fetch;
});

afterEach(() => {
  cleanup();
  globalThis.fetch = originalFetch;
  window.localStorage.clear();
  if (savedTag === undefined) Reflect.deleteProperty(process.env, 'NEXT_PUBLIC_AMZN_TAG');
  else process.env.NEXT_PUBLIC_AMZN_TAG = savedTag;
});

describe('AmazonBookLink', () => {
  it('renders a direct, tagged amazon.com link with affiliate attributes', () => {
    render(
      <AmazonBookLink book={book} placement="books-page" className="btn">
        Buy
      </AmazonBookLink>
    );
    const link = screen.getByRole('link', { name: 'Buy' });
    expect(link).toHaveAttribute(
      'href',
      `https://www.amazon.com/dp/${book.asin}?tag=knowyouremoji-20`
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'nofollow sponsored noopener');
    expect(link).toHaveClass('btn');
  });

  it('switches to the visitor’s storefront', async () => {
    window.localStorage.setItem(
      COUNTRY_STORAGE_KEY,
      JSON.stringify({ country: 'IE', at: Date.now() })
    );
    render(
      <AmazonBookLink book={book} placement="books-page">
        Buy
      </AmazonBookLink>
    );
    await waitFor(() =>
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        `https://www.amazon.co.uk/dp/${book.asin}?tag=knowyouremoji-20`
      )
    );
  });

  it('tracks the click with the book, storefront and placement, then calls onClick', () => {
    const onClick = mock(() => {});
    render(
      <AmazonBookLink book={book} placement="card-ts-pmo" onClick={onClick}>
        Buy
      </AmazonBookLink>
    );
    fireEvent.click(screen.getByRole('link'));
    expect(mockAffiliateClick).toHaveBeenCalledWith('teen-texts', 'US', 'card-ts-pmo');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('tracks the click without an onClick handler', () => {
    render(
      <AmazonBookLink book={book} placement="books-page">
        Buy
      </AmazonBookLink>
    );
    fireEvent.click(screen.getByRole('link'));
    expect(mockAffiliateClick).toHaveBeenCalledWith('teen-texts', 'US', 'books-page');
  });
});
