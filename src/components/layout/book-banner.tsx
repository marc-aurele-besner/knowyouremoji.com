'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { engagementEvents } from '@/lib/analytics';
import { BOOK_BANNERS, BOOK_URL } from '@/lib/book-banners';

export { BOOK_BANNERS, BOOK_URL };

const BOOK_ALT = "The Parent's Guide to Decoding Your Teen's Texts by Claire Vance — buy on Amazon";

// Routes where a promo banner would get in the way (account and admin flows).
const HIDDEN_PREFIXES = [
  '/dashboard',
  '/admin',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

export function isBookBannerHidden(pathname: string): boolean {
  return HIDDEN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

// Deterministic per path so server and client render the same banner.
export function pickBookBanner(pathname: string) {
  let hash = 0;
  for (let i = 0; i < pathname.length; i++) {
    hash = (hash * 31 + pathname.charCodeAt(i)) | 0;
  }
  return BOOK_BANNERS[Math.abs(hash) % BOOK_BANNERS.length];
}

// Best-effort: persists one row per view/click in the database.
export function recordBookBannerEvent(type: 'view' | 'click', banner: string, path: string) {
  fetch('/api/book-banner/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, banner, path }),
    keepalive: true,
  }).catch(() => {
    // Silently ignore — banner tracking is best-effort
  });
}

export interface BookBannerProps {
  className?: string;
}

function BookBanner({ className }: BookBannerProps) {
  const pathname = usePathname() ?? '/';
  const hidden = isBookBannerHidden(pathname);
  const banner = pickBookBanner(pathname);

  useEffect(() => {
    if (!hidden) {
      recordBookBannerEvent('view', banner.id, pathname);
    }
  }, [hidden, banner.id, pathname]);

  if (hidden) {
    return null;
  }

  return (
    <aside aria-label="Featured book" className={cn('container mx-auto px-4 py-8', className)}>
      <a
        href={BOOK_URL}
        target="_blank"
        rel="sponsored noopener noreferrer"
        onClick={() => {
          engagementEvents.externalLinkClick(BOOK_URL, 'Book banner');
          recordBookBannerEvent('click', banner.id, pathname);
        }}
        className="block overflow-hidden rounded-xl shadow-sm ring-1 ring-gray-200 transition hover:shadow-md hover:ring-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:ring-gray-800"
      >
        <Image
          src={banner.src}
          alt={BOOK_ALT}
          width={banner.width}
          height={banner.height}
          sizes="(min-width: 1536px) 1504px, (min-width: 1280px) 1248px, (min-width: 1024px) 992px, 100vw"
          className="h-auto w-full"
        />
      </a>
    </aside>
  );
}

export { BookBanner };
