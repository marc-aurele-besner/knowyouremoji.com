'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { HistoryEntry } from './history-page';

export interface HistoryDetailViewProps {
  entry: HistoryEntry;
  onClose: () => void;
}

function HistoryDetailView({ entry, onClose }: HistoryDetailViewProps) {
  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
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
    <Card className="border-2 border-purple-200 dark:border-purple-800">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(entry.created_at)}
          </span>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close detail view">
            ✕
          </Button>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
            Original Message
          </h3>
          <p className="text-base font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            {entry.message}
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
            Interpretation
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {entry.interpretation}
          </p>
        </div>

        <div className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {entry.emoji_count} emoji{entry.emoji_count !== 1 ? 's' : ''} detected
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

HistoryDetailView.displayName = 'HistoryDetailView';

export { HistoryDetailView };
