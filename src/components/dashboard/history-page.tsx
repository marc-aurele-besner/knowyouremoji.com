'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Interpretation History</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          View your past emoji interpretations.
        </p>
      </div>

      {!isAuthenticated && status !== 'loading' && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              History Not Available
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Sign in to save and view your interpretation history.
            </p>
          </CardContent>
        </Card>
      )}

      {isAuthenticated && error && (
        <div
          className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg"
          role="alert"
        >
          {error}
        </div>
      )}

      {isAuthenticated && isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="py-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isAuthenticated && !isLoading && !error && entries.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">📭</div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Interpretations Yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Your interpretation history will appear here once you start using the interpreter.
            </p>
          </CardContent>
        </Card>
      )}

      {isAuthenticated && !isLoading && !error && entries.length > 0 && (
        <>
          <div className="space-y-4">
            {entries.map((entry) =>
              expandedId === entry.id ? (
                <HistoryDetailView
                  key={entry.id}
                  entry={entry}
                  onClose={() => setExpandedId(null)}
                />
              ) : (
                <Card
                  key={entry.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setExpandedId(entry.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for interpretation: ${entry.message}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setExpandedId(entry.id);
                    }
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {formatDate(entry.created_at)}
                      </CardTitle>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {entry.emoji_count} emoji{entry.emoji_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {entry.message}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                      {entry.interpretation}
                    </p>
                  </CardContent>
                </Card>
              )
            )}
          </div>

          {/* Load More / Infinite Scroll */}
          <div ref={sentinelRef} aria-hidden="true" />
          {isLoadingMore && (
            <div className="flex justify-center pt-4">
              <div className="space-y-4 w-full">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Card key={`loading-more-${i}`}>
                    <CardContent className="py-4">
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {hasMore && !isLoadingMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" size="sm" onClick={handleLoadMore}>
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
