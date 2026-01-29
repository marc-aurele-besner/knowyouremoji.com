'use client';

import { useState, useCallback, type ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Props for the EmojiLink component
 */
export interface EmojiLinkProps {
  /** The emoji character to display */
  emoji: string;
  /** Optional name for the emoji (used in aria-label and tooltip) */
  name?: string;
  /** Slug for linking to emoji detail page (if available) */
  slug?: string;
  /** Whether to show a tooltip preview on hover */
  showPreview?: boolean;
  /** Callback when the link is clicked (for analytics tracking) */
  onLinkClick?: (emoji: string, slug: string) => void;
  /** Additional CSS classes */
  className?: string;
  /** Optional children to render instead of the emoji */
  children?: ReactNode;
}

/**
 * EmojiLink component renders an emoji that links to its detail page.
 * Shows a tooltip preview on hover when `showPreview` is true.
 * Falls back to a non-clickable span when no slug is provided.
 *
 * @example
 * ```tsx
 * // Basic usage with link
 * <EmojiLink emoji="👋" slug="waving-hand" name="Waving Hand" />
 *
 * // With tooltip preview
 * <EmojiLink emoji="👋" slug="waving-hand" name="Waving Hand" showPreview />
 *
 * // With analytics tracking
 * <EmojiLink
 *   emoji="👋"
 *   slug="waving-hand"
 *   onLinkClick={(emoji, slug) => trackEmojiClick(emoji, slug)}
 * />
 *
 * // Without link (no slug)
 * <EmojiLink emoji="👋" name="Waving Hand" />
 * ```
 */
export function EmojiLink({
  emoji,
  name,
  slug,
  showPreview = false,
  onLinkClick,
  className,
  children,
}: EmojiLinkProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = useCallback(() => {
    if (onLinkClick && slug) {
      onLinkClick(emoji, slug);
    }
  }, [onLinkClick, emoji, slug]);

  const handleMouseEnter = useCallback(() => {
    if (showPreview && slug) {
      setShowTooltip(true);
    }
  }, [showPreview, slug]);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  const handleFocus = useCallback(() => {
    if (showPreview && slug) {
      setShowTooltip(true);
    }
  }, [showPreview, slug]);

  const handleBlur = useCallback(() => {
    setShowTooltip(false);
  }, []);

  const ariaLabel = name ? `View details for ${name}` : `View details for ${emoji}`;

  const content = children || emoji;

  // If no slug is provided, render as a plain span
  if (!slug) {
    return (
      <span
        data-testid="emoji-link"
        className={cn('text-inherit', className)}
        aria-label={name || emoji}
      >
        {content}
      </span>
    );
  }

  return (
    <span className="relative inline-block">
      <Link
        href={`/emoji/${slug}`}
        data-testid="emoji-link"
        data-slug={slug}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          'inline-block cursor-pointer',
          'hover:scale-110 transition-transform',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 rounded',
          className
        )}
        aria-label={ariaLabel}
      >
        {content}
      </Link>
      {showTooltip && name && (
        <span
          role="tooltip"
          className={cn(
            'absolute z-10 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-lg',
            'whitespace-nowrap',
            '-top-8 left-1/2 -translate-x-1/2',
            'animate-fadeIn'
          )}
        >
          {name}
          <span
            className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"
            aria-hidden="true"
          />
        </span>
      )}
    </span>
  );
}
