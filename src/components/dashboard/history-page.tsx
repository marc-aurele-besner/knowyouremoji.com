'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Interpretation history entry from Supabase
 */
export interface HistoryEntry {
  id: string;
  message: string;
  interpretation: string;
  created_at: string;
  emoji_count: number;
}

/**
 * Number of history entries per page
 */
const PAGE_SIZE = 10;

function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);

  useEffect(() => {
    setIsSupabaseReady(isSupabaseConfigured());
  }, []);

  const fetchHistory = useCallback(
    async (pageNum: number) => {
      if (!isSupabaseReady) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const supabase = getSupabaseClient();
        if (!supabase) {
          setError('Authentication is not configured');
          return;
        }

        const from = pageNum * PAGE_SIZE;
        const to = from + PAGE_SIZE;

        const { data, error: fetchError } = await supabase
          .from('interpretations')
          .select('id, message, interpretation, created_at, emoji_count')
          .order('created_at', { ascending: false })
          .range(from, to);

        if (fetchError) {
          setError(fetchError.message);
          return;
        }

        if (data) {
          // If we got more than PAGE_SIZE, there are more pages
          setHasMore(data.length > PAGE_SIZE);
          setEntries(data.slice(0, PAGE_SIZE));
        }
      } catch {
        setError('Failed to load history');
      } finally {
        setIsLoading(false);
      }
    },
    [isSupabaseReady]
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

      {!isSupabaseReady && (
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

      {isSupabaseReady && error && (
        <div
          className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg"
          role="alert"
        >
          {error}
        </div>
      )}

      {isSupabaseReady && isLoading && (
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

      {isSupabaseReady && !isLoading && !error && entries.length === 0 && (
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

      {isSupabaseReady && !isLoading && !error && entries.length > 0 && (
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
