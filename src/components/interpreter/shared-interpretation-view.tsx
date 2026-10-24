'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ShareableCard } from '@/components/share/shareable-card';
import { shareEvents } from '@/lib/analytics';
import type { SharedInterpretation } from '@/lib/share-encoding';

export interface SharedInterpretationViewProps {
  /** The decoded shared interpretation data */
  data: SharedInterpretation;
  /** Additional className */
  className?: string;
}

/**
 * Read-only view of a shared interpretation result.
 * Uses the ShareableCard for a visually appealing, branded display.
 * Tracks share views for analytics.
 */
export function SharedInterpretationView({ data, className }: SharedInterpretationViewProps) {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    shareEvents.shareView(shareUrl, 'interpretation');
  }, [shareUrl]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Shared Result Badge */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
          Shared Result
        </span>
      </div>

      {/* Shareable Card */}
      <ShareableCard data={data} shareUrl={shareUrl} />

      {/* CTA */}
      <div className="text-center pt-4">
        <Button asChild size="lg" variant="brand">
          <Link
            href="/interpreter"
            onClick={() => shareEvents.shareConversion(shareUrl, 'interpretation')}
          >
            Try the Interpreter Yourself
          </Link>
        </Button>
      </div>
    </div>
  );
}
