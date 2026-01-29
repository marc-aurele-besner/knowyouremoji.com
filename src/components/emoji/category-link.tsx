import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Category display names mapping
 */
const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  faces: 'Smileys & Faces',
  people: 'People & Body',
  animals: 'Animals & Nature',
  food: 'Food & Drink',
  travel: 'Travel & Places',
  activities: 'Activities',
  objects: 'Objects',
  symbols: 'Symbols',
  flags: 'Flags',
};

/**
 * Get display name for a category
 */
function getCategoryDisplayName(category: string): string {
  return CATEGORY_DISPLAY_NAMES[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

/**
 * Props for the CategoryLink component
 */
export interface CategoryLinkProps {
  /** Category slug */
  category: string;
  /** Additional CSS class names */
  className?: string;
  /** Whether to show the folder icon (default: true) */
  showIcon?: boolean;
}

/**
 * Folder icon component for category links
 */
function FolderIcon({ className }: { className?: string }) {
  return (
    <svg
      data-testid="category-icon"
      className={cn('w-4 h-4', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/**
 * CategoryLink displays a link to an emoji category page.
 * Used throughout the site to allow users to explore emojis by category.
 *
 * @example
 * ```tsx
 * <CategoryLink category="faces" />
 * <CategoryLink category="animals" showIcon={false} />
 * ```
 */
export function CategoryLink({ category, className, showIcon = true }: CategoryLinkProps) {
  const displayName = getCategoryDisplayName(category);

  return (
    <Link
      href={`/emoji/category/${category}`}
      className={cn(
        'inline-flex items-center gap-1.5 text-primary dark:text-primary hover:underline',
        className
      )}
    >
      {showIcon && <FolderIcon />}
      <span>{displayName}</span>
    </Link>
  );
}
