'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRateLimit } from '@/hooks/use-rate-limit';
import { Badge } from '@/components/ui/badge';
import { DashboardPageHeader, EmptyState, KpiTile, SkeletonRows } from './dashboard-ui';
import type { HistoryEntry } from './history-page';

const quickActions = [
  {
    label: 'Interpret a message',
    href: '/interpreter',
    icon: '🔍',
    description: 'Decode emoji meanings in any message',
  },
  {
    label: 'Browse emojis',
    href: '/emoji',
    icon: '📚',
    description: 'Explore our emoji encyclopedia',
  },
  {
    label: 'Search',
    href: '/search',
    icon: '🔎',
    description: 'Find emojis and combos',
  },
  {
    label: 'History',
    href: '/dashboard/history',
    icon: '🕘',
    description: 'Revisit past interpretations',
  },
];

const RECENT_LIMIT = 3;

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Loads the first page of saved interpretations (best-effort) for the "Recent" list.
 * Returns `null` while loading.
 */
function useRecentInterpretations(): HistoryEntry[] | null {
  const [recent, setRecent] = useState<HistoryEntry[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      let entries: HistoryEntry[] = [];
      try {
        const response = await fetch('/api/interpretations?page=0');
        if (response.ok) {
          const data = await response.json();
          entries = (data.data ?? []).slice(0, RECENT_LIMIT);
        }
      } catch {
        // Recent list is best-effort; fall through to the empty state.
      }
      if (!cancelled) setRecent(entries);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return recent;
}

function DashboardHome() {
  const { used, remaining, maxUses } = useRateLimit();
  const usagePercent = maxUses > 0 ? Math.round((used / maxUses) * 100) : 0;
  const recent = useRecentInterpretations();

  return (
    <div className="space-y-10">
      <DashboardPageHeader
        title="Dashboard"
        description="Welcome back! Here's your emoji interpretation overview."
      />

      {/* Usage stats */}
      <section aria-label="Usage" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <KpiTile label="Interpretations Used" value={used}>
          <p className="mt-1 text-xs text-muted-foreground">of {maxUses} daily limit</p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              data-testid="usage-bar"
              className="h-full rounded-full bg-primary-500 transition-[width] duration-500"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </KpiTile>

        <KpiTile label="Remaining Today" value={remaining}>
          <p className="mt-1 text-xs text-muted-foreground">
            {remaining > 0 ? 'interpretations available' : 'resets at midnight'}
          </p>
        </KpiTile>

        <KpiTile label="Plan" value="Free" className="sm:col-span-2 lg:col-span-1">
          <p className="mt-1 text-xs text-muted-foreground">{maxUses} interpretations/day</p>
          <Link
            href="/pricing"
            className="mt-2 inline-block text-xs font-medium text-primary-700 hover:underline dark:text-primary-500"
          >
            Upgrade for unlimited →
          </Link>
        </KpiTile>
      </section>

      {/* Quick actions */}
      <section aria-labelledby="quick-actions-heading">
        <h2
          id="quick-actions-heading"
          className="mb-3 text-xl font-semibold tracking-tight text-foreground"
        >
          Quick Actions
        </h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col gap-1 rounded-2xl border border-card-border bg-card px-[18px] py-4 text-foreground transition-colors hover:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <span className="flex items-center gap-2 text-[15px] font-semibold">
                <span className="emoji-display" aria-hidden="true">
                  {action.icon}
                </span>
                {action.label}
              </span>
              <span className="text-[13px] text-muted-foreground">{action.description}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent interpretations */}
      <section aria-labelledby="recent-heading">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="recent-heading" className="text-xl font-semibold tracking-tight text-foreground">
            Recent interpretations
          </h2>
          <Link
            href="/dashboard/history"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            View all
          </Link>
        </div>
        {recent === null ? (
          <SkeletonRows count={2} testId="recent-loading" />
        ) : recent.length === 0 ? (
          <EmptyState
            emoji="🗂️"
            title="No Interpretations Yet"
            description="Your recent interpretations will appear here once you start using the interpreter."
            action={
              <Link
                href="/interpreter"
                className="inline-flex h-10 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background hover:opacity-90"
              >
                Open the interpreter →
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-card-border overflow-hidden rounded-2xl border border-card-border bg-card">
            {recent.map((entry) => (
              <li key={entry.id}>
                <Link
                  href="/dashboard/history"
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3.5 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
                >
                  <span className="truncate text-[14.5px] text-foreground">{entry.message}</span>
                  <Badge variant="secondary" className="hidden sm:inline-flex">
                    {entry.emoji_count} emoji{entry.emoji_count !== 1 ? 's' : ''}
                  </Badge>
                  <span className="text-[13px] text-muted-foreground">
                    {formatShortDate(entry.created_at)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

DashboardHome.displayName = 'DashboardHome';

export { DashboardHome };
