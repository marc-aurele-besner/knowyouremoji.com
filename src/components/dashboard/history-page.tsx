'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardPageHeader, EmptyState, SkeletonRows, formErrorClass } from './dashboard-ui';
import { HistoryDetailView } from './history-detail-view';

/**
 * Interpretation history entry
 */
export interface HistoryEntry {
  id: string;
  message: string;
  interpretation: string;
  created_at: string;
  emoji_count: number;
}

function HistoryPage() {
  const { status } = useSession();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = status === 'authenticated';

  const fetchHistory = useCallback(
    async (pageNum: number, append: boolean = false) => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response = await fetch(`/api/interpretations?page=${pageNum}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to load history');
          return;
        }

        if (append) {
          setEntries((prev) => [...prev, ...data.data]);
        } else {
          setEntries(data.data);
        }
        setHasMore(data.hasMore);
      } catch {
        setError('Failed to load history');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [isAuthenticated]
  );

  useEffect(() => {
    fetchHistory(0);
  }, [fetchHistory]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchHistory(nextPage, true);
  }, [hasMore, isLoadingMore, page, fetchHistory]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (observerEntries) => {
        if (observerEntries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, handleLoadMore]);

  const formatDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Interpretation History"
        description="View your past emoji interpretations."
      />

      {!isAuthenticated && status !== 'loading' && (
        <EmptyState
          emoji="🔒"
          title="History Not Available"
          description="Sign in to save and view your interpretation history."
          action={
            <>
              <Button asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/register">Create account</Link>
              </Button>
            </>
          }
        />
      )}

      {isAuthenticated && error && (
        <div className={formErrorClass} role="alert">
          {error}
        </div>
      )}

      {isAuthenticated && isLoading && <SkeletonRows count={3} />}

      {isAuthenticated && !isLoading && !error && entries.length === 0 && (
        <EmptyState
          emoji="🗂️"
          title="No Interpretations Yet"
          description="Your interpretation history will appear here once you start using the interpreter."
          action={
            <Button asChild>
              <Link href="/interpreter">Get started →</Link>
            </Button>
          }
        />
      )}

      {isAuthenticated && !isLoading && !error && entries.length > 0 && (
        <>
          <ul className="divide-y divide-card-border overflow-hidden rounded-2xl border border-card-border bg-card">
            {entries.map((entry) => (
              <li key={entry.id}>
                {expandedId === entry.id ? (
                  <HistoryDetailView entry={entry} onClose={() => setExpandedId(null)} />
                ) : (
                  <button
                    type="button"
                    className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-3.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]"
                    onClick={() => setExpandedId(entry.id)}
                    aria-label={`View details for interpretation: ${entry.message}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandedId(entry.id);
                      }
                    }}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[14.5px] font-medium text-foreground">
                        {entry.message}
                      </span>
                      <span className="block truncate text-[13px] text-muted-foreground">
                        {entry.interpretation}
                      </span>
                    </span>
                    <span className="hidden sm:block">
                      <Badge variant="secondary">
                        {entry.emoji_count} emoji{entry.emoji_count !== 1 ? 's' : ''}
                      </Badge>
                    </span>
                    <span className="col-start-1 row-start-2 text-[13px] text-muted-foreground sm:col-start-auto sm:row-start-auto">
                      {formatDate(entry.created_at)}
                    </span>
                    <span
                      className="row-span-2 text-sm font-medium text-muted-foreground sm:row-span-1"
                      aria-hidden="true"
                    >
                      View →
                    </span>
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* Load More / Infinite Scroll */}
          <div ref={sentinelRef} aria-hidden="true" />
          {isLoadingMore && <SkeletonRows count={2} />}
          {hasMore && !isLoadingMore && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={handleLoadMore}>
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

HistoryPage.displayName = 'HistoryPage';

export { HistoryPage };
