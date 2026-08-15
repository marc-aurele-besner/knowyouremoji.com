'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Real-time emoji popularity from page view telemetry</span>
          {!isLive && <Badge variant="warning">Database unavailable — showing catalog only</Badge>}
          {isLive && overview.lastUpdatedAt && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Last view recorded {formatRelative(overview.lastUpdatedAt)}
            </span>
          )}
        </div>
      </header>

      <section aria-label="Summary metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              data-testid="total-views"
              className="text-3xl font-bold text-gray-900 dark:text-white"
            >
              {formatNumber(overview.totalViews)}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Across {formatNumber(overview.trackedEmojis)} tracked emoji
              {overview.trackedEmojis === 1 ? '' : 's'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Catalog Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(overview.catalogSize)}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {coveragePercent}% have recorded views
            </p>
            <div
              className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
              aria-hidden="true"
            >
              <div
                data-testid="coverage-bar"
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                style={{ width: `${coveragePercent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Last 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(overview.viewsLast7Days)}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {formatNumber(overview.viewsLast30Days)} in the last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Top Emoji
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topEmoji?.emoji ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden="true">
                    {topEmoji.emoji.character}
                  </span>
                  <div>
                    <div className="text-base font-semibold text-gray-900 dark:text-white">
                      {topEmoji.emoji.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatNumber(topEmoji.views)} views
                    </div>
                  </div>
                </div>
                <Link
                  href={`/emoji/${topEmoji.emoji.slug}`}
                  className="mt-3 inline-block text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                >
                  View page →
                </Link>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold text-gray-400 dark:text-gray-500">—</div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  No views recorded yet
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-label="Top emojis" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Most Popular Emojis
          </h2>
          <Badge variant="secondary">Top {topEmojis.length}</Badge>
        </div>
        {topEmojis.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
              No view data yet. Views appear here as soon as users open emoji pages.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="space-y-3 pt-6">
              {topEmojis.map((entry, idx) => {
                const percent = maxViews > 0 ? (entry.views / maxViews) * 100 : 0;
                return (
                  <div
                    key={entry.slug}
                    data-testid="popular-row"
                    className="grid grid-cols-[3rem_2.5rem_1fr_auto] items-center gap-3"
                  >
                    <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                      #{idx + 1}
                    </div>
                    <div className="text-2xl" aria-hidden="true">
                      {entry.emoji?.character ?? '❔'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/emoji/${entry.slug}`}
                          className="truncate text-sm font-medium text-gray-900 hover:text-amber-600 dark:text-white dark:hover:text-amber-400"
                        >
                          {entry.emoji?.name ?? entry.slug}
                        </Link>
                        <Badge variant="outline" className="hidden sm:inline-flex">
                          {entry.emoji?.category ?? 'unknown'}
                        </Badge>
                      </div>
                      <div
                        className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
                        aria-hidden="true"
                      >
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        data-testid="popular-views"
                        className="text-sm font-semibold text-gray-900 dark:text-white"
                      >
                        {formatNumber(entry.views)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatRelative(entry.lastViewedAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </section>

      <section aria-label="Least viewed" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Lowest Traffic (Tracked)
          </h2>
          <Badge variant="secondary">Bottom {leastViewed.length}</Badge>
        </div>
        {leastViewed.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
              No tracked emojis with low traffic yet.
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Emoji
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Name
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                    Views
                  </th>
                  <th className="hidden px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 sm:table-cell">
                    Last viewed
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {leastViewed.map((entry) => (
                  <tr key={entry.slug}>
                    <td className="px-4 py-3 text-2xl" aria-hidden="true">
                      {entry.emoji?.character ?? '❔'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      <Link
                        href={`/emoji/${entry.slug}`}
                        className="hover:text-amber-600 dark:hover:text-amber-400"
                      >
                        {entry.emoji?.name ?? entry.slug}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                      {formatNumber(entry.views)}
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-gray-500 dark:text-gray-400 sm:table-cell">
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Emojis</h2>
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
            className="max-w-sm"
            aria-label="Search emojis"
          />
          <div className="flex flex-wrap gap-1" role="group" aria-label="Sort order">
            {[
              { value: 'views-desc', label: 'Most viewed' },
              { value: 'views-asc', label: 'Least viewed' },
              { value: 'name-asc', label: 'A → Z' },
              { value: 'name-desc', label: 'Z → A' },
            ].map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={sortKey === option.value ? 'primary' : 'outline'}
                onClick={() => setSortKey(option.value as SortKey)}
                aria-pressed={sortKey === option.value}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Emoji
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Name
                </th>
                <th className="hidden px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 sm:table-cell">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                  Views
                </th>
                <th className="hidden px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 md:table-cell">
                  Last viewed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
              {filteredAll.slice(0, 50).map((entry) => (
                <tr key={entry.slug} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-2xl" aria-hidden="true">
                    {entry.emoji.character}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    <Link
                      href={`/emoji/${entry.slug}`}
                      className="hover:text-amber-600 dark:hover:text-amber-400"
                    >
                      {entry.emoji.name}
                    </Link>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{entry.slug}</div>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-gray-500 dark:text-gray-400 sm:table-cell">
                    <Badge variant="secondary">{entry.emoji.category}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                    {formatNumber(entry.views)}
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-gray-500 dark:text-gray-400 md:table-cell">
                    {formatRelative(entry.lastViewedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAll.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
              No emojis match the current filter.
            </div>
          )}
          {filteredAll.length > 50 && (
            <div className="border-t border-gray-200/50 px-4 py-3 text-xs text-gray-500 dark:border-gray-700/50 dark:text-gray-400">
              Showing the first 50 results — refine your search to narrow down.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

AdminAnalyticsDashboard.displayName = 'AdminAnalyticsDashboard';
