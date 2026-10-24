import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Minimal combo data needed to render a card.
 */
export interface ComboCardData {
  /** URL-friendly identifier */
  slug: string;
  /** The emoji combination string */
  combo: string;
  /** Display name of the combo */
  name: string;
  /** What this combo means */
  meaning: string;
}

/**
 * Props for the ComboCard component
 */
export interface ComboCardProps {
  combo: ComboCardData;
  /** Optional category label rendered as a badge under the meaning */
  categoryLabel?: string;
  /** Accessible name for the link (defaults to the combo name) */
  ariaLabel?: string;
  /** Heading level used for the combo name (defaults to h3) */
  headingLevel?: 'h2' | 'h3';
  /** Additional CSS class names */
  className?: string;
}

/**
 * ComboCard — the shared combo tile used by the combo browse/category pages,
 * related combos and search results: big combo glyph, name, clamped meaning
 * and an optional category badge.
 */
export function ComboCard({
  combo,
  categoryLabel,
  ariaLabel,
  headingLevel: Heading = 'h3',
  className,
}: ComboCardProps) {
  return (
    <Link
      href={`/combo/${combo.slug}`}
      aria-label={ariaLabel ?? combo.name}
      data-testid="combo-card"
      className={cn(
        'flex h-full flex-col gap-2 rounded-2xl border border-card-border bg-card p-[18px] text-foreground',
        'transition-[border-color,box-shadow] duration-150 hover:border-primary-500/60 hover:shadow-soft',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        className
      )}
    >
      <span className="emoji-display text-[34px] leading-tight tracking-[4px]" aria-hidden="true">
        {combo.combo}
      </span>
      <Heading className="text-[15px] font-semibold leading-snug">{combo.name}</Heading>
      <p className="line-clamp-3 text-[13.5px] leading-relaxed text-muted-foreground">
        {combo.meaning}
      </p>
      {categoryLabel && (
        <span className="mt-auto self-start rounded-full bg-muted px-2.5 py-0.5 text-[11.5px] font-semibold text-muted-foreground">
          {categoryLabel}
        </span>
      )}
    </Link>
  );
}
