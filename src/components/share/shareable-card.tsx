'use client';

import { useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ShareSection } from './share-section';
import type { SharedInterpretation } from '@/lib/share-encoding';

export interface ShareableCardProps {
  /** The interpretation data to display */
  data: SharedInterpretation;
  /** The shareable URL for this interpretation */
  shareUrl: string;
  /** Additional className */
  className?: string;
}

function getToneConfig(tone: 'positive' | 'neutral' | 'negative') {
  switch (tone) {
    case 'positive':
      return {
        label: 'Positive',
        bgClass: 'bg-green-50',
        textClass: 'text-green-700',
        badgeClass: 'bg-green-100 text-green-800 border-green-200',
        accentClass: 'from-green-400 to-emerald-500',
      };
    case 'negative':
      return {
        label: 'Negative',
        bgClass: 'bg-red-50',
        textClass: 'text-red-700',
        badgeClass: 'bg-red-100 text-red-800 border-red-200',
        accentClass: 'from-red-400 to-rose-500',
      };
    case 'neutral':
      return {
        label: 'Neutral',
        bgClass: 'bg-gray-50',
        textClass: 'text-gray-700',
        badgeClass: 'bg-gray-100 text-gray-800 border-gray-200',
        accentClass: 'from-gray-400 to-slate-500',
      };
  }
}

function MetricBar({ label, value, testId }: { label: string; value: number; testId: string }) {
  const getBarColor = (val: number) => {
    if (val >= 70) return 'bg-red-400';
    if (val >= 40) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  return (
    <div data-testid={testId} className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-800">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', getBarColor(value))}
          style={{ width: `${value}%` }}
          role="meter"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${value}%`}
        />
      </div>
    </div>
  );
}

/**
 * A visually styled, branded card for sharing interpretation results.
 * Designed to be screenshot-worthy and shareable on social media.
 */
export function ShareableCard({ data, shareUrl, className }: ShareableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const toneConfig = getToneConfig(data.tone);

  const handleCopyAsText = useCallback(async () => {
    const text = `Message: "${data.message}"\n\nInterpretation: ${data.interpretation}\n\nTone: ${toneConfig.label} | Confidence: ${data.confidence}%\nSarcasm: ${data.sarcasm}% | Passive-aggression: ${data.passiveAggression}%\n\n🔍 Try it yourself: ${shareUrl}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback handled by parent
    }
  }, [data, toneConfig.label, shareUrl]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* The visual card */}
      <div
        ref={cardRef}
        data-testid="shareable-card"
        className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg"
      >
        {/* Gradient accent bar */}
        <div
          data-testid="shareable-card-accent"
          className={cn('h-2 w-full bg-gradient-to-r', toneConfig.accentClass)}
        />

        <div className="p-6 space-y-5">
          {/* Header with branding */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold" aria-hidden="true">
                🔍
              </span>
              <span className="text-sm font-semibold text-gray-800">KnowYourEmoji</span>
            </div>
            <span
              data-testid="shareable-card-tone-badge"
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                toneConfig.badgeClass
              )}
            >
              {toneConfig.label}
            </span>
          </div>

          {/* Original message */}
          <div className={cn('rounded-xl p-4', toneConfig.bgClass)}>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Original Message</p>
            <p className={cn('text-base font-medium', toneConfig.textClass)}>
              &ldquo;{data.message}&rdquo;
            </p>
          </div>

          {/* Interpretation */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">What it really means</p>
            <p className="text-gray-900 leading-relaxed">{data.interpretation}</p>
          </div>

          {/* Metrics row */}
          <div className="grid grid-cols-2 gap-4">
            <MetricBar label="Sarcasm" value={data.sarcasm} testId="shareable-card-sarcasm" />
            <MetricBar
              label="Passive-aggression"
              value={data.passiveAggression}
              testId="shareable-card-passive-aggression"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-xs text-gray-400">knowyouremoji.com</span>
            <span className="text-xs font-medium text-gray-600">{data.confidence}% confidence</span>
          </div>
        </div>
      </div>

      {/* Share actions below the card */}
      <div data-testid="shareable-card-actions" className="flex items-center justify-between">
        <button
          onClick={handleCopyAsText}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Copy interpretation as text"
        >
          Copy as text
        </button>
        <ShareSection
          url={shareUrl}
          title={`Emoji Interpretation: "${data.message.slice(0, 50)}${data.message.length > 50 ? '...' : ''}"`}
          description={data.interpretation.slice(0, 200)}
          contentType="interpretation"
        />
      </div>
    </div>
  );
}
