'use client';

import { useState, useCallback, type ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { EmojiComboCategoryName } from '@/types/combo';

/**
 * Props for the ComboHeader component
 */
export interface ComboHeaderProps {
  combo: {
    /** The emoji combination string (e.g., "💀😂") */
    combo: string;
    /** Display name of the combo (e.g., "Dead Laughing") */
    name: string;
    /** What this combo means in context */
    meaning: string;
    /** Category for grouping combos */
    category: EmojiComboCategoryName;
    /** Optional tags rendered as badges beside the category */
    tags?: string[];
  };
  /** Extra actions (e.g. share buttons) rendered next to the copy button */
  actions?: ReactNode;
  /** Optional copy control rendered inside the meaning panel */
  meaningAction?: ReactNode;
  /** Additional CSS class names */
  className?: string;
}

/**
 * ComboHeader component displays the combo hero: a tinted tile with the
 * combo emojis, the name, category/tag badges, copy button and optional
 * actions, followed by the meaning panel.
 *
 * @example
 * ```tsx
 * <ComboHeader
 *   combo={{
 *     combo: '💀😂',
 *     name: 'Dead Laughing',
 *     meaning: 'Something is so funny that you are dead from laughing.',
 *     category: 'humor',
 *   }}
 * />
 * ```
 */
export function ComboHeader({ combo, actions, meaningAction, className }: ComboHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(combo.combo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available, silently fail
    }
  }, [combo.combo]);

  return (
    <header className={cn('text-left', className)}>
      <div className="flex flex-wrap items-center gap-6 md:gap-7">
        {/* Combo Emojis */}
        <div className="flex h-[132px] min-w-[132px] shrink-0 items-center justify-center rounded-[28px] bg-primary-50 px-6">
          <span
            className="emoji-display select-none text-6xl tracking-[6px] md:text-[64px]"
            role="img"
            aria-label={combo.name}
          >
            {combo.combo}
          </span>
        </div>

        <div className="min-w-0 flex-1 basis-64">
          {/* Combo Name */}
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{combo.name}</h1>

          {/* Category + tag badges */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Link
              href={`/combo/category/${combo.category}`}
              className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 font-mono text-xs font-medium capitalize text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              {combo.category}
            </Link>
            {combo.tags?.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 font-mono text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Copy + extra actions */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button
              onClick={handleCopy}
              variant={copied ? 'secondary' : 'primary'}
              size="md"
              aria-label={copied ? 'Copied!' : 'Copy combo'}
            >
              <span className="mr-2" aria-hidden="true">
                {copied ? '✓' : '📋'}
              </span>
              {copied ? 'Copied!' : 'Copy Combo'}
            </Button>
            {actions}
          </div>
        </div>
      </div>

      {/* Meaning panel */}
      {combo.meaning && (
        <div className="mt-7 flex items-start gap-3 rounded-2xl bg-muted px-5 py-5 md:px-[22px]">
          <div className="min-w-0 flex-1">
            <p className="eyebrow mb-1.5">Meaning</p>
            <p className="text-lg leading-normal text-foreground">{combo.meaning}</p>
          </div>
          {meaningAction}
        </div>
      )}
    </header>
  );
}
