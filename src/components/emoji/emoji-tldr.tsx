import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Props for the EmojiTLDR component
 */
export interface EmojiTLDRProps {
  /** The TLDR text summarizing the emoji's real-world usage */
  tldr: string;
  /** The heading level (h2, h3, h4) for proper document hierarchy */
  headingLevel?: 2 | 3 | 4;
  /** Optional action buttons (copy, share) shown at the end of the panel */
  actions?: ReactNode;
  /** Additional CSS class names */
  className?: string;
}

/**
 * EmojiTLDR component displays a quick summary of an emoji's meaning
 * in a visually distinct callout/card style.
 *
 * @example
 * ```tsx
 * <EmojiTLDR
 *   tldr="Used to express 'I'm dead' from laughing or extreme shock/cringe"
 * />
 * ```
 */
export function EmojiTLDR({ tldr, headingLevel = 2, actions, className }: EmojiTLDRProps) {
  const headingId = 'emoji-tldr-heading';

  const HeadingTag = `h${headingLevel}` as const;

  return (
    <aside
      aria-labelledby={headingId}
      className={cn('flex items-start gap-3 rounded-2xl bg-muted p-5 md:px-[22px]', className)}
    >
      <div className="min-w-0 flex-1">
        <HeadingTag id={headingId} className="eyebrow mb-1.5">
          TL;DR
        </HeadingTag>
        <p className="text-base leading-relaxed text-foreground md:text-lg">{tldr}</p>
      </div>
      {actions && <div className="flex flex-none items-center gap-1">{actions}</div>}
    </aside>
  );
}
