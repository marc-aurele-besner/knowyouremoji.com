'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchPageClient } from '@/components/search/search-page-client';
import type { EmojiSummary } from '@/types/emoji';
import type { EmojiComboSummary } from '@/types/combo';

interface SearchPageShellProps {
  /** Array of emojis to search through */
  emojis: EmojiSummary[];
  /** Array of combos to search through */
  combos: EmojiComboSummary[];
}

/**
 * Seeds the search box from the `q` query parameter.
 *
 * Split out so it can sit behind its own Suspense boundary: reading
 * `useSearchParams` during prerender suspends, and the boundary lets the
 * rest of the page ship as static HTML.
 */
function SearchFromUrl({ emojis, combos }: SearchPageShellProps) {
  const searchParams = useSearchParams();
  // `useSearchParams` returns null when there is no router context (for
  // example when the component is rendered outside the Next.js runtime).
  // Falling back to an empty query keeps the search page usable instead of
  // throwing on render.
  const initialQuery = searchParams?.get('q') ?? '';

  return <SearchPageClient emojis={emojis} combos={combos} initialQuery={initialQuery} />;
}

/**
 * Client wrapper around {@link SearchPageClient} that reads the search
 * query from the URL.
 *
 * The Suspense boundary lives *inside* this client component on purpose:
 * the emoji and combo lists are then serialized to the browser exactly
 * once (as this component's props) rather than once for the boundary
 * fallback and again for the resolved subtree.
 *
 * Why deep links matter: `/search?q=skull` makes a specific interpretation
 * shareable and quotable, and it backs the `SearchAction` declared in the
 * site-wide `WebSite` JSON-LD.
 */
export function SearchPageShell({ emojis, combos }: SearchPageShellProps) {
  return (
    <Suspense fallback={<SearchPageClient emojis={emojis} combos={combos} />}>
      <SearchFromUrl emojis={emojis} combos={combos} />
    </Suspense>
  );
}
