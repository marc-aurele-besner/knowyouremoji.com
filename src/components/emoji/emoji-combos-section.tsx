import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Combo data containing this emoji
 */
export interface ComboWithEmoji {
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
 * Props for the EmojiCombosSection component
 */
export interface EmojiCombosSectionProps {
  /** Array of combos containing this emoji */
  combos: ComboWithEmoji[];
  /** Section title */
  title?: string;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Individual combo card component
 */
function ComboCard({ combo }: { combo: ComboWithEmoji }) {
  return (
    <Link
      href={`/combo/${combo.slug}`}
      className={cn(
        'flex h-full flex-col gap-2 rounded-2xl border border-card-border bg-card p-4 text-foreground emoji-card-hover',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background'
      )}
      aria-label={`${combo.name} combo`}
    >
      <span className="emoji-display text-[32px] tracking-[4px]" aria-hidden="true">
        {combo.combo}
      </span>
      <h3 className="truncate text-[14.5px] font-semibold text-foreground">{combo.name}</h3>
      <p className="line-clamp-2 text-[13px] leading-snug text-muted-foreground">{combo.meaning}</p>
    </Link>
  );
}

/**
 * EmojiCombosSection displays emoji combos that contain the current emoji.
 * Shown on emoji detail pages to help users discover related combo meanings.
 *
 * @example
 * ```tsx
 * <EmojiCombosSection
 *   title="Combos with 💀"
 *   combos={[
 *     { slug: 'skull-laughing', combo: '💀😂', name: 'Dead Laughing', meaning: 'So funny' },
 *   ]}
 * />
 * ```
 */
export function EmojiCombosSection({
  combos,
  title = 'Combos with this emoji',
  className,
}: EmojiCombosSectionProps) {
  if (combos.length === 0) {
    return null;
  }

  return (
    <section
      className={cn('mt-14', className)}
      aria-labelledby="emoji-combos-heading"
      role="region"
    >
      <h2
        id="emoji-combos-heading"
        className="mb-5 text-2xl font-semibold tracking-tight text-foreground"
      >
        {title}
      </h2>

      <ul
        role="list"
        className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-3"
      >
        {combos.map((combo) => (
          <li key={combo.slug}>
            <ComboCard combo={combo} />
          </li>
        ))}
      </ul>
    </section>
  );
}
