'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { engagementEvents } from '@/lib/analytics';
import { BOOK_BANNERS, BOOK_COVER, BOOK_URL, BOOK_WIDE_BANNERS } from '@/lib/book-banners';

export { BOOK_BANNERS, BOOK_URL, BOOK_WIDE_BANNERS };

const BOOK_TITLE = "The Parent's Guide to Decoding Your Teen's Texts";

// Deterministic per path so server and client render the same variant.
function pickByPath<T>(pathname: string, variants: readonly T[]): T {
  let hash = 0;
  for (let i = 0; i < pathname.length; i++) {
    hash = (hash * 31 + pathname.charCodeAt(i)) | 0;
  }
  return variants[Math.abs(hash) % variants.length];
}

export function pickBookBanner(pathname: string) {
  return pickByPath(pathname, BOOK_BANNERS);
}

export function pickWideBookBanner(pathname: string) {
  return pickByPath(pathname, BOOK_WIDE_BANNERS);
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
  /** `inline` is a compact card for article pages; `wide` is the full-width image. */
  variant?: 'inline' | 'wide';
}

// Below this width the wide image's text is too small to read, so the wide
// variant falls back to the inline card.
const WIDE_MIN_WIDTH_QUERY = '(min-width: 768px)';

function isWideViewport(): boolean {
  return typeof window.matchMedia !== 'function' || window.matchMedia(WIDE_MIN_WIDTH_QUERY).matches;
}

/**
 * Book promo placed inside page content (not the layout). Only counts a
 * view once at least half of it is on screen, under the id of the version
 * actually shown.
 */
function BookBanner({ className, variant = 'inline' }: BookBannerProps) {
  const pathname = usePathname() ?? '/';
  const card = pickBookBanner(pathname);
  const wide = variant === 'wide' ? pickWideBookBanner(pathname) : null;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const recordView = () =>
      recordBookBannerEvent('view', wide && isWideViewport() ? wide.id : card.id, pathname);

    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      recordView();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          recordView();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [card.id, wide, pathname]);

  const linkProps = (bannerId: string) => ({
    href: BOOK_URL,
    target: '_blank',
    rel: 'sponsored noopener noreferrer',
    onClick: () => {
      engagementEvents.externalLinkClick(BOOK_URL, 'Book banner');
      recordBookBannerEvent('click', bannerId, pathname);
    },
  });

  return (
    <aside ref={ref} aria-label="Featured book" className={cn('not-prose', className)}>
      {wide && (
        <a
          {...linkProps(wide.id)}
          aria-label={`${BOOK_TITLE} by Claire Vance — buy on Amazon`}
          className="hidden overflow-hidden rounded-2xl ring-1 ring-card-border transition hover:shadow-soft hover:ring-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 md:block"
        >
          <Image
            src={wide.src}
            alt=""
            width={wide.width}
            height={wide.height}
            sizes="(min-width: 1152px) 1120px, 100vw"
            className="h-auto w-full"
          />
        </a>
      )}
      <a
        {...linkProps(card.id)}
        className={cn(
          'group flex items-center gap-4 rounded-2xl border border-card-border bg-card p-4 transition hover:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:gap-5 sm:px-[22px] sm:py-5',
          wide && 'md:hidden'
        )}
      >
        <Image
          src={BOOK_COVER.src}
          alt=""
          width={BOOK_COVER.width}
          height={BOOK_COVER.height}
          sizes="80px"
          className="h-auto w-14 shrink-0 rounded-md shadow-soft"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            New book · 2027 edition · Sponsored
          </p>
          <p className="mt-1 text-[15px] font-semibold text-primary-700">{card.headline}</p>
          <p className="mt-0.5 text-[13.5px] text-muted-foreground">
            <span className="italic">{BOOK_TITLE}</span> by Claire Vance.{' '}
            <span className="font-medium text-primary-700 underline-offset-2 group-hover:underline sm:hidden">
              Get it on Amazon →
            </span>
          </p>
        </div>
        <span
          aria-hidden="true"
          className="hidden h-9 shrink-0 items-center rounded-full border border-card-border bg-card px-3.5 text-sm font-medium text-foreground transition group-hover:border-foreground sm:inline-flex"
        >
          Get it on Amazon →
        </span>
      </a>
    </aside>
  );
}

export { BookBanner };
