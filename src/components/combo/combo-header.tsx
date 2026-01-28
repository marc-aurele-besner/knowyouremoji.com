'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  };
  /** Additional CSS class names */
  className?: string;
}

/**
 * ComboHeader component displays the combo emojis together, name,
 * copy button, meaning summary, and category badge.
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
export function ComboHeader({ combo, className }: ComboHeaderProps) {
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
    <header className={cn('flex flex-col items-center text-center py-8 px-4', className)}>
      {/* Combo Emojis */}
      <div className="text-6xl md:text-8xl mb-4 select-none" role="img" aria-label={combo.name}>
        {combo.combo}
      </div>

      {/* Combo Name */}
      <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
        {combo.name}
      </h1>

      {/* Category Badge */}
      <Badge variant="secondary" className="capitalize mb-4">
        {combo.category}
      </Badge>

      {/* Copy Button */}
      <Button
        onClick={handleCopy}
        variant={copied ? 'secondary' : 'primary'}
        size="md"
        aria-label={copied ? 'Copied!' : 'Copy combo'}
        className="mb-6"
      >
        <span className="mr-2">{copied ? '✓' : '📋'}</span>
        {copied ? 'Copied!' : 'Copy Combo'}
      </Button>

      {/* Meaning Summary */}
      {combo.meaning && (
        <p className="text-gray-600 dark:text-gray-400 max-w-xl">{combo.meaning}</p>
      )}
    </header>
  );
}
