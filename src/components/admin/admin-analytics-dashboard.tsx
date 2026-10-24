'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { KpiTile } from '@/components/dashboard/dashboard-ui';
import { cn } from '@/lib/utils';
import type { EmojiSummary } from '@/types/emoji';

export interface PopularityEntryWithEmoji {
  slug: string;
  views: number;
  lastViewedAt: string | null;
  emoji: EmojiSummary | null;
}

export interface PopularityEntryWithSummary extends PopularityEntryWithEmoji {
  emoji: EmojiSummary;
}

export interface AnalyticsOverviewData {
  totalViews: number;
  trackedEmojis: number;
  catalogSize: number;
  topSlug: string | null;
  topViews: number;
  viewsLast7Days: number;
  viewsLast30Days: number;
  lastUpdatedAt: string | null;
}

export interface AdminAnalyticsDashboardProps {
  overview: AnalyticsOverviewData;
  topEmojis: PopularityEntryWithEmoji[];
  leastViewed: PopularityEntryWithEmoji[];
  allEmojis: PopularityEntryWithSummary[];
  /** Whether the database is configured and returning live data */
  isLive: boolean;
}

type SortKey = 'views-desc' | 'views-asc' | 'name-asc' | 'name-desc';

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  try {
    const date = new Date(iso);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function formatRelative(iso: string | null): string {
  if (!iso) return 'never';
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return iso;
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDateTime(iso);
}

export function AdminAnalyticsDashboard({
  overview,
  topEmojis,
  leastViewed,
  allEmojis,
  isLive,
}: AdminAnalyticsDashboardProps) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('views-desc');

  const maxViews = useMemo(
    () => topEmojis.reduce((acc, entry) => Math.max(acc, entry.views), 0),
    [topEmojis]
  );

  const filteredAll = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const matches = normalized
      ? allEmojis.filter(
          (entry) =>
            entry.emoji.name.toLowerCase().includes(normalized) ||
            entry.emoji.slug.toLowerCase().includes(normalized) ||
            entry.emoji.character.includes(normalized) ||
            entry.emoji.category.toLowerCase().includes(normalized)
        )
      : allEmojis;

    const sorted = [...matches];
    switch (sortKey) {
      case 'views-desc':
        sorted.sort((a, b) => b.views - a.views || a.emoji.name.localeCompare(b.emoji.name));
        break;
      case 'views-asc':
        sorted.sort((a, b) => a.views - b.views || a.emoji.name.localeCompare(b.emoji.name));
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.emoji.name.localeCompare(b.emoji.name));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.emoji.name.localeCompare(a.emoji.name));
        break;
    }
    return sorted;
  }, [allEmojis, query, sortKey]);

  const coveragePercent =
    overview.catalogSize > 0
      ? Math.round((overview.trackedEmojis / overview.catalogSize) * 100)
      : 0;

  const topEmoji = useMemo(
    () => topEmojis.find((entry) => entry.slug === overview.topSlug) ?? null,
    [topEmojis, overview.topSlug]
  );

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Analytics
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-muted-foreground">
          <span>Real-time emoji popularity from page view telemetry</span>
          {!isLive && <Badge variant="warning">Database unavailable — showing catalog only</Badge>}
          {isLive && overview.lastUpdatedAt && (
            <span className="text-xs text-muted-foreground">
              Last view recorded {formatRelative(overview.lastUpdatedAt)}
            </span>
          )}
        </div>
      </header>

      <section aria-label="Summary metrics" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile
          label="Total Views"
          value={formatNumber(overview.totalViews)}
          valueTestId="total-views"
        >
          <p className="mt-1 text-xs text-muted-foreground">
            Across {formatNumber(overview.trackedEmojis)} tracked emoji
            {overview.trackedEmojis === 1 ? '' : 's'}
          </p>
        </KpiTile>

        <KpiTile label="Catalog Size" value={formatNumber(overview.catalogSize)}>
          <p className="mt-1 text-xs text-muted-foreground">
            {coveragePercent}% have recorded views
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true">
            <div
              data-testid="coverage-bar"
              className="h-full rounded-full bg-primary-500 transition-[width] duration-500"
              style={{ width: `${coveragePercent}%` }}
            />
          </div>
        </KpiTile>

        <KpiTile label="Last 7 Days" value={formatNumber(overview.viewsLast7Days)}>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatNumber(overview.viewsLast30Days)} in the last 30 days
          </p>
        </KpiTile>

        <div className="rounded-2xl border border-card-border bg-card p-[18px]">
          <div className="text-[13px] text-muted-foreground">Top Emoji</div>
          {topEmoji?.emoji ? (
            <>
              <div className="mt-2 flex items-center gap-3">
                <span className="emoji-display text-3xl" aria-hidden="true">
                  {topEmoji.emoji.character}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold text-foreground">
                    {topEmoji.emoji.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatNumber(topEmoji.views)} views
                  </div>
                </div>
              </div>
              <Link
                href={`/emoji/${topEmoji.emoji.slug}`}
                className="mt-3 inline-block text-xs font-medium text-primary-700 hover:underline dark:text-primary-500"
              >
                View page →
              </Link>
            </>
          ) : (
            <>
              <div className="mt-1 text-[30px] font-semibold text-muted-foreground">—</div>
              <p className="mt-1 text-xs text-muted-foreground">No views recorded yet</p>
            </>
          )}
        </div>
      </section>

      <section aria-label="Top emojis" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Most Popular Emojis
          </h2>
          <Badge variant="secondary">Top {topEmojis.length}</Badge>
        </div>
        {topEmojis.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-card-border px-6 py-12 text-center text-sm text-muted-foreground">
            No view data yet. Views appear here as soon as users open emoji pages.
          </div>
        ) : (
          <div className="space-y-2.5 rounded-2xl border border-card-border bg-card p-5 md:p-6">
            {topEmojis.map((entry, idx) => {
              const percent = maxViews > 0 ? (entry.views / maxViews) * 100 : 0;
              return (
                <div
                  key={entry.slug}
                  data-testid="popular-row"
                  className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 sm:grid-cols-[2rem_minmax(0,11rem)_minmax(0,1fr)_auto]"
                >
                  <div className="text-xs font-semibold tabular-nums text-muted-foreground">
                    #{idx + 1}
                  </div>
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="emoji-display text-xl" aria-hidden="true">
                      {entry.emoji?.character ?? '❔'}
                    </span>
                    <Link
                      href={`/emoji/${entry.slug}`}
                      className="truncate text-sm font-medium text-foreground hover:underline"
                      title={entry.emoji?.category ?? 'unknown'}
                    >
                      {entry.emoji?.name ?? entry.slug}
                    </Link>
                  </div>
                  <div
                    className="col-span-3 col-start-1 row-start-2 h-2 overflow-hidden rounded-full bg-muted sm:col-span-1 sm:col-start-auto sm:row-start-auto"
                    aria-hidden="true"
                  >
                    <div
                      className="h-full rounded-full bg-primary-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="text-right">
                    <div
                      data-testid="popular-views"
                      className="font-mono text-sm font-semibold tabular-nums text-foreground"
                    >
                      {formatNumber(entry.views)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatRelative(entry.lastViewedAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section aria-label="Least viewed" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Lowest Traffic (Tracked)
          </h2>
          <Badge variant="secondary">Bottom {leastViewed.length}</Badge>
        </div>
        {leastViewed.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-card-border px-6 py-12 text-center text-sm text-muted-foreground">
            No tracked emojis with low traffic yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-card-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-card-border bg-muted/60">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Emoji
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Views
                  </th>
                  <th
                    scope="col"
                    className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:table-cell"
                  >
                    Last viewed
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {leastViewed.map((entry) => (
                  <tr key={entry.slug}>
                    <td className="px-4 py-3 text-2xl" aria-hidden="true">
                      {entry.emoji?.character ?? '❔'}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      <Link href={`/emoji/${entry.slug}`} className="hover:underline">
                        {entry.emoji?.name ?? entry.slug}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">
                      {formatNumber(entry.views)}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {formatRelative(entry.lastViewedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-label="All emojis" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">All Emojis</h2>
          <Badge variant="secondary">
            {formatNumber(filteredAll.length)} of {formatNumber(allEmojis.length)}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Input
            type="search"
            placeholder="Search by name, character, or category…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 max-w-sm rounded-full"
            aria-label="Search emojis"
          />
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Sort order">
            {[
              { value: 'views-desc', label: 'Most viewed' },
              { value: 'views-asc', label: 'Least viewed' },
              { value: 'name-asc', label: 'A → Z' },
              { value: 'name-desc', label: 'Z → A' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSortKey(option.value as SortKey)}
                aria-pressed={sortKey === option.value}
                className={cn(
                  'inline-flex min-h-9 items-center rounded-full border px-3.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                  sortKey === option.value
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-card-border bg-card text-foreground hover:border-gray-400'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-card-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-card-border bg-muted/60">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Emoji
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:table-cell"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Views
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground md:table-cell"
                >
                  Last viewed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {filteredAll.slice(0, 50).map((entry) => (
                <tr key={entry.slug} className="transition-colors hover:bg-muted/60">
                  <td className="px-4 py-3 text-2xl" aria-hidden="true">
                    {entry.emoji.character}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    <Link href={`/emoji/${entry.slug}`} className="hover:underline">
                      {entry.emoji.name}
                    </Link>
                    <div className="font-mono text-xs text-muted-foreground">{entry.slug}</div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <Badge variant="secondary">{entry.emoji.category}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium tabular-nums text-foreground">
                    {formatNumber(entry.views)}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {formatRelative(entry.lastViewedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAll.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No emojis match the current filter.
            </div>
          )}
          {filteredAll.length > 50 && (
            <div className="border-t border-card-border px-4 py-3 text-xs text-muted-foreground">
              Showing the first 50 results — refine your search to narrow down.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

AdminAnalyticsDashboard.displayName = 'AdminAnalyticsDashboard';
