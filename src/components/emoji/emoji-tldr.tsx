import { cn } from '@/lib/utils';

/**
 * Props for the EmojiTLDR component
 */
export interface EmojiTLDRProps {
  /** The TLDR text summarizing the emoji's real-world usage */
  tldr: string;
  /** The heading level (h2, h3, h4) for proper document hierarchy */
  headingLevel?: 2 | 3 | 4;
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
export function EmojiTLDR({ tldr, headingLevel = 2, className }: EmojiTLDRProps) {
  const headingId = 'emoji-tldr-heading';

  const HeadingTag = `h${headingLevel}` as const;

  return (
    <aside
      aria-labelledby={headingId}
      className={cn(
        'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800',
        'rounded-lg p-4 md:p-6',
        className
      )}
    >
      <HeadingTag
        id={headingId}
        className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2"
      >
        TL;DR
      </HeadingTag>
      <p className="text-gray-900 dark:text-gray-100 text-base md:text-lg leading-relaxed">
        {tldr}
      </p>
    </aside>
  );
}
