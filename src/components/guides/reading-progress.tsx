'use client';

/**
 * Reading-progress bar — pinned to the top of the article viewport.
 *
 * A 3px gradient bar that fills as the reader scrolls through the article
 * body. Uses transform: scaleX for cheap paint updates and respects
 * prefers-reduced-motion.
 */

import { useEffect, useRef } from 'react';

export interface ReadingProgressProps {
  /** CSS selector for the article body element to track. */
  targetSelector?: string;
}

export function ReadingProgress({
  targetSelector = '[data-testid="guide-article"]',
}: ReadingProgressProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = ref.current;
    if (!bar) return;

    const target = document.querySelector(targetSelector) as HTMLElement | null;
    if (!target) return;

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const update = () => {
      const rect = target.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const totalScrollable = rect.height - viewportHeight;
      // How far past the article's top we are; negative when above.
      const scrolled = Math.max(0, -rect.top);
      const progress = totalScrollable > 0 ? Math.min(1, scrolled / totalScrollable) : 0;
      bar.style.transform = `scaleX(${progress})`;
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    if (!reduceMotion) {
      bar.style.transition = 'transform 80ms linear';
    }

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [targetSelector]);

  return (
    <div
      ref={ref}
      className="guides-progress"
      role="progressbar"
      aria-label="Reading progress"
      aria-hidden="true"
      data-testid="guide-reading-progress"
    />
  );
}
