'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProbabilityMeter } from './probability-meter';
import { PassiveAggressionMeter } from './passive-aggression-meter';
import type { SharedInterpretation } from '@/lib/share-encoding';

export interface SharedInterpretationViewProps {
  /** The decoded shared interpretation data */
  data: SharedInterpretation;
  /** Additional className */
  className?: string;
}

/**
 * Read-only view of a shared interpretation result.
 * Styled distinctly with a "Shared result" badge.
 */
export function SharedInterpretationView({ data, className }: SharedInterpretationViewProps) {
  const getToneBadgeConfig = (tone: 'positive' | 'neutral' | 'negative') => {
    switch (tone) {
      case 'positive':
        return { className: 'bg-green-100 text-green-800', label: 'Positive' };
      case 'negative':
        return { className: 'bg-red-100 text-red-800', label: 'Negative' };
      case 'neutral':
        return { className: 'bg-gray-100 text-gray-800', label: 'Neutral' };
    }
  };

  const toneBadge = getToneBadgeConfig(data.tone);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Shared Result Badge */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
          Shared Result
        </span>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Interpretation</h2>
            <div className="flex items-center gap-2">
              <span
                data-testid="shared-tone-badge"
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                  toneBadge.className
                )}
              >
                {toneBadge.label}
              </span>
              <span className="text-xs text-gray-500">{data.confidence}% confident</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500 mb-1">Original message</p>
            <p className="text-sm text-gray-700">{data.message}</p>
          </div>
          <p className="text-gray-900">{data.interpretation}</p>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ProbabilityMeter
          label="Sarcasm Probability"
          value={data.sarcasm}
          testId="shared-sarcasm-meter"
          description="Likelihood the message contains sarcasm"
        />
        <PassiveAggressionMeter value={data.passiveAggression} />
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link href="/interpreter">
          <Button size="lg">Try the Interpreter Yourself</Button>
        </Link>
      </div>
    </div>
  );
}
