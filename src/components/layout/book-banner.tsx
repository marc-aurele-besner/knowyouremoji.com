'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { engagementEvents } from '@/lib/analytics';

export const BOOK_URL = 'https://www.amazon.com/dp/B0HN32NYYX';

const BOOK_ALT = "The Parent's Guide to Decoding Your Teen's Texts by Claire Vance — buy on Amazon";

export const BOOK_BANNERS = [
  { src: '/books-images/book-cover-01.png', width: 2480, height: 618 },
  { src: '/books-images/book-cover-02.png', width: 2479, height: 620 },
] as const;

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

export interface BookBannerProps {
  className?: string;
}

function BookBanner({ className }: BookBannerProps) {
  const pathname = usePathname() ?? '/';

  if (isBookBannerHidden(pathname)) {
    return null;
  }

  const banner = pickBookBanner(pathname);

  return (
    <aside aria-label="Featured book" className={cn('container mx-auto px-4 py-8', className)}>
      <a
        href={BOOK_URL}
        target="_blank"
        rel="sponsored noopener noreferrer"
        onClick={() => engagementEvents.externalLinkClick(BOOK_URL, 'Book banner')}
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
