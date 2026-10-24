import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface ComboCategoryChip {
  slug: string;
  displayName: string;
  comboCount: number;
}

export interface ComboCategoryChipsProps {
  categories: ComboCategoryChip[];
  /** Total combo count shown on the "All" chip */
  totalCount: number;
  /** Slug of the active category; omit on the "All" page */
  activeSlug?: string;
  className?: string;
}

const chipBase =
  'inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500';
const chipIdle = 'border-card-border bg-card text-foreground hover:border-gray-400';
const chipActive = 'border-foreground bg-foreground text-background';

/**
 * Category filter chips for the combo browse and category pages. Each chip
 * is a link to the category page with the combo count beside its name.
 */
export function ComboCategoryChips({
  categories,
  totalCount,
  activeSlug,
  className,
}: ComboCategoryChipsProps) {
  return (
    <nav aria-label="Combo categories" className={cn('flex flex-wrap gap-2', className)}>
      <Link
        href="/combo"
        aria-current={activeSlug ? undefined : 'page'}
        className={cn(chipBase, activeSlug ? chipIdle : chipActive)}
      >
        All
        <span className="text-xs opacity-70">{totalCount}</span>
      </Link>
      {categories.map((category) => {
        const active = category.slug === activeSlug;
        return (
          <Link
            key={category.slug}
            href={`/combo/category/${category.slug}`}
            aria-current={active ? 'page' : undefined}
            className={cn(chipBase, active ? chipActive : chipIdle)}
          >
            {category.displayName}
            <span className="text-xs opacity-70">{category.comboCount}</span>
          </Link>
        );
      })}
    </nav>
  );
}
