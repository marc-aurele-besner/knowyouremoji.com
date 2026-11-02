'use client';

import type { AnchorHTMLAttributes } from 'react';
import { useAmazonStorefront } from '@/hooks/use-amazon-storefront';
import { AMAZON_LINK_REL, amazonProductUrl } from '@/lib/amazon-affiliate';
import { engagementEvents } from '@/lib/analytics';
import type { Book } from '@/lib/book-banners';

export interface AmazonBookLinkProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href' | 'target' | 'rel'
> {
  book: Book;
  /** Where the link sits (e.g. `books-page`, a banner id), reported with each click. */
  placement: string;
}

/**
 * Amazon Associates link to one of our books. Every outbound Amazon link goes
 * through here: a direct product URL (no redirect or cloaking) on the
 * visitor's nearest storefront, with that storefront's tracking ID, opened in
 * a new tab and marked `sponsored`.
 */
function AmazonBookLink({ book, placement, onClick, children, ...props }: AmazonBookLinkProps) {
  const storefront = useAmazonStorefront();

  return (
    <a
      {...props}
      href={amazonProductUrl(book.asin, storefront)}
      target="_blank"
      rel={AMAZON_LINK_REL}
      onClick={(event) => {
        engagementEvents.affiliateClick(book.id, storefront, placement);
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}

export { AmazonBookLink };
