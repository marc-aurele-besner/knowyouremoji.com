'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useComboSearch } from '@/hooks/use-combo-search';
import { ComboCard } from '@/components/combo/combo-card';
import type { EmojiComboSummary } from '@/types/combo';

/**
 * A category group of combos, as rendered on the combo browse page.
 */
export interface ComboBrowserGroup {
  slug: string;
  displayName: string;
  combos: EmojiComboSummary[];
}

export interface ComboBrowserProps {
  /** Combos grouped by category (server-provided, in display order) */
  groups: ComboBrowserGroup[];
  /** Optional filter row (e.g. category chips) rendered under the toolbar */
  filters?: ReactNode;
  className?: string;
}

type ComboSort = 'category' | 'az';

const SORT_OPTIONS: { value: ComboSort; label: string }[] = [
  { value: 'category', label: 'By category' },
  { value: 'az', label: 'A–Z' },
];

/**
 * Client-side search + sort for the combo browse page.
 *
 * With no query and the default sort, every combo is rendered grouped by
 * category (the server-rendered HTML therefore contains every combo link).
 * Typing a query or switching to A–Z flattens the list into a single grid.
 */
export function ComboBrowser({ groups, filters, className }: ComboBrowserProps) {
  const [sort, setSort] = useState<ComboSort>('category');

  const allCombos = useMemo(() => groups.flatMap((group) => group.combos), [groups]);
  const labels = useMemo(
    () => new Map(groups.map((group) => [group.slug, group.displayName])),
    [groups]
  );

  const { results, query, setQuery, clearQuery } = useComboSearch({ combos: allCombos });

  const flatResults = useMemo(
    () => (sort === 'az' ? [...results].sort((a, b) => a.name.localeCompare(b.name)) : results),
    [results, sort]
  );

  const isFlat = query.trim().length > 0 || sort === 'az';

  return (
    <div className={className} data-testid="combo-browser">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form
          role="search"
          className="relative min-w-0 flex-1 basis-60"
          onSubmit={(e) => e.preventDefault()}
        >
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <label htmlFor="combo-browser-search" className="sr-only">
            Search combos
          </label>
          <input
            id="combo-browser-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search combos like 💀😭 or “drama”"
            autoComplete="off"
            className="h-[50px] w-full rounded-full border border-card-border bg-card pl-11 pr-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500/25"
          />
        </form>
        <div
          role="group"
          aria-label="Sort combos"
          className="inline-flex gap-0.5 rounded-full bg-muted p-[3px]"
        >
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={sort === option.value}
              onClick={() => setSort(option.value)}
              className={cn(
                'min-h-10 rounded-full px-3.5 text-[13px] font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                sort === option.value
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {filters}

      {isFlat ? (
        <section aria-labelledby="combo-browser-results-heading" className="mt-6">
          <h2 id="combo-browser-results-heading" className="sr-only">
            Combo results
          </h2>
          <p className="mb-3 text-[13px] text-muted-foreground" role="status" aria-live="polite">
            {query.trim()
              ? `${flatResults.length} combo${flatResults.length === 1 ? '' : 's'} for “${query.trim()}”`
              : `All ${flatResults.length} combos, A–Z`}
          </p>
          {flatResults.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3">
              {flatResults.map((combo) => (
                <ComboCard
                  key={combo.slug}
                  combo={combo}
                  categoryLabel={labels.get(combo.category)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-dashed border-card-border px-6 py-12 text-center text-muted-foreground">
              <span className="text-4xl" aria-hidden="true">
                🔍
              </span>
              <p className="text-[17px] font-semibold text-foreground">
                No combos match “{query.trim()}”
              </p>
              <p className="text-sm">Try a single emoji or a feeling.</p>
              <button
                type="button"
                onClick={clearQuery}
                className="mt-1 inline-flex h-10 items-center rounded-full border border-card-border bg-card px-4 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                Clear search
              </button>
            </div>
          )}
        </section>
      ) : (
        groups.map((group) => (
          <section
            key={group.slug}
            id={group.slug}
            aria-labelledby={`combo-group-${group.slug}`}
            className="mt-12 scroll-mt-24"
          >
            <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
              <h2
                id={`combo-group-${group.slug}`}
                className="text-2xl font-semibold tracking-tight md:text-[28px]"
              >
                {group.displayName}
              </h2>
              <span className="text-sm text-muted-foreground">{group.combos.length} combos</span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3">
              {group.combos.map((combo) => (
                <ComboCard key={combo.slug} combo={combo} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
