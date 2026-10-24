'use client';

import { Badge } from '@/components/ui/badge';
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

  const emojiLabel = `${entry.emoji_count} emoji${entry.emoji_count !== 1 ? 's' : ''} detected`;

  return (
    <article
      className="space-y-5 bg-card px-4 py-5 sm:px-6"
      aria-label="Interpretation details"
      data-testid="history-detail"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow">Saved interpretation</span>
          <Badge variant="secondary">{emojiLabel}</Badge>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close detail view"
          className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-card-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      <div>
        <h3 className="mb-2 text-[13px] font-semibold text-muted-foreground">Original Message</h3>
        <p className="inline-block max-w-full rounded-2xl rounded-bl-sm bg-muted px-3.5 py-2.5 text-base text-foreground break-words">
          {entry.message}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-card-border bg-card p-3.5">
          <div className="text-xs text-muted-foreground">Emojis</div>
          <div className="mt-1 text-[26px] font-semibold leading-tight tracking-tight text-foreground tabular-nums">
            {entry.emoji_count}
          </div>
        </div>
        <div className="rounded-xl border border-card-border bg-card p-3.5">
          <div className="text-xs text-muted-foreground">Saved</div>
          <div className="mt-1 text-sm font-medium text-foreground">
            {formatDate(entry.created_at)}
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-[13px] font-semibold text-muted-foreground">Interpretation</h3>
        <p className="text-[15px] leading-relaxed text-foreground whitespace-pre-wrap">
          {entry.interpretation}
        </p>
      </div>
    </article>
  );
}

HistoryDetailView.displayName = 'HistoryDetailView';

export { HistoryDetailView };
