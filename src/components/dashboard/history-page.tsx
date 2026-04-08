'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const isAuthenticated = status === 'authenticated';

  const fetchHistory = useCallback(
    async (pageNum: number) => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/interpretations?page=${pageNum}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to load history');
          return;
        }

        setEntries(data.data);
        setHasMore(data.hasMore);
      } catch {
        setError('Failed to load history');
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  useEffect(() => {
    fetchHistory(page);
  }, [page, fetchHistory]);

  const handlePreviousPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (hasMore) setPage(page + 1);
  };

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
            {entries.map((entry) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
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
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={page === 0}>
              Previous
            </Button>
            <span className="text-sm text-gray-500 dark:text-gray-400">Page {page + 1}</span>
            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={!hasMore}>
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

HistoryPage.displayName = 'HistoryPage';

export { HistoryPage };
