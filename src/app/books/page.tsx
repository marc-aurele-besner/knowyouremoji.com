import type { Metadata } from 'next';
import Image from 'next/image';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Button } from '@/components/ui/button';
import { BOOKS } from '@/lib/book-banners';
import { getEnv } from '@/lib/env';

const pageTitle = 'Books';
const pageDescription =
  'Know Your Emoji books by Claire Vance: practical guides to decoding emojis, slang, and digital tone — for parents and at work.';

/**
 * Generate metadata for the books page including canonical URL
 */
export function generateMetadata(): Metadata {
  const env = getEnv();
  const pageUrl = `${env.appUrl}/books`;

  return {
    title: `${pageTitle} | ${env.appName}`,
    description: pageDescription,
    keywords: [
      'emoji books',
      'know your emoji books',
      'claire vance',
      'decoding teen texts',
      'emoji etiquette at work',
      'workplace emoji guide',
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: pageUrl,
      siteName: env.appName,
      title: `${pageTitle} | ${env.appName}`,
      description: pageDescription,
      images: [
        {
          url: `${env.appUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${pageTitle} | ${env.appName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pageTitle} | ${env.appName}`,
      description: pageDescription,
      images: [`${env.appUrl}/og-image.png`],
    },
  };
}

const breadcrumbItems = [{ label: 'Home', href: '/' }, { label: 'Books' }];

/**
 * Books page listing every Know Your Emoji book with a link to buy it on Amazon.
 */
export default function BooksPage() {
  return (
    <main className="container mx-auto max-w-5xl px-4 pb-16 pt-10">
      <Breadcrumbs items={breadcrumbItems} className="mb-5" />

      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary-700">
          Know Your Emoji books
        </p>
        <h1 className="mt-2.5 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
          Take the decoding <em className="accent-serif">offline</em>.
        </h1>
        <p className="mt-4 max-w-2xl text-[17px] text-muted-foreground">
          Practical guides by Claire Vance to the emojis, slang, and digital tone that trip people
          up — at home and at work.
        </p>
      </header>

      <ul className="mt-12 grid list-none gap-5 md:grid-cols-2" data-testid="books-list">
        {BOOKS.map((book) => (
          <li
            key={book.id}
            className="flex flex-col gap-5 rounded-2xl border border-card-border bg-card p-5 sm:flex-row"
          >
            <Image
              src={book.cover.src}
              alt={`Cover of ${book.title}`}
              width={book.cover.width}
              height={book.cover.height}
              sizes="160px"
              className="h-auto w-32 shrink-0 self-start rounded-md shadow-soft sm:w-36"
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {book.audience}
              </p>
              <h2 className="mt-1.5 text-xl font-semibold tracking-tight">{book.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">by {book.author}</p>
              <p className="mt-3 text-[15px] leading-relaxed">{book.description}</p>
              <div className="mt-5 sm:mt-auto sm:pt-5">
                <Button asChild variant="brand">
                  <a href={book.url} target="_blank" rel="sponsored noopener noreferrer">
                    Get it on Amazon →
                  </a>
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm text-muted-foreground">
        Each link opens the book’s page on Amazon in a new tab.
      </p>
    </main>
  );
}
