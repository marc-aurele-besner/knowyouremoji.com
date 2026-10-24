import Link from 'next/link';
import type { Metadata } from 'next';
import {
  getEmojiSummaries,
  getEmojiCount,
  getAllCategoryInfo,
  getAllContextInfo,
  getAllGenerationInfo,
  getAllPlatformInfo,
  isValidCategory,
} from '@/lib/emoji-data';
import { getAllComparisons } from '@/lib/comparison-data';
import { getEnv } from '@/lib/env';
import { Button } from '@/components/ui/button';
import { BookBanner } from '@/components/layout/book-banner';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { EmojiBrowser } from '@/components/emoji/emoji-browser';
import { SwapIcon } from '@/components/emoji/emoji-icons';
import { GENERATION_YEARS } from '@/components/emoji/emoji-labels';
import { cn } from '@/lib/utils';

/**
 * Generate metadata for the emoji browse page
 */
export function generateMetadata(): Metadata {
  const env = getEnv();
  const emojiCount = getEmojiCount();
  const pageUrl = `${env.appUrl}/emoji`;
  const title = `Browse All ${emojiCount} Emojis - ${env.appName}`;
  const description = `Explore ${emojiCount} emoji meanings with context-aware interpretations. Understand what emojis really mean in texts, social media, and everyday communication.`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: pageUrl,
      siteName: env.appName,
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

const numberFormat = new Intl.NumberFormat('en-US');

const HUB_CARD = cn(
  'flex h-full flex-col gap-1 rounded-2xl border border-card-border bg-card px-[18px] py-4 text-foreground transition-colors hover:border-primary-500',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
);

interface HubLink {
  href: string;
  title: string;
  meta: string;
}

function HubGrid({ items }: { items: HubLink[] }) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,210px),1fr))] gap-3">
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className={HUB_CARD}>
            <span className="text-[15px] font-semibold">{item.title}</span>
            <span className="text-[13px] text-muted-foreground">{item.meta}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Emoji browse page - searchable, filterable grid of every emoji plus links
 * to the category / context / generation / platform hubs
 */
export default function EmojiBrowsePage() {
  const emojiSummaries = getEmojiSummaries();
  const emojiCount = getEmojiCount();
  const categories = getAllCategoryInfo();
  const comparison = getAllComparisons()[0];

  const categoryHubs: HubLink[] = categories
    .filter((category) => isValidCategory(category.slug))
    .map((category) => ({
      href: `/emoji/category/${category.slug}`,
      title: category.displayName,
      meta: `${numberFormat.format(category.emojiCount)} emojis`,
    }));

  const otherHubs: HubLink[] = [
    ...getAllContextInfo().map((info) => ({
      href: `/emoji/context/${info.slug}`,
      title: info.displayName,
      meta: `${numberFormat.format(info.emojiCount)} emojis`,
    })),
    ...getAllGenerationInfo().map((info) => ({
      href: `/emoji/generation/${info.slug}`,
      title: info.displayName,
      meta: GENERATION_YEARS[info.slug],
    })),
    ...getAllPlatformInfo().map((info) => ({
      href: `/emoji/platform/${info.slug}`,
      title: info.displayName,
      meta: `${numberFormat.format(info.emojiCount)} notes`,
    })),
  ];

  return (
    <div className="container mx-auto max-w-6xl px-4 pb-20 pt-8 md:pt-10">
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'Emojis' }]}
        className="mb-5 text-[13px]"
      />

      {/* Page head */}
      <header className="mb-7 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Browse <span className="accent-serif">all</span> emojis
          </h1>
          <p className="mt-2 max-w-2xl text-[17px] text-muted-foreground">
            Explore {numberFormat.format(emojiCount)} emoji meanings with context-aware
            interpretations — explained the way people actually use them.
          </p>
        </div>
        {comparison && (
          <Button asChild variant="outline">
            <Link href={`/compare/${comparison.emoji1Slug}/${comparison.emoji2Slug}`}>
              <SwapIcon />
              Compare two emojis
            </Link>
          </Button>
        )}
      </header>

      <EmojiBrowser emojis={emojiSummaries} categories={categories} />

      <div className="mt-14">
        <BookBanner variant="wide" />
      </div>

      <section aria-labelledby="browse-categories-heading" className="mt-14">
        <h2
          id="browse-categories-heading"
          className="mb-5 text-2xl font-semibold tracking-tight text-foreground md:text-[28px]"
        >
          Browse by category
        </h2>
        <HubGrid items={categoryHubs} />
      </section>

      <section aria-labelledby="browse-hubs-heading" className="mt-14">
        <h2
          id="browse-hubs-heading"
          className="mb-5 text-2xl font-semibold tracking-tight text-foreground md:text-[28px]"
        >
          Browse by context, generation or platform
        </h2>
        <HubGrid items={otherHubs} />
      </section>
    </div>
  );
}
