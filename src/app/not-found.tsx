import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { NotFoundSearch } from '@/components/not-found/not-found-search';
import { getEmojiSummaries } from '@/lib/emoji-data';

/**
 * Metadata for the 404 page.
 *
 * Without this export the 404 inherits the root layout's metadata verbatim:
 * the homepage's `<title>`, the homepage's description, and a
 * `<link rel="canonical">` pointing at the homepage. A canonical that
 * points at a *different* URL tells a search engine that this URL is a
 * duplicate of the homepage, which is the wrong signal for a page that
 * does not exist. Dropping the canonical and asking not to be indexed
 * keeps the 404 out of the index without spending crawl budget on it.
 */
export const metadata: Metadata = {
  title: 'Page Not Found',
  description:
    'That page does not exist. Search KnowYourEmoji for what an emoji means in context, or browse the full emoji dictionary.',
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: null,
  },
};

/** Emojis offered as quick links when a page can't be found. */
const POPULAR_EMOJI_SLUGS = [
  'skull',
  'loudly-crying-face',
  'face-with-tears-of-joy',
  'fire',
  'red-heart',
  'sparkles',
];

/**
 * Global 404 page with search functionality
 * Displays a friendly message and allows users to search for emojis via the search API
 */
export default function NotFound() {
  // Only the popular chips are resolved here, on the server. The full catalog
  // must not cross into the client component: Next.js embeds this page's
  // payload in every route's HTML.
  const emojis = getEmojiSummaries();
  const popularEmojis = POPULAR_EMOJI_SLUGS.map((slug) =>
    emojis.find((emoji) => emoji.slug === slug)
  ).filter((emoji) => emoji !== undefined);

  return (
    <main className="container mx-auto max-w-3xl px-4 pb-16 pt-16 md:pt-20">
      {/* 404 Hero Section */}
      <div className="mb-10 text-center">
        <div
          className="emoji-display text-8xl leading-none md:text-[96px]"
          role="img"
          aria-label="Melting face"
        >
          🫠
        </div>

        {/* 404 Status */}
        <p className="eyebrow mt-6">404</p>

        {/* Heading */}
        <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
          This page melted away
        </h1>

        {/* Description */}
        <p className="mx-auto mt-3 max-w-xl text-[17px] text-muted-foreground">
          We couldn&apos;t find what you were looking for. Try a search instead.
        </p>
      </div>

      {/* Search Section */}
      <NotFoundSearch />

      {/* Popular emoji chips */}
      {popularEmojis.length > 0 && (
        <nav aria-label="Popular emojis" className="mt-8 flex flex-wrap justify-center gap-2">
          {popularEmojis.map((emoji) => (
            <Link
              key={emoji.slug}
              href={`/emoji/${emoji.slug}`}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-card-border bg-card px-3.5 text-sm text-foreground transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <span className="emoji-display" aria-hidden="true">
                {emoji.character}
              </span>
              {emoji.name}
            </Link>
          ))}
        </nav>
      )}

      {/* Navigation options */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Button asChild variant="primary" size="lg">
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href="/interpreter">Open interpreter</Link>
        </Button>
      </div>
    </main>
  );
}
